import Link from 'next/link';
import { SITE } from '@/lib/config';

export function Footer() {
  return (
    <footer className="border-t border-sand bg-white px-5 py-10 text-sm text-muted">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <div>
          <div className="font-serif text-lg font-bold text-terra">Agendera</div>
          <p className="mt-2">Productos digitales para emprender con papelería.</p>
          <p className="mt-2">{SITE.seller.name} · CUIT {SITE.seller.cuit}<br />{SITE.seller.address}</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/terminos" className="hover:text-ink">Términos y condiciones</Link>
          <Link href="/privacidad" className="hover:text-ink">Política de privacidad</Link>
          <a href={`mailto:${SITE.supportEmail}`} className="hover:text-ink">{SITE.supportEmail}</a>
          {SITE.whatsapp && <a href={`https://wa.me/${SITE.whatsapp}`} className="hover:text-ink">WhatsApp de soporte</a>}
        </nav>
        <div className="flex flex-col gap-3">
          <Link href="/arrepentimiento" className="inline-flex w-fit rounded-full border-2 border-terra px-4 py-2 font-bold text-terra hover:bg-terra hover:text-white">
            Botón de arrepentimiento
          </Link>
          <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            Defensa de las y los Consumidores · Para reclamos ingrese aquí
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl text-xs">Este sitio no forma parte de Meta Platforms, Inc. ni de Facebook/Instagram. Los resultados de venta dependen del trabajo de cada persona; no garantizamos ingresos.</p>
    </footer>
  );
}
