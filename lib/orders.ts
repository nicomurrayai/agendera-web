import { SITE } from './config';
import { PRODUCTS, entitlements, type BumpId, type ProductId } from './catalog';
import { metaList, type MpPayment } from './mercadopago';
import { signDownloadToken } from './tokens';
import { sendEmail, deliveryEmailHtml } from './email';
import { sendCapi } from './meta';

export const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ad_id', 'adset_id', 'campaign_id', 'fbp', 'fbc'] as const;

export function paymentProducts(p: MpPayment) {
  const products = metaList(p.metadata?.products) as ProductId[];
  const comboItems = metaList(p.metadata?.combo_items) as BumpId[];
  return { products, comboItems, files: entitlements(products, comboItems) };
}

export const downloadPageUrl = (paymentId: string | number) => `${SITE.url}/descargas?t=${signDownloadToken(paymentId)}`;

export function productNames(p: MpPayment) {
  const { products, comboItems } = paymentProducts(p);
  return products.map((id) => (id === 'up-combo' || id === 'down-combo' ? `${PRODUCTS[id].name}: ${comboItems.map((b) => PRODUCTS[b].name).join(' + ')}` : PRODUCTS[id]?.name ?? id));
}

// Se ejecuta desde el webhook. Idempotente: Resend deduplica por Idempotency-Key y Meta por event_id.
export async function processApprovedPayment(p: MpPayment) {
  const m = p.metadata || {};
  const email = String(m.email || p.payer?.email || '');
  const { files, products } = paymentProducts(p);
  const results: Record<string, unknown> = {};
  if (email) {
    results.email = await sendEmail({
      to: email,
      subject: '¡Listo! Acá están tus archivos de Agendera',
      html: deliveryEmailHtml({ name: String(m.name || ''), orderId: String(m.order_id || p.external_reference || p.id), amount: p.transaction_amount, files, downloadPageUrl: downloadPageUrl(p.id) }),
      idempotencyKey: `delivery-${p.id}`,
    });
  }
  results.capi = await sendCapi({
    eventName: 'Purchase',
    eventId: `purchase_${p.id}`,
    value: p.transaction_amount,
    contentIds: products,
    sourceUrl: `${SITE.url}/gracias`,
    user: {
      email, firstName: String(m.name || '').split(' ')[0] || undefined, externalId: String(m.order_id || ''),
      ip: String(m.ip || '') || undefined, ua: String(m.ua || '') || undefined, fbp: String(m.fbp || '') || undefined, fbc: String(m.fbc || '') || undefined,
    },
    custom: { order_id: String(m.order_id || ''), kind: String(m.kind || 'front'), utm_campaign: String(m.utm_campaign || ''), utm_content: String(m.utm_content || '') },
  });
  return results;
}
