import Image from 'next/image';
import Link from 'next/link';
import { PRICING, SITE } from '@/lib/config';
import { frontPrice, isLaunchPrice, formatARS } from '@/lib/catalog';
import { Countdown, StickyCta } from '@/components/ui';
import { Footer } from '@/components/Footer';
import { TrackOnce } from '@/components/Tracking';

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
    <main>
      <TrackOnce event="ViewContent" params={{ content_ids: ['kit'], content_type: 'product', value: price, currency: 'ARS' }} />

      {launch && (
        <div className="bg-forest px-4 py-2 text-center text-sm text-white">
          Precio de lanzamiento hasta el <b>{untilTxt}</b> · después pasa a {formatARS(PRICING.regular)}
        </div>
      )}

      {/* 1 · PROMESA */}
      <section className="px-5 pb-14 pt-8 md:px-8 md:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="font-serif text-xl font-bold text-terra">Agendera</div>
            <p className="kicker mt-6">Kit Agendera 2027 · para emprender desde casa</p>
            <h1 className="mt-3 font-serif text-[2.35rem] font-semibold leading-[1.08] text-forest md:text-6xl">Armá y vendé tus propias agendas 2027 desde tu casa</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Con diseños listos para imprimir. <b className="text-ink">No necesitás saber diseñar ni tener máquinas</b>: solo una impresora (o la fotocopiadora del barrio) y ganas de emprender. Te mostramos paso a paso, desde la primera hoja hasta la primera venta.
            </p>
            <ul className="mt-6 grid gap-2 text-[0.98rem]">
              {['+190 diseños en 8 estilos', 'Feriados 2027 de Argentina ya cargados', 'Licencia para vender las agendas impresas', 'Acceso inmediato: lo descargás apenas pagás'].map((x) => (
                <li key={x} className="flex gap-2"><span className="text-terra">✓</span>{x}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-start gap-3">
              <Link href="/checkout" className="btn-primary w-full md:w-auto">{cta}</Link>
              <p className="text-sm text-muted">Pago único con Mercado Pago · Garantía de 7 días</p>
            </div>
          </div>
          <div className="relative">
            <Image src="/img/hero-kit.jpg" alt="Agendas 2027 armadas con el kit: tapas en distintos estilos y la agenda abierta en el planner de marzo" width={1600} height={1060} priority className="h-auto w-full rounded-3xl" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        </div>
      </section>

      {/* 2 · DOLORES */}
      <section className="section bg-white">
        <div className="mx-auto max-w-3xl">
          <p className="kicker text-center">¿Te suena?</p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-forest md:text-4xl">Querés un ingreso extra, pero no sabés por dónde empezar</h2>
          <ul className="mt-10 grid gap-4">
            {[
              'El sueldo no alcanza y querés sumar algo, sin dejar lo que ya hacés.',
              'Ves agendas lindas a precios carísimos y pensás: "esto lo podría hacer yo".',
              'Te encanta la papelería, pero diseñar 365 páginas desde cero te llevaría semanas.',
              'No sabés cuánto cobrar ni a quién venderle.',
              'Te da miedo poner plata en algo que después queda en un cajón.',
            ].map((x) => (
              <li key={x} className="flex gap-3 rounded-2xl bg-cream p-4 text-lg"><span className="mt-0.5 text-terra">●</span>{x}</li>
            ))}
          </ul>
          <p className="mt-8 text-center text-lg">No es solo tu caso: <b>4 de cada 10 argentinos</b> buscan un segundo ingreso porque no les alcanza (Delfos, abril 2026). El Kit Agendera resuelve las tres cosas que frenan: <b>el diseño, el armado y la venta</b>.</p>
        </div>
      </section>

      {/* 3 · SEÑALES: VISTA PREVIA */}
      <section className="section">
        <div className="mx-auto max-w-6xl">
          <p className="kicker text-center">Mirá lo que vas a imprimir</p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-forest md:text-4xl">Agendas que se ven de librería, hechas por vos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ['/img/interior-semanal.jpg', 'Semanal', 'Semana a la vista en 2 páginas + mes completo y plan mensual. La más vendida.'],
              ['/img/interior-diaria.jpg', 'Diaria', 'Un día por página con horarios, prioridades y notas. La "premium".'],
              ['/img/interior-planner.jpg', 'Planner mensual', 'Mes en 2 páginas con hábitos y finanzas. La más accesible para vender.'],
            ].map(([src, t, d]) => (
              <figure key={t} className="card overflow-hidden">
                <Image src={src} alt={`Interior agenda ${t}`} width={1400} height={950} className="h-auto w-full" sizes="(min-width: 768px) 33vw, 100vw" />
                <figcaption className="p-5"><div className="font-serif text-xl font-semibold text-forest">{t}</div><p className="mt-1 text-muted">{d}</p></figcaption>
              </figure>
            ))}
          </div>
          <figure className="card mt-6 overflow-hidden">
            <Image src="/img/estilos.jpg" alt="Los 8 estilos de tapa: Botánica, Terracota, Lavanda, Noche, Girasol, Océano, Pastel y Minimal" width={1600} height={1150} className="h-auto w-full" sizes="100vw" />
            <figcaption className="p-5 text-center text-muted">8 estilos originales para que armes tu propia línea: Botánica, Terracota, Lavanda, Noche, Girasol, Océano, Pastel y Minimal.</figcaption>
          </figure>
        </div>
      </section>

      {/* 4 · PARA QUIÉN ES */}
      <section className="section bg-white">
        <div className="mx-auto max-w-5xl">
          <p className="kicker text-center">Para quién es</p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-forest md:text-4xl">Pensado para emprender con lo que ya tenés</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ['Si buscás un ingreso extra', 'Noviembre a marzo es la temporada de agendas: fiestas, regalos y vuelta a clases.'],
              ['Si te encanta la papelería', 'Convertí tu hobby en un producto con tu marca, sin pasar semanas diseñando.'],
              ['Si sos docente', 'Agendas para vos, para regalar y para vender a colegas. Hay una versión docente opcional.'],
              ['Si tenés fotocopiadora o librería', 'Un producto propio de temporada para tus clientes, sin depender de un proveedor.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-sand p-6"><div className="font-serif text-xl font-semibold text-terra">{t}</div><p className="mt-2 text-muted">{d}</p></div>
            ))}
          </div>
          <div className="mt-10 grid gap-6 rounded-3xl bg-cream p-6 md:grid-cols-3 md:p-10">
            {[['1', 'Descargás', 'Elegís formato y estilo entre +190 diseños.'], ['2', 'Imprimís y armás', 'En casa o en la fotocopiadora; anillado en cualquier librería.'], ['3', 'Vendés', 'Con la calculadora de precios y los 30 textos del kit de ventas.']].map(([n, t, d]) => (
              <div key={n}><div className="flex h-11 w-11 items-center justify-center rounded-full bg-terra font-bold text-white">{n}</div><div className="mt-3 font-serif text-xl font-semibold text-forest">{t}</div><p className="mt-1 text-muted">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · OFERTA */}
      <section className="section" id="oferta">
        <div className="mx-auto max-w-4xl">
          <p className="kicker text-center">Todo lo que recibís hoy</p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-forest md:text-4xl">Kit Agendera 2027</h2>
          <div className="card mt-10 divide-y divide-sand">
            {VALUE_ITEMS.map((i) => (
              <div key={i.t} className="flex items-start justify-between gap-4 p-5 md:p-6">
                <div><div className="font-semibold">{i.t}</div><p className="mt-1 text-sm text-muted">{i.d}</p></div>
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
      <section className="section bg-forest text-white" id="precio">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-mustard">{launch ? 'Precio de lanzamiento' : 'Precio'}</p>
          <p className="mt-4 text-lg opacity-80">Valor de todo por separado: <s>{formatARS(TOTAL_VALUE)}</s></p>
          <p className="mt-1 font-serif text-6xl font-semibold">{formatARS(price)}</p>
          <p className="mt-2 opacity-80">Pago único · Hasta 3 cuotas con tarjeta</p>
          {launch && (
            <div className="mt-6">
              <p className="mb-3 text-sm opacity-90">El precio de lanzamiento termina el {untilTxt} a las 23:59 y pasa a {formatARS(PRICING.regular)}.</p>
              <Countdown until={PRICING.launchUntil} />
            </div>
          )}
          <Link href="/checkout" className="btn-primary mt-8 w-full">{cta}</Link>
          <p className="mt-3 text-sm opacity-80">Pagás con Mercado Pago · Descarga inmediata</p>
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
        <div className="card mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-mustard font-serif text-2xl font-bold text-forest">7 días</div>
          <div><h2 className="font-serif text-2xl font-semibold text-forest">Garantía de satisfacción de 7 días</h2><p className="mt-2 text-muted">Descargá todo, miralo con calma e imprimí una prueba. Si sentís que no es para vos, escribinos dentro de los 7 días y te devolvemos el 100 % por Mercado Pago. Sin vueltas.</p></div>
        </div>
      </section>

      {/* 9 · FAQ */}
      <section className="section bg-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-serif text-3xl font-semibold text-forest md:text-4xl">Preguntas frecuentes</h2>
          <div className="mt-10 divide-y divide-sand rounded-2xl border border-sand">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="flex items-center justify-between gap-4 font-semibold">{q}<span className="chev text-2xl text-terra transition-transform">+</span></summary>
                <p className="mt-3 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · CTA FINAL */}
      <section className="section text-center">
        <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold text-forest md:text-4xl">Llegá a la temporada con tu propia línea de agendas 2027</h2>
        <Link href="/checkout" className="btn-primary mt-8">{cta}</Link>
        <p className="mt-3 text-sm text-muted">¿Dudas? Escribinos a {SITE.supportEmail}</p>
      </section>

      <Footer />
      <StickyCta label={cta} />
    </main>
  );
}
