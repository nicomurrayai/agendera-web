import crypto from 'node:crypto';
import { SECRETS, DEMO } from './config';

// Token de descarga = base64url(paymentId).firma. No expira: en cada descarga se vuelve a verificar
// en Mercado Pago que el pago siga aprobado (si hay devolución o contracargo, deja de funcionar).
const secret = () => {
  if (SECRETS.download) return SECRETS.download;
  if (DEMO || process.env.NODE_ENV === 'test') return 'demo-secret-no-usar-en-produccion';
  throw new Error('Falta DOWNLOAD_SECRET');
};

const sig = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url').slice(0, 32);

export function signDownloadToken(paymentId: string | number): string {
  const p = Buffer.from(String(paymentId)).toString('base64url');
  return `${p}.${sig(p)}`;
}

export function verifyDownloadToken(token: string | null | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  const [p, s] = token.split('.');
  const expected = sig(p);
  if (!s || s.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
  return Buffer.from(p, 'base64url').toString();
}

export function safeEqual(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest(), hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const newOrderId = () => `AG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// Firma de la orden para la URL de retorno de Mercado Pago (evita que alguien vea /gracias de otro pago adivinando el payment_id).
export const signOrder = (orderId: string) => sig(`order:${orderId}`);
export function verifyOrder(orderId: string | null | undefined, s: string | null | undefined): boolean {
  if (!orderId || !s) return false;
  const expected = signOrder(orderId);
  return s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected));
}
