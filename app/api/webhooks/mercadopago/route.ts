import { NextResponse, type NextRequest } from 'next/server';
import { MP } from '@/lib/config';
import { getPayment, verifyWebhookSignature } from '@/lib/mercadopago';
import { processApprovedPayment } from '@/lib/orders';

// Webhook de Mercado Pago (topic "payment"). Configurar en Tus integraciones → Webhooks con la URL
// https://TU-DOMINIO/api/webhooks/mercadopago y copiar la clave secreta en MP_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try { body = await req.json(); } catch { /* algunas notificaciones llegan sin body */ }

  const type = body.type || url.searchParams.get('type') || url.searchParams.get('topic');
  const dataId = url.searchParams.get('data.id') || (body.data?.id != null ? String(body.data.id) : null);

  if (MP.webhookSecret) {
    const ok = verifyWebhookSignature({ xSignature: req.headers.get('x-signature'), xRequestId: req.headers.get('x-request-id'), dataId, secret: MP.webhookSecret });
    if (!ok) return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
  } else if (process.env.NODE_ENV === 'production') {
    console.error('[webhook] MP_WEBHOOK_SECRET no configurado: notificación rechazada');
    return NextResponse.json({ error: 'webhook sin configurar' }, { status: 401 });
  }

  if (type !== 'payment' || !dataId) return NextResponse.json({ ignored: true });

  try {
    const payment = await getPayment(dataId);
    if (payment.status === 'approved') {
      const r = await processApprovedPayment(payment);
      return NextResponse.json({ ok: true, status: payment.status, r });
    }
    return NextResponse.json({ ok: true, status: payment.status });
  } catch (e) {
    console.error('[webhook]', e);
    // 500 → Mercado Pago reintenta la notificación
    return NextResponse.json({ error: 'error procesando' }, { status: 500 });
  }
}
