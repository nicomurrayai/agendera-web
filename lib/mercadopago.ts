import crypto from 'node:crypto';
import { MP, DEMO } from './config';

const API = 'https://api.mercadopago.com';

export type MpPayment = {
  id: number | string;
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back' | string;
  status_detail?: string;
  transaction_amount: number;
  currency_id: string;
  date_created?: string;
  date_approved?: string | null;
  external_reference?: string;
  payer?: { email?: string; first_name?: string };
  metadata?: Record<string, string | number | null | undefined>;
  transaction_details?: { net_received_amount?: number };
  fee_details?: { amount: number; type: string }[];
};

async function mp<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!MP.accessToken) throw new Error('Falta MP_ACCESS_TOKEN');
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${MP.accessToken}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

export type PreferenceInput = {
  items: { id: string; title: string; unit_price: number; description?: string }[];
  payer: { email: string; name?: string };
  externalReference: string;
  metadata: Record<string, string | number | null>;
  backUrl: string;
  notificationUrl: string;
};

export async function createPreference(p: PreferenceInput): Promise<{ id: string; init_point: string }> {
  if (DEMO) {
    const total = p.items.reduce((a, i) => a + i.unit_price, 0);
    const demoId = `demo-${Buffer.from(JSON.stringify({ m: p.metadata, t: total, e: p.payer.email })).toString('base64url')}`;
    const u = new URL(p.backUrl); u.searchParams.set('payment_id', demoId); u.searchParams.set('status', 'approved'); u.searchParams.set('external_reference', p.externalReference);
    return { id: demoId, init_point: u.toString() };
  }
  return mp('/checkout/preferences', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': p.externalReference },
    body: JSON.stringify({
      items: p.items.map((i) => ({ ...i, quantity: 1, currency_id: 'ARS', category_id: 'learnings' })),
      payer: { email: p.payer.email, name: p.payer.name },
      external_reference: p.externalReference,
      metadata: Object.fromEntries(Object.entries(p.metadata).filter(([, v]) => v !== null && v !== '')),
      back_urls: { success: p.backUrl, pending: p.backUrl, failure: p.backUrl },
      auto_return: 'approved',
      notification_url: p.notificationUrl,
      statement_descriptor: MP.statementDescriptor,
      binary_mode: false,
      payment_methods: { installments: MP.maxInstallments },
    }),
  });
}

export async function getPayment(id: string): Promise<MpPayment> {
  if (DEMO && id.startsWith('demo-')) {
    const raw = JSON.parse(Buffer.from(id.slice(5), 'base64url').toString()) as { m: Record<string, string>; t: number; e: string };
    return { id, status: 'approved', transaction_amount: raw.t, currency_id: 'ARS', payer: { email: raw.e }, metadata: raw.m, external_reference: raw.m.order_id, date_approved: new Date().toISOString() };
  }
  if (!/^\d+$/.test(id)) throw new Error('payment_id inválido');
  return mp(`/v1/payments/${id}`);
}

export async function searchPayments(beginISO: string, endISO: string, maxPages = 10): Promise<MpPayment[]> {
  const out: MpPayment[] = [];
  for (let page = 0; page < maxPages; page++) {
    const qs = new URLSearchParams({
      sort: 'date_created', criteria: 'desc', range: 'date_created',
      begin_date: beginISO, end_date: endISO, limit: '100', offset: String(page * 100),
    });
    const r = await mp<{ results: MpPayment[]; paging: { total: number } }>(`/v1/payments/search?${qs}`);
    out.push(...r.results);
    if (out.length >= r.paging.total || r.results.length < 100) break;
  }
  return out;
}

/**
 * Valida la firma de un webhook de Mercado Pago.
 * Manifest: id:[data.id];request-id:[x-request-id];ts:[ts]; — HMAC-SHA256 en hex con la clave secreta de la app.
 */
export function verifyWebhookSignature(opts: { xSignature: string | null; xRequestId: string | null; dataId: string | null; secret: string }): boolean {
  const { xSignature, xRequestId, dataId, secret } = opts;
  if (!xSignature || !secret) return false;
  let ts = '', v1 = '';
  for (const part of xSignature.split(',')) {
    const [k, v] = part.split('=').map((s) => s?.trim());
    if (k === 'ts') ts = v ?? '';
    if (k === 'v1') v1 = v ?? '';
  }
  if (!ts || !v1) return false;
  let manifest = '';
  if (dataId) manifest += `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};`;
  if (xRequestId) manifest += `request-id:${xRequestId};`;
  manifest += `ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(expected, 'hex'), b = Buffer.from(v1, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const metaList = (v: unknown) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean);
