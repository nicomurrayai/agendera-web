import { EMAIL, SITE } from './config';
import { FILES, type FileKey, formatARS } from './catalog';

export async function sendEmail(opts: { to: string; subject: string; html: string; idempotencyKey?: string; replyTo?: string }) {
  if (!EMAIL.resendKey) {
    console.warn('[email] RESEND_API_KEY no configurada; no se envió:', opts.subject, '→', opts.to);
    return { skipped: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${EMAIL.resendKey}`,
      'Content-Type': 'application/json',
      ...(opts.idempotencyKey ? { 'Idempotency-Key': opts.idempotencyKey } : {}),
    },
    body: JSON.stringify({ from: EMAIL.from, to: [opts.to], subject: opts.subject, html: opts.html, reply_to: opts.replyTo || SITE.supportEmail }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const wrap = (inner: string) => `<!doctype html><html><body style="margin:0;background:#FBF5EE;font-family:Arial,Helvetica,sans-serif;color:#2A2320">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:#2F4B3A;padding:18px 24px;color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:bold">Agendera</td></tr>
<tr><td style="padding:24px">${inner}</td></tr>
<tr><td style="padding:16px 24px;background:#F6EEE5;font-size:12px;color:#7a6f68">¿Dudas? Respondé este mail o escribinos a ${SITE.supportEmail}.<br>${SITE.seller.name} · CUIT ${SITE.seller.cuit} · ${SITE.seller.address}<br><a href="${SITE.url}/arrepentimiento" style="color:#B4553A">Botón de arrepentimiento</a></td></tr>
</table></td></tr></table></body></html>`;

export function deliveryEmailHtml(opts: { name?: string; orderId: string; amount: number; files: FileKey[]; downloadPageUrl: string }) {
  const list = opts.files.map((f) => `<li style="margin:4px 0">${FILES[f].label}</li>`).join('');
  return wrap(`<p style="font-size:18px;margin:0 0 12px"><b>¡${opts.name ? `${opts.name}, ` : ''}tu compra está confirmada!</b></p>
  <p style="margin:0 0 16px">Ya podés descargar todo. Guardá este mail: el link de descarga no vence.</p>
  <p style="text-align:center;margin:24px 0"><a href="${opts.downloadPageUrl}" style="background:#B4553A;color:#fff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:bold;display:inline-block">Descargar mis archivos</a></p>
  <p style="margin:0 0 6px"><b>Incluye:</b></p><ul style="margin:0 0 16px;padding-left:20px">${list}</ul>
  <p style="margin:0 0 6px"><b>Por dónde empezar:</b> abrí el Manual y seguí el "Plan de 7 días para tu primera venta" (capítulo 12).</p>
  <p style="font-size:13px;color:#7a6f68;margin:16px 0 0">Orden ${opts.orderId} · Total ${formatARS(opts.amount)}.<br>Licencia: podés vender las agendas impresas; no está permitido compartir ni revender los archivos digitales.</p>`);
}

export function regretEmailHtml(opts: { code: string; name: string; email: string; order: string; reason: string }) {
  return wrap(`<p style="font-size:18px;margin:0 0 12px"><b>Recibimos tu solicitud de arrepentimiento</b></p>
  <p>Código de identificación: <b>${opts.code}</b></p>
  <p>Nombre: ${opts.name}<br>Email: ${opts.email}<br>Operación: ${opts.order || '—'}<br>Motivo: ${opts.reason || '—'}</p>
  <p>Vamos a procesar el reembolso por el mismo medio de pago y te avisaremos por este medio.</p>`);
}
