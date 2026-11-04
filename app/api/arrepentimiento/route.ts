import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { SITE } from '@/lib/config';
import { sendEmail, regretEmailHtml } from '@/lib/email';

// Botón de arrepentimiento (Res. SCI 424/2020): genera la solicitud y un código de identificación.
export async function POST(req: NextRequest) {
  let b: Record<string, string> = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 }); }
  const clip = (v: unknown, n: number) => String(v ?? '').replace(/[<>]/g, '').slice(0, n).trim();
  const name = clip(b.name, 80), email = clip(b.email, 120).toLowerCase(), order = clip(b.order, 80), reason = clip(b.reason, 500);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: 'Completá nombre y un email válido.' }, { status: 400 });
  const code = `ARR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const html = regretEmailHtml({ code, name, email, order, reason });
  try {
    await sendEmail({ to: SITE.supportEmail, subject: `Solicitud de arrepentimiento ${code}`, html, replyTo: email });
    await sendEmail({ to: email, subject: `Recibimos tu solicitud de arrepentimiento (${code})`, html });
  } catch (e) {
    console.error('[arrepentimiento]', e);
    return NextResponse.json({ error: `No pudimos registrar la solicitud. Escribinos a ${SITE.supportEmail}.` }, { status: 502 });
  }
  return NextResponse.json({ code });
}
