import { NextResponse, type NextRequest } from 'next/server';
import { MP, SITE, DEMO } from '@/lib/config';
import { PRODUCTS, isBump, frontPrice, bumpPrice, comboPrice, downsellPrice, remainingBumps, type BumpId } from '@/lib/catalog';
import { createPreference, getPayment, metaList } from '@/lib/mercadopago';
import { newOrderId, signOrder, verifyOrder } from '@/lib/tokens';
import { sendCapi } from '@/lib/meta';
import { ATTR_KEYS } from '@/lib/orders';

type Body = { kind?: 'front' | 'upsell' | 'downsell'; bumps?: string[]; email?: string; name?: string; parentPaymentId?: string; parentOrder?: string; parentSig?: string; attribution?: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, n = 120) => String(v ?? '').replace(/[\r\n]/g, ' ').slice(0, n);

export async function POST(req: NextRequest) {
  if (!MP.accessToken && !DEMO) return NextResponse.json({ error: 'El checkout todavía no está configurado (falta MP_ACCESS_TOKEN).' }, { status: 503 });
  let body: Body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 }); }

  const kind = body.kind || 'front';
  const orderId = newOrderId();
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const ua = clip(req.headers.get('user-agent'), 300);
  let items: { id: string; title: string; unit_price: number; description?: string }[] = [];
  let email = '', name = '';
  let products: string[] = [];
  let comboItems: BumpId[] = [];
  let attribution: Record<string, string> = {};
  let parent = '';

  if (kind === 'front') {
    email = clip(body.email, 120).trim().toLowerCase();
    name = clip(body.name, 60).trim();
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Revisá tu email: ahí te mandamos los archivos.' }, { status: 400 });
    const bumps = [...new Set((body.bumps || []).filter(isBump))];
    products = ['kit', ...bumps];
    items = [
      { id: 'kit', title: PRODUCTS.kit.name, unit_price: frontPrice(), description: PRODUCTS.kit.short },
      ...bumps.map((b) => ({ id: b, title: PRODUCTS[b].name, unit_price: bumpPrice(b) })),
    ];
    for (const k of ATTR_KEYS) if (body.attribution?.[k]) attribution[k] = clip(body.attribution[k], 200);
  } else {
    // Upsell / downsell post-compra: se basa en un pago aprobado previo
    parent = clip(body.parentPaymentId, 2000);
    let p;
    try { p = await getPayment(parent); } catch { return NextResponse.json({ error: 'No encontramos tu compra anterior.' }, { status: 400 }); }
    if (!verifyOrder(body.parentOrder, body.parentSig) || String(p.external_reference || '') !== body.parentOrder) return NextResponse.json({ error: 'No encontramos tu compra anterior.' }, { status: 400 });
    if (p.status !== 'approved') return NextResponse.json({ error: 'La compra anterior todavía no está aprobada.' }, { status: 400 });
    const owned = metaList(p.metadata?.products);
    comboItems = remainingBumps(owned);
    if (!comboItems.length) return NextResponse.json({ error: 'Ya tenés todos los productos.' }, { status: 400 });
    const pid = kind === 'upsell' ? 'up-combo' : 'down-combo';
    const price = kind === 'upsell' ? comboPrice(comboItems) : downsellPrice(comboItems);
    products = [pid];
    items = [{ id: pid, title: `${PRODUCTS[pid].name}: ${comboItems.map((b) => PRODUCTS[b].name).join(' + ')}`, unit_price: price }];
    email = String(p.metadata?.email || p.payer?.email || '');
    name = String(p.metadata?.name || '');
    for (const k of ATTR_KEYS) if (p.metadata?.[k]) attribution[k] = String(p.metadata[k]);
  }

  const value = items.reduce((a, i) => a + i.unit_price, 0);
  try {
    const pref = await createPreference({
      items,
      payer: { email, name },
      externalReference: orderId,
      backUrl: `${SITE.url}/gracias?o=${orderId}&s=${signOrder(orderId)}`,
      notificationUrl: `${SITE.url}/api/webhooks/mercadopago?source_news=webhooks`,
      metadata: {
        order_id: orderId, kind, products: products.join(','), combo_items: comboItems.join(','), email, name,
        parent_payment: parent || null, ip: ip || null, ua, ...attribution,
      },
    });
    const eventId = `ic_${orderId}`;
    if (kind === 'front') {
      // CAPI en paralelo: no frena el redirect
      sendCapi({ eventName: 'InitiateCheckout', eventId, value, contentIds: products, sourceUrl: `${SITE.url}/checkout`, user: { email, firstName: name.split(' ')[0], externalId: orderId, ip, ua, fbp: attribution.fbp, fbc: attribution.fbc } }).catch(() => {});
    }
    return NextResponse.json({ url: pref.init_point, orderId, eventId, value });
  } catch (e) {
    console.error('[checkout]', e);
    return NextResponse.json({ error: 'No pudimos iniciar el pago. Probá de nuevo en unos minutos.' }, { status: 502 });
  }
}
