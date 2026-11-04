import type { Metadata } from 'next';
import Link from 'next/link';
import { verifyDownloadToken } from '@/lib/tokens';
import { getPayment, type MpPayment } from '@/lib/mercadopago';
import { paymentProducts } from '@/lib/orders';
import { FILES, downloadUrl } from '@/lib/catalog';
import { SITE } from '@/lib/config';

export const metadata: Metadata = { title: 'Mis descargas · Agendera', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Descargas({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const pid = verifyDownloadToken(t);
  let payment: MpPayment | null = null;
  if (pid) { try { payment = await getPayment(pid); } catch { payment = null; } }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-serif text-xl font-bold text-terra">Agendera</Link>
        <div className="card mt-6 p-6 md:p-10">
          {!payment || payment.status !== 'approved' ? (
            <>
              <h1 className="font-serif text-3xl font-semibold text-forest">Link no válido</h1>
              <p className="mt-3 text-muted">Revisá el link del mail de compra. Si el problema sigue, escribinos a {SITE.supportEmail} con el mail con el que compraste.</p>
            </>
          ) : (
            <>
              <p className="kicker">Tus archivos</p>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-forest">Descargas</h1>
              <p className="mt-2 text-muted">Guardá esta página en favoritos: el link no vence. <b>Empezá por el Manual</b> (capítulo 12: plan de 7 días).</p>
              <ul className="mt-6 grid gap-3">
                {paymentProducts(payment).files.map((f) => (
                  <li key={f} className="flex items-center justify-between gap-4 rounded-2xl border border-sand p-4">
                    <div><div className="font-semibold">{FILES[f].label}</div><div className="text-xs text-muted">ZIP · {FILES[f].size}</div></div>
                    {downloadUrl(f)
                      ? <a href={`/api/descargar?t=${t}&f=${f}`} className="shrink-0 rounded-full bg-terra px-4 py-2 text-sm font-bold text-white">Descargar</a>
                      : <span className="shrink-0 text-xs text-muted">Disponible pronto</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted">Los archivos son ZIP: en el celular se abren con la app Archivos (Android) o tocándolos (iPhone). Licencia: podés vender lo impreso; no compartas los archivos.</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
