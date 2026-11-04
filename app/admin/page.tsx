import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SECRETS, META } from '@/lib/config';
import { safeEqual } from '@/lib/tokens';
import { searchPayments, metaList, type MpPayment } from '@/lib/mercadopago';
import { getAdInsights, type AdInsight } from '@/lib/meta';
import { BUMP_IDS, PRODUCTS, frontPrice, formatARS } from '@/lib/catalog';
import { economics, surfAction, scaleStatus, SURF_LABEL } from '@/lib/surf';

export const metadata: Metadata = { title: 'Panel · Agendera', robots: { index: false } };
export const dynamic = 'force-dynamic';

const TZ = '-03:00';
const ymd = (d: Date) => new Date(d.getTime() - 3 * 3600_000).toISOString().slice(0, 10); // fecha en Argentina
function rangeFor(key: string) {
  const today = ymd(new Date());
  const shift = (s: string, n: number) => ymd(new Date(Date.parse(`${s}T12:00:00${TZ}`) + n * 86400_000));
  if (key === 'yesterday') return { since: shift(today, -1), until: shift(today, -1) };
  if (key === '7d') return { since: shift(today, -6), until: today };
  if (key === '30d') return { since: shift(today, -29), until: today };
  return { since: today, until: today };
}

type Row = { key: string; name: string; campaign: string; spend: number; sales: number; revenue: number; roasY: number | null };

function aggregate(payments: MpPayment[], insights: AdInsight[] | null) {
  const rows = new Map<string, Row>();
  const get = (key: string, name: string) => {
    if (!rows.has(key)) rows.set(key, { key, name, campaign: '', spend: 0, sales: 0, revenue: 0, roasY: null });
    return rows.get(key)!;
  };
  for (const p of payments) {
    const m = p.metadata || {};
    const key = String(m.ad_id || m.utm_content || '(sin atribución)');
    const r = get(key, String(m.utm_content || key));
    r.revenue += p.transaction_amount;
    if (String(m.kind || 'front') === 'front') r.sales += 1;
    if (!r.campaign && m.utm_campaign) r.campaign = String(m.utm_campaign);
  }
  for (const i of insights || []) {
    const r = rows.get(i.ad_id) || rows.get(i.ad_name) || get(i.ad_id, i.ad_name);
    r.spend += i.spend; r.name = i.ad_name; r.campaign = `${i.campaign_name} › ${i.adset_name}`;
  }
  return [...rows.values()];
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ key?: string; r?: string }> }) {
  const sp = await searchParams;
  if (!SECRETS.admin || !sp.key || !safeEqual(sp.key, SECRETS.admin)) notFound();
  const rk = sp.r || 'today';
  const { since, until } = rangeFor(rk);
  const econ = economics(frontPrice());

  let payments: MpPayment[] = [], error = '';
  try { payments = (await searchPayments(`${since}T00:00:00.000${TZ}`, `${until}T23:59:59.999${TZ}`)).filter((p) => p.status === 'approved'); } catch (e) { error = e instanceof Error ? e.message : String(e); }
  const insights = await getAdInsights(since, until);
  const rows = aggregate(payments, insights);

  if (rk === 'today') {
    const y = rangeFor('yesterday');
    try {
      const yp = (await searchPayments(`${y.since}T00:00:00.000${TZ}`, `${y.until}T23:59:59.999${TZ}`)).filter((p) => p.status === 'approved');
      const yRows = aggregate(yp, await getAdInsights(y.since, y.until));
      for (const r of rows) { const yr = yRows.find((x) => x.key === r.key); r.roasY = yr && yr.spend > 0 ? yr.revenue / yr.spend : null; }
    } catch { /* sin datos de ayer */ }
  }

  const fronts = payments.filter((p) => String(p.metadata?.kind || 'front') === 'front');
  const revenue = payments.reduce((a, p) => a + p.transaction_amount, 0);
  const spend = rows.reduce((a, r) => a + r.spend, 0);
  const rate = (pred: (p: MpPayment) => boolean, base = fronts.length) => (base ? payments.filter(pred).length / base : 0);
  const profit = revenue * econ.netRate - spend * econ.adMultiplier;
  const pct = (n: number) => `${(n * 100).toFixed(1)} %`;

  const kpis: [string, string][] = [
    ['Facturación', formatARS(revenue)], ['Ventas front', String(fronts.length)], ['Ticket promedio', fronts.length ? formatARS(revenue / fronts.length) : '—'],
    ['Gasto Meta', insights ? formatARS(spend) : 'sin conectar'], ['ROAS', spend ? `${(revenue / spend).toFixed(2)}x` : '—'], ['Resultado estimado', insights ? formatARS(profit) : '—'],
    ...BUMP_IDS.map((b) => [`Bump ${PRODUCTS[b].name}`, pct(rate((p) => metaList(p.metadata?.products).includes(b)))] as [string, string]),
    ['Upsell aceptado', pct(rate((p) => p.metadata?.kind === 'upsell'))], ['Downsell aceptado', pct(rate((p) => p.metadata?.kind === 'downsell'))],
  ];

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><div className="font-serif text-xl font-bold text-terra">Agendera · Panel</div><h1 className="font-serif text-2xl font-semibold text-forest">{since === until ? since : `${since} → ${until}`}</h1></div>
          <nav className="flex gap-2 text-sm">{[['today', 'Hoy'], ['yesterday', 'Ayer'], ['7d', '7 días'], ['30d', '30 días']].map(([k, l]) => <a key={k} href={`/admin?key=${encodeURIComponent(sp.key!)}&r=${k}`} className={`rounded-full px-4 py-2 ${k === rk ? 'bg-forest text-white' : 'bg-white'}`}>{l}</a>)}</nav>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Mercado Pago: {error}</p>}
        {!insights && <p className="mt-4 rounded-xl bg-[#fff3d6] p-3 text-sm">Gasto de Meta no conectado: configurá META_ADS_TOKEN y META_AD_ACCOUNT_ID {META.adAccountId ? '(token faltante)' : ''}. Mientras tanto, usá el Tablero de surfeo (Excel).</p>}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {kpis.map(([k, v]) => <div key={k} className="card p-4"><div className="text-xs text-muted">{k}</div><div className="mt-1 text-lg font-semibold">{v}</div></div>)}
        </div>
        <p className="mt-4 text-xs text-muted">ROAS de equilibrio {econ.breakevenRoas.toFixed(2)}x · CPA objetivo {formatARS(econ.cpaTarget)} · CPA máximo (solo front) {formatARS(econ.cpaMaxFront)} · Presupuesto de testeo por anuncio {formatARS(econ.testBudget)}/día · Comisión MP con IVA {pct(econ.mpFee)} · Costo de pauta ×{econ.adMultiplier.toFixed(2)}</p>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-forest text-left text-white"><tr>{['Anuncio', 'Campaña › conjunto', 'Gasto', 'Ventas', 'Facturación', 'ROAS', 'CPA', 'ROAS ayer', 'Acción (surfeo)', 'Escala'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {rows.sort((a, b) => b.spend - a.spend || b.revenue - a.revenue).map((r) => {
                const s = surfAction({ spend: r.spend, sales: r.sales, revenue: r.revenue, roasYesterday: r.roasY, cpaTarget: econ.cpaTarget });
                const sc = scaleStatus(r.sales, s.roas);
                const color = s.action.startsWith('APAGAR') ? 'bg-red-50 text-red-800' : s.action === 'DUPLICAR' ? 'bg-green-50 text-green-800' : s.action === 'BAJAR_50' ? 'bg-amber-50 text-amber-800' : '';
                return (
                  <tr key={r.key} className="border-t border-sand">
                    <td className="px-3 py-2 font-medium">{r.name}</td><td className="px-3 py-2 text-muted">{r.campaign}</td>
                    <td className="px-3 py-2">{formatARS(r.spend)}</td><td className="px-3 py-2">{r.sales}</td><td className="px-3 py-2">{formatARS(r.revenue)}</td>
                    <td className="px-3 py-2">{r.spend ? `${s.roas.toFixed(2)}x` : '—'}</td><td className="px-3 py-2">{r.sales ? formatARS(r.spend / r.sales) : '—'}</td>
                    <td className="px-3 py-2">{r.roasY == null ? '—' : `${r.roasY.toFixed(2)}x`}</td>
                    <td className={`px-3 py-2 font-semibold ${color}`}>{SURF_LABEL[s.action]}</td>
                    <td className="px-3 py-2">{sc === 'WINNER' ? 'Winner → Bid Cap' : sc === 'ESCALAR' ? 'CBO 1-3-1 / 1-8-1 / Cost Cap' : ''}</td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={10} className="px-3 py-8 text-center text-muted">Sin datos en el período.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Ventas = compras del front atribuidas por ad_id/utm_content (último clic). Facturación incluye bumps, upsells y downsells. Los datos de Meta pueden demorar ~15 min.</p>
      </div>
    </main>
  );
}
