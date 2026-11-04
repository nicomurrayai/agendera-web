import { NextResponse, type NextRequest } from 'next/server';
import { verifyDownloadToken } from '@/lib/tokens';
import { getPayment } from '@/lib/mercadopago';
import { paymentProducts } from '@/lib/orders';
import { downloadUrl, FILES, type FileKey } from '@/lib/catalog';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const paymentId = verifyDownloadToken(url.searchParams.get('t'));
  const f = url.searchParams.get('f') as FileKey | null;
  if (!paymentId || !f || !(f in FILES)) return new NextResponse('Link inválido', { status: 403 });

  let payment;
  try { payment = await getPayment(paymentId); } catch { return new NextResponse('No pudimos verificar tu compra. Escribinos.', { status: 502 }); }
  if (payment.status !== 'approved') return new NextResponse('Esta compra no está activa.', { status: 403 });
  if (!paymentProducts(payment).files.includes(f)) return new NextResponse('Este archivo no está incluido en tu compra.', { status: 403 });

  const target = downloadUrl(f);
  if (!target) return new NextResponse('Archivo no disponible todavía. Escribinos y te lo mandamos.', { status: 404 });
  return NextResponse.redirect(target, { status: 302, headers: { 'Cache-Control': 'no-store' } });
}
