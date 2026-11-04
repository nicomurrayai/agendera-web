import Image from 'next/image';
import Link from 'next/link';
import { PRICING, SITE } from '@/lib/config';
import { frontPrice, isLaunchPrice, formatARS } from '@/lib/catalog';
import { Countdown, StickyCta } from '@/components/ui';
import { Footer } from '@/components/Footer';
import { TrackOnce } from '@/components/Tracking';
import { LandingIcon } from '@/components/LandingIcon';
import { PaymentBrand } from '@/components/PaymentBrand';

export const revalidate = 300;

const VALUE_ITEMS = [
  { t: 'Interiores 2027: diaria, semanal y planner mensual', d: '24 interiores en 8 estilos, con los feriados de Argentina ya marcados. Cada uno en A5 (para la fotocopiadora) y en A4 para imprimir en casa.', v: 9900 },
  { t: '40 diseños de tapa', d: '5 modelos por estilo, frente y contratapa. Uno trae espacio para el nombre: agendas personalizadas.', v: 4900 },
  { t: '112 hojas extra', d: 'Metas, finanzas, hábitos, cumpleaños, contactos, pendientes… para armar ediciones especiales o vender recambios.', v: 2900 },
  { t: 'Manual "De la primera hoja a la primera venta"', d: 'Impresión, papel, armado, encuadernación, costos, precios, dónde vender y plan de 7 días.', v: 4900 },
  { t: 'Bono 1 · Calculadora de costos y precios', d: 'Excel / Google Sheets: cargás tus costos y te da el precio y la ganancia por agenda.', v: 2900 },
  { t: 'Bono 2 · Kit de ventas', d: '30 textos para WhatsApp e Instagram, respuestas a objeciones y mensajes para empresas, docentes y profesionales.', v: 3900 },
  { t: 'Bono 3 · Calendarios 2027', d: 'De pared (A4) y de escritorio, en 8 estilos. Un segundo producto para los mismos clientes.', v: 3900 },
];
const TOTAL_VALUE = VALUE_ITEMS.reduce((a, b) => a + b.v, 0);

const FAQ = [
  ['¿Cómo recibo el kit?', 'Apenas se aprueba el pago te mostramos los links de descarga y te los mandamos por mail. Son archivos PDF (y un Excel) que podés bajar desde el celular o la compu.'],
  ['¿Necesito saber diseñar o usar programas?', 'No. Los archivos ya están listos para imprimir: los abrís y los mandás a imprimir tal cual.'],
  ['No tengo impresora, ¿me sirve?', 'Sí. El manual explica cómo pedirlo en cualquier fotocopiadora o imprenta (archivo A5), qué papel pedir y cuánto suele costar.'],
  ['¿Puedo vender las agendas que imprima?', 'Sí, el kit incluye licencia para vender las agendas impresas con tu marca. Lo que no está permitido es compartir o revender los archivos digitales.'],
  ['¿Qué tamaño queda la agenda?', 'A5 (14,8 × 21 cm), el tamaño estándar de agenda. Los calendarios de pared son A4.'],
  ['¿Los feriados son los de Argentina?', 'Sí: los feriados nacionales 2027 según la Ley 27.399, con los traslados vigentes. Los días turísticos todavía no se publicaron, así que dejamos un espacio para anotarlos.'],
  ['¿Cuánto puedo ganar?', 'Depende de tus costos, tu precio y cuánto vendas: no prometemos ingresos. La calculadora te muestra el costo y la ganancia de cada agenda con tus propios números.'],
  ['¿Cómo pago?', 'Con Mercado Pago: tarjeta de crédito (hasta 3 cuotas), débito o dinero en cuenta. Es un pago único, sin suscripción.'],
  ['¿Y si no me gusta?', 'Tenés 7 días de garantía: si el kit no es para vos, te devolvemos el 100 %. Escribinos o usá el Botón de arrepentimiento.'],
];

export default function Home() {
  const price = frontPrice();
  const launch = isLaunchPrice();
  const until = new Date(PRICING.launchUntil);
  const untilTxt = until.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' });
  const cta = `Quiero mi kit por ${formatARS(price)}`;

  return (
    <main className="landing" id="contenido">
      <TrackOnce event="ViewContent" params={{ content_ids: ['kit'], content_type: 'product', value: price, currency: 'ARS' }} />

      {launch && (
        <div className="announcement">
          <span className="announcement-dot" aria-hidden="true" /> Precio de lanzamiento: <b>{formatARS(price)}</b><span className="hidden sm:inline"> · hasta el {untilTxt}</span><span className="sr-only">; después pasa a {formatARS(PRICING.regular)}</span>
        </div>
      )}

      <header className="site-header">
        <Link href="/" aria-label="Agendera, inicio" className="brand"><LandingIcon name="leaf" />agendera<span className="brand-dot">.</span></Link>
        <nav aria-label="Navegación principal" className="header-nav">
          <a href="#disenos">Los diseños</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#oferta">Qué incluye</a>
        </nav>
        <Link href="/checkout" className="header-cta">Quiero mi kit <LandingIcon name="arrow" /></Link>
      </header>

      {/* 1 · PROMESA */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
            <p className="hero-eyebrow"><span aria-hidden="true" /> UN AÑO NUEVO. ALGO MUY TUYO.</p>
            <h1 id="hero-title">Armá y vendé tus propias<br className="hidden lg:block" /> agendas 2027 <em>desde tu casa.</em></h1>
            <p className="hero-description">
              Tu amor por la papelería puede ser tu próximo emprendimiento. Diseños listos para imprimir y una guía para acompañarte <strong>desde la primera hoja hasta la primera venta.</strong>
            </p>
            <div className="hero-actions">
              <Link href="/checkout" className="btn-primary">{cta}<LandingIcon name="arrow" /></Link>
              <a href="#disenos" className="hero-secondary">Conocé los diseños <LandingIcon name="down" /></a>
            </div>
            <div className="hero-trust">
              <span><LandingIcon name="download" />Descarga inmediata</span>
              <span><LandingIcon name="shield" />7 días de garantía</span>
              <span><LandingIcon name="check" />Pago único</span>
            </div>
            <PaymentBrand />
        </div>
        <figure className="hero-visual">
          <Image src="/img/hero-realista.webp" alt="Representación de agendas anilladas del kit: tapas botánica, terracota y azul, un planner abierto y un lápiz sobre una mesa con luz natural" width={1672} height={941} preload className="hero-photo" sizes="(min-width: 1280px) 1152px, calc(100vw - 40px)" />
          <div className="hero-stamp"><span>Hecho por vos</span><LandingIcon name="leaf" /><span>con tu propia marca</span></div>
          <figcaption className="hero-caption"><span>Tu próxima colección empieza acá.</span><span>Kit digital · Imprimí, armá y vendé</span></figcaption>
        </figure>
      </section>

      <div className="benefits-strip" aria-label="El kit de un vistazo">
        {([
          ['book', '+190 diseños', 'para crear a tu manera'],
          ['leaf', '8 estilos originales', 'una colección muy tuya'],
          ['printer', 'Listos para imprimir', 'en casa o en la fotocopiadora'],
          ['check', 'Licencia comercial', 'vendé con tu propia marca'],
        ] as const).map(([icon, title, description]) => (
          <div key={title} className="benefit"><LandingIcon name={icon} /><div><strong>{title}</strong><span>{description}</span></div></div>
        ))}
      </div>

      {/* 2 · DOLORES */}
      <section className="section story-section">
        <div className="story-layout mx-auto max-w-6xl">
          <div>
            <p className="kicker">De una idea a tu primera agenda</p>
            <h2 className="section-heading mt-4">Las ganas ya las tenés.<br /><em>El primer paso, también.</em></h2>
            <p className="mt-6 max-w-md text-muted leading-relaxed">No necesitás saber diseñar ni tener máquinas. Solo una impresora —o la fotocopiadora del barrio— y ganas de crear algo propio.</p>
            <a href="#como-funciona" className="text-link mt-6">Mirá qué fácil es empezar <LandingIcon name="arrow" /></a>
          </div>
          <div className="story-note">
          <p className="note-label">ESTO ES PARA VOS SI…</p>
          <ul className="mt-5 grid gap-4">
            {[
              'El sueldo no alcanza y querés sumar algo, sin dejar lo que ya hacés.',
              'Ves agendas lindas a precios carísimos y pensás: "esto lo podría hacer yo".',
              'Te encanta la papelería, pero diseñar 365 páginas desde cero te llevaría semanas.',
              'No sabés cuánto cobrar ni a quién venderle.',
              'Te da miedo poner plata en algo que después queda en un cajón.',
            ].map((x) => (
              <li key={x} className="flex gap-3 text-[0.95rem] leading-relaxed"><LandingIcon name="check" className="mt-1 shrink-0 text-terra" />{x}</li>
            ))}
          </ul>
          <p className="note-footer">Vos ponés las ganas. El kit te acompaña con el diseño, el armado y la venta.</p>
          </div>
        </div>
      </section>

      {/* 3 · SEÑALES: VISTA PREVIA */}
      <section className="section designs-section" id="disenos">
        <div className="mx-auto max-w-6xl">
          <p className="kicker text-center">Mirá lo que vas a imprimir</p>
          <h2 className="section-heading mt-3 text-center">Tan lindas como las imaginás.<br /><em>Y hechas por vos.</em></h2>
          <p className="section-intro">Tres formatos para distintas rutinas. Elegí con cuál empezar.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ['/img/interior-semanal.jpg', 'Semanal', 'Semana a la vista en 2 páginas + mes completo y plan mensual. La más vendida.'],
              ['/img/interior-diaria.jpg', 'Diaria', 'Un día por página con horarios, prioridades y notas. La "premium".'],
              ['/img/interior-planner.jpg', 'Planner mensual', 'Mes en 2 páginas con hábitos y finanzas. La más accesible para vender.'],
            ].map(([src, t, d]) => (
              <figure key={t} className="card design-card overflow-hidden">
                <div className="design-image"><Image src={src} alt={`Vista del archivo incluido: interior de agenda ${t}`} width={1400} height={950} className="h-auto w-full" sizes="(min-width: 1200px) 360px, (min-width: 768px) 33vw, 100vw" /></div>
                <figcaption className="p-6"><p className="design-tag">INTERIOR 2027</p><h3 className="mt-2 font-serif text-2xl font-semibold text-forest">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{d}</p></figcaption>
              </figure>
            ))}
          </div>
          <figure className="collection-panel mt-10">
            <div className="collection-photo"><Image src="/img/coleccion-realista.webp" alt="Representación de los ocho estilos de agendas anilladas: Botánica, Terracota, Lavanda, Noche, Girasol, Océano, Pastel y Minimal" width={1536} height={1024} className="h-auto w-full" sizes="(min-width: 1200px) 740px, (min-width: 900px) 65vw, 100vw" /></div>
            <figcaption className="collection-copy">
              <p className="kicker">Una colección, mil posibilidades</p>
              <h3 className="mt-4 font-serif text-3xl text-forest">Un estilo para<br /><em>cada persona.</em></h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">8 estilos originales y 40 diseños de tapa para darle tu impronta a cada agenda.</p>
              <div className="style-swatches" aria-label="Paleta de los ocho estilos">
                {['#698168', '#b66748', '#b2a0cb', '#293656', '#e2bf63', '#589ca0', '#d899a8', '#343634'].map((color) => <span key={color} style={{ backgroundColor: color }} />)}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">Botánica · Terracota · Lavanda · Noche<br />Girasol · Océano · Pastel · Minimal</p>
            </figcaption>
          </figure>
          <p className="image-disclaimer">Imágenes de ambientación ilustrativas. Las vistas de interiores muestran los archivos incluidos. Recibís un kit digital para imprimir; no se envían agendas físicas.</p>
        </div>
      </section>

      {/* 4 · PARA QUIÉN ES */}
      <section className="section audience-section" id="como-funciona">
        <div className="mx-auto max-w-5xl">
          <p className="kicker text-center">Para quién es</p>
          <h2 className="section-heading mt-3 text-center">Empezá con lo que tenés.<br /><em>Creá algo que te encante.</em></h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ['Si buscás un ingreso extra', 'Noviembre a marzo es la temporada de agendas: fiestas, regalos y vuelta a clases.'],
              ['Si te encanta la papelería', 'Convertí tu hobby en un producto con tu marca, sin pasar semanas diseñando.'],
              ['Si sos docente', 'Agendas para vos, para regalar y para vender a colegas. Hay una versión docente opcional.'],
              ['Si tenés fotocopiadora o librería', 'Un producto propio de temporada para tus clientes, sin depender de un proveedor.'],
            ].map(([t, d]) => (
              <div key={t} className="audience-card"><LandingIcon name="leaf" className="text-terra" /><h3 className="mt-4 font-serif text-xl font-semibold text-forest">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{d}</p></div>
            ))}
          </div>
          <div className="steps-grid mt-12">
            {[['1', 'Descargás', 'Elegís formato y estilo entre +190 diseños.'], ['2', 'Imprimís y armás', 'En casa o en la fotocopiadora; anillado en cualquier librería.'], ['3', 'Vendés', 'Con la calculadora de precios y los 30 textos del kit de ventas.']].map(([n, t, d]) => (
              <div key={n} className="step"><span className="step-number">0{n}</span><h3 className="mt-4 font-serif text-2xl text-forest">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · OFERTA */}
      <section className="section" id="oferta">
        <div className="mx-auto max-w-4xl">
          <p className="kicker text-center">Todo lo que recibís hoy</p>
          <h2 className="section-heading mt-3 text-center">Todo para tu primera colección.</h2>
          <p className="section-intro">El Kit Agendera 2027, de principio a fin. Sin armarlo de a partes.</p>
          <div className="card mt-10 divide-y divide-sand">
            {VALUE_ITEMS.map((i) => (
              <div key={i.t} className="offer-item flex items-start justify-between gap-4 p-5 md:p-6">
                <div className="flex gap-4"><span className="offer-check"><LandingIcon name="check" /></span><div><h3 className="font-semibold">{i.t}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{i.d}</p></div></div>
                <div className="shrink-0 text-right text-sm text-muted">Valor<br /><span className="font-semibold text-ink">{formatARS(i.v)}</span></div>
              </div>
            ))}
            <div className="flex items-center justify-between bg-cream p-5 md:p-6"><b>Licencia para vender lo que imprimas</b><span className="text-terra">✓ Incluida</span></div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Image src="/img/bonos.jpg" alt="Manual, kit de ventas y calculadora de costos" width={1400} height={1000} className="card h-auto w-full" sizes="(min-width: 768px) 50vw, 100vw" />
            <Image src="/img/calendarios.jpg" alt="Calendarios 2027 de pared y escritorio" width={1400} height={950} className="card h-auto w-full" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </div>
      </section>

      {/* 6 · PRECIO */}
      <section className="section price-section bg-forest text-white" id="precio">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-mustard">{launch ? 'Precio de lanzamiento' : 'Precio'}</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">Tu próximo comienzo<br /><em>puede ser hoy.</em></h2>
          <p className="mt-4 text-lg opacity-80">Valor de todo por separado: <s>{formatARS(TOTAL_VALUE)}</s></p>
          <p className="mt-1 font-serif text-6xl font-semibold">{formatARS(price)}</p>
          <p className="mt-2 opacity-80">Pago único · Hasta 3 cuotas con tarjeta</p>
          {launch && (
            <div className="mt-6">
              <p className="mb-3 text-sm opacity-90">El precio de lanzamiento termina el {untilTxt} a las 23:59 y pasa a {formatARS(PRICING.regular)}.</p>
              <Countdown until={PRICING.launchUntil} />
            </div>
          )}
          <Link href="/checkout" className="btn-primary mt-8 w-full">{cta}<LandingIcon name="arrow" /></Link>
          <PaymentBrand />
          <p className="mt-3 text-sm opacity-80">Descarga inmediata al aprobarse el pago</p>
          <div className="seller-badge">
            <Image src="/img/mercadolider-platinum.png" alt="MercadoLíder Platinum. ¡Uno de los mejores del sitio! Más de 10 mil ventas, buena atención y entrega a tiempo." width={588} height={251} sizes="(min-width: 768px) 460px, calc(100vw - 40px)" className="seller-badge-image" />
          </div>
        </div>
      </section>

      {/* 7 · HAGAMOS NÚMEROS (prueba lógica, no testimonios) */}
      <section className="section bg-white">
        <div className="mx-auto max-w-4xl">
          <p className="kicker text-center">Hagamos números</p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-forest md:text-4xl">Con la ganancia de una agenda podés recuperar el kit</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[['Costo de una agenda semanal', '$9.212', 'Papel, impresión, tapas plastificadas, anillado, extras, packaging y tu hora de trabajo'], ['Precio de venta sugerido', '$20.300', 'Costo × 2,2, redondeado'], ['Ganancia por agenda', '$11.088', 'Más que lo que cuesta el kit hoy']].map(([t, v, d]) => (
              <div key={t} className="rounded-2xl bg-cream p-6 text-center"><div className="text-sm text-muted">{t}</div><div className="mt-2 font-serif text-4xl font-semibold text-terra">{v}</div><p className="mt-2 text-sm text-muted">{d}</p></div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted">Ejemplo ilustrativo con precios de referencia de fines de 2026. Tus números dependen de tus costos, tu precio y cuánto vendas: no garantizamos ingresos. La calculadora incluida hace la cuenta con tus valores.</p>
        </div>
      </section>

      {/* 8 · GARANTÍA */}
      <section className="section">
        <div className="guarantee-card mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 text-center md:flex-row md:p-10 md:text-left">
          <div className="guarantee-seal"><LandingIcon name="shield" /><span>7 días</span><small>DE GARANTÍA</small></div>
          <div><h2 className="font-serif text-2xl font-semibold text-forest">Garantía de satisfacción de 7 días</h2><p className="mt-2 text-muted">Descargá todo, miralo con calma e imprimí una prueba. Si sentís que no es para vos, escribinos dentro de los 7 días y te devolvemos el 100 % por Mercado Pago. Sin vueltas.</p></div>
        </div>
      </section>

      {/* 9 · FAQ */}
      <section className="section bg-white">
        <div className="mx-auto max-w-3xl">
          <p className="kicker text-center">Antes de dar el primer paso</p>
          <h2 className="section-heading mt-3 text-center">Quizás te estás preguntando…</h2>
          <div className="faq-list mt-10 divide-y divide-sand">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-1 py-6">
                <summary className="flex items-center justify-between gap-4 font-semibold">{q}<span className="chev text-2xl text-terra transition-transform">+</span></summary>
                <p className="mt-3 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · CTA FINAL */}
      <section className="section final-section text-center">
        <LandingIcon name="leaf" className="mx-auto mb-6 h-9 w-9 text-terra" />
        <p className="kicker mb-4">De tus manos, a nuevos comienzos</p>
        <h2 className="section-heading mx-auto max-w-3xl">El próximo año tiene muchas hojas en blanco.<br /><em>Empezá a escribir tu historia.</em></h2>
        <p className="section-intro">Llegá a la temporada con tu propia línea de agendas 2027.</p>
        <Link href="/checkout" className="btn-primary mt-8">{cta}<LandingIcon name="arrow" /></Link>
        <p className="mt-3 text-sm text-muted">¿Dudas? Escribinos a {SITE.supportEmail}</p>
      </section>

      <Footer />
      <StickyCta label={cta} />
    </main>
  );
}
