// Sube los ZIP de producto/entrega a Vercel Blob y muestra el valor de DOWNLOAD_URLS para pegar en Vercel.
// Uso: BLOB_READ_WRITE_TOKEN=... npm run upload:blob   (token: Vercel → Storage → Blob → .env.local)
import { put } from '@vercel/blob';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(process.argv[2] || '../producto/entrega');
const KEYS = {
  '01-interiores-A5.zip': 'interiores-a5', '01-interiores-A4-imprimir-en-casa.zip': 'interiores-a4', '02-tapas.zip': 'tapas',
  '03-hojas-extra.zip': 'extras', '04-manual.zip': 'manual', '05-bonos-calculadora-y-kit-de-ventas.zip': 'bonos',
  '06-bono-calendarios-2027.zip': 'calendarios', 'bump-agenda-de-turnos-2027.zip': 'turnos', 'bump-agenda-docente-2027.zip': 'docente',
  'bump-etiquetas-escolares.zip': 'etiquetas',
};
if (!process.env.BLOB_READ_WRITE_TOKEN) { console.error('Falta BLOB_READ_WRITE_TOKEN'); process.exit(1); }
const out = {};
for (const [file, key] of Object.entries(KEYS)) {
  const p = path.join(DIR, file);
  if (!fs.existsSync(p)) { console.warn('no encontrado:', p); continue; }
  // addRandomSuffix: URL impredecible (solo se revela después de verificar el pago)
  const blob = await put(`agendera/${file}`, fs.createReadStream(p), { access: 'public', addRandomSuffix: true, multipart: true, contentType: 'application/zip' });
  out[key] = blob.url;
  console.log('✓', key, blob.url);
}
console.log('\nPegá esto en la variable DOWNLOAD_URLS de Vercel:\n');
console.log(JSON.stringify(out));
