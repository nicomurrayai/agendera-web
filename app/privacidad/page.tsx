import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/config';

export const metadata: Metadata = { title: 'Política de privacidad · Agendera' };

export default function Privacidad() {
  return (
    <main className="px-4 py-10">
      <article className="card prose-legal mx-auto max-w-3xl p-6 md:p-10">
        <Link href="/" className="font-serif text-xl font-bold text-terra">Agendera</Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-forest">Política de privacidad</h1>
        <p className="text-sm text-muted">Última actualización: noviembre de 2026.</p>
        <h2>Responsable</h2>
        <p>{SITE.seller.name}, CUIT {SITE.seller.cuit}, {SITE.seller.address}. Contacto: {SITE.supportEmail}.</p>
        <h2>Qué datos usamos y para qué</h2>
        <ul>
          <li><b>Nombre y email</b>: para entregarte los archivos, enviarte el comprobante y responder consultas.</li>
          <li><b>Datos del pago</b>: los procesa Mercado Pago. No vemos ni guardamos los datos de tu tarjeta.</li>
          <li><b>Datos de navegación y publicidad</b>: usamos el Píxel de Meta y la API de Conversiones para medir qué anuncios funcionan. Enviamos tu email cifrado (hash) y datos técnicos (navegador, IP, identificadores de clic).</li>
        </ul>
        <h2>Tus derechos</h2>
        <p>Podés pedir acceso, rectificación o supresión de tus datos escribiendo a {SITE.supportEmail} (Ley 25.326). La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, atiende denuncias y reclamos por incumplimiento de las normas de protección de datos personales.</p>
        <h2>Cookies</h2>
        <p>Usamos cookies propias y de Meta para medir campañas. Podés bloquearlas desde la configuración de tu navegador.</p>
      </article>
    </main>
  );
}
