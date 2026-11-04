import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/config';

export const metadata: Metadata = { title: 'Términos y condiciones · Agendera' };

export default function Terminos() {
  return (
    <main className="px-4 py-10">
      <article className="card prose-legal mx-auto max-w-3xl p-6 md:p-10">
        <Link href="/" className="font-serif text-xl font-bold text-terra">Agendera</Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-forest">Términos y condiciones</h1>
        <p className="text-sm text-muted">Última actualización: noviembre de 2026.</p>
        <h2>1. Quién vende</h2>
        <p>{SITE.seller.name}, CUIT {SITE.seller.cuit}, con domicilio en {SITE.seller.address} (en adelante, &quot;Agendera&quot;). Contacto: {SITE.supportEmail}.</p>
        <h2>2. Qué se vende</h2>
        <p>Productos digitales descargables (archivos PDF y XLSX): diseños de agendas, tapas, hojas, calendarios, etiquetas y guías. No se envía ningún producto físico.</p>
        <h2>3. Precio y pago</h2>
        <p>Los precios están expresados en pesos argentinos e incluyen los impuestos que correspondan. El pago se procesa a través de Mercado Pago. El precio de lanzamiento rige hasta la fecha indicada en el sitio; después rige el precio regular publicado.</p>
        <h2>4. Entrega</h2>
        <p>Con el pago aprobado se habilitan los enlaces de descarga en el sitio y se envían por correo electrónico al email informado. Los enlaces no vencen mientras la compra esté vigente.</p>
        <h2>5. Licencia de uso</h2>
        <ul>
          <li>Podés imprimir los diseños y vender las agendas, calendarios y productos <b>impresos</b> resultantes, con tu propia marca.</li>
          <li>No podés vender, ceder, compartir, publicar ni distribuir los archivos digitales, total o parcialmente, ni ofrecerlos como plantillas o diseños para descargar.</li>
          <li>Los diseños son propiedad intelectual de Agendera. El incumplimiento de la licencia habilita a dar de baja el acceso y a iniciar las acciones legales que correspondan.</li>
        </ul>
        <h2>6. Garantía y arrepentimiento</h2>
        <p>Ofrecemos garantía de satisfacción de 7 días desde la compra: si el producto no te sirve, te reintegramos el total. Además, podés ejercer el derecho de revocación del art. 34 de la Ley 24.240 dentro de los 10 días corridos mediante el <Link href="/arrepentimiento">Botón de arrepentimiento</Link>. El reembolso se realiza por el mismo medio de pago.</p>
        <h2>7. Resultados</h2>
        <p>Los ejemplos de costos, precios y ganancias son ilustrativos. Los resultados dependen de cada persona: no garantizamos ingresos ni ventas.</p>
        <h2>8. Datos y comunicaciones</h2>
        <p>El tratamiento de datos personales se rige por nuestra <Link href="/privacidad">Política de privacidad</Link>.</p>
        <h2>9. Jurisdicción</h2>
        <p>Se aplican las leyes de la República Argentina. Para reclamos de consumo podés acudir a la autoridad de aplicación de tu jurisdicción o a la Ventanilla Única Federal de Defensa del Consumidor.</p>
      </article>
    </main>
  );
}
