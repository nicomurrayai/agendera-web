import type { Metadata } from 'next';
import Link from 'next/link';
import { getPayment, metaList, type MpPayment } from '@/lib/mercadopago';
import { signDownloadToken, verifyOrder } from '@/lib/tokens';
import { PRODUCTS, remainingBumps, comboPrice, comboListPrice, downsellPrice, formatARS } from '@/lib/catalog';
import { productNames } from '@/lib/orders';
import { TrackOnce } from '@/components/Tracking';
import { UpsellFlow } from '@/components/UpsellFlow';
import { SITE } from '@/lib/config';

export const metadata: Metadata = { title: 'Gracias por tu compra · Agendera', robots: { index: false } };
export const dynamic = 'force-dynamic';

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Gracias({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const pid = String(sp.payment_id || sp.collection_id || '');
  let payment: MpPayment | null = null;
  const order = String(sp.o || ''), osig = String(sp.s || '');
  if (pid && pid !== 'null' && verifyOrder(order, osig)) {
    try { payment = await getPayment(pid); } catch { payment = null; }
    // el pago tiene que corresponder a la orden firmada (no alcanza con adivinar un payment_id)
    if (payment && String(payment.external_reference || '') !== order) payment = null;
  }

  if (!payment) {
    return (
      <Shell>
        <h1 className="font-serif text-3xl font-semibold text-forest">No encontramos tu pago</h1>
        <p className="mt-3 text-muted">Si el pago se aprobó, en unos minutos te llega un mail con los archivos. Si no te llega, escribinos a {SITE.supportEmail}.</p>
        <Link href="/checkout" className="btn-primary mt-6">Volver al checkout</Link>
      </Shell>
    );
  }

  if (payment.status === 'pending' || payment.status === 'in_process') {
    return (
      <Shell>
        <h1 className="font-serif text-3xl font-semibold text-forest">Tu pago está en proceso</h1>
        <p className="mt-3 text-muted">Apenas Mercado Pago lo acredite te mandamos un mail a <b>{String(payment.metadata?.email || payment.payer?.email || 'tu casilla')}</b> con los links de descarga. Si pagaste en efectivo, puede demorar hasta 2 días hábiles.</p>
      </Shell>
    );
  }

  if (payment.status !== 'approved') {
    return (
      <Shell>
        <h1 className="font-serif text-3xl font-semibold text-forest">El pago no se aprobó</h1>
        <p className="mt-3 text-muted">No se realizó ningún cobro. Podés intentar de nuevo con otro medio de pago.</p>
        <Link href="/checkout" className="btn-primary mt-6">Intentar de nuevo</Link>
      </Shell>
    );
  }

  const kind = String(payment.metadata?.kind || 'front');
  const owned = metaList(payment.metadata?.products);
  const remaining = kind === 'front' ? remainingBumps(owned) : [];
  const token = signDownloadToken(payment.id);
  const email = String(payment.metadata?.email || payment.payer?.email || '');
  const parentToken = payment.metadata?.parent_payment ? signDownloadToken(String(payment.metadata.parent_payment)) : null;

  return (
    <Shell>
      <TrackOnce event="Purchase" eventId={`purchase_${payment.id}`} params={{ value: payment.transaction_amount, currency: 'ARS', content_ids: owned, content_type: 'product' }} />
      <p className="kicker">Compra confirmada</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-forest md:text-4xl">{kind === 'front' ? '¡Gracias por tu compra!' : '¡Listo, lo sumamos a tu pedido!'}</h1>
      <p className="mt-3 text-muted">Ya podés descargar todo. También te lo mandamos a <b>{email}</b> (revisá Promociones o Spam).</p>
      <ul className="mt-4 grid gap-1 text-sm">{productNames(payment).map((n) => <li key={n}>✓ {n}</li>)}</ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={`/descargas?t=${token}`} className="btn-primary">Ir a mis descargas</Link>
        {parentToken && <Link href={`/descargas?t=${parentToken}`} className="rounded-full border-2 border-forest px-6 py-3 text-center font-semibold text-forest">Descargas de mi primera compra</Link>}
      </div>

      {remaining.length > 0 && (
        <UpsellFlow
          parentPaymentId={String(payment.id)}
          parentOrder={order}
          parentSig={osig}
          items={remaining.map((b) => ({ id: b, name: PRODUCTS[b].name, short: PRODUCTS[b].short, image: PRODUCTS[b].image! }))}
          listPrice={comboListPrice(remaining)}
          offerPrice={comboPrice(remaining)}
          downsellPrice={downsellPrice(remaining)}
        />
      )}
      <p className="mt-10 text-xs text-muted">Orden {String(payment.metadata?.order_id || payment.external_reference || payment.id)} · {formatARS(payment.transaction_amount)}</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-serif text-xl font-bold text-terra">Agendera</Link>
        <div className="card mt-6 p-6 md:p-10">{children}</div>
      </div>
    </main>
  );
}
