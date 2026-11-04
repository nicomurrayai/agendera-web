'use client';
import { useState } from 'react';
import Image from 'next/image';

type Item = { id: string; name: string; short: string; image: string };
const ars = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

// Post-compra (T1): upsell → si lo rechaza, downsell a mitad de precio → si lo rechaza, fin.
export function UpsellFlow({ parentPaymentId, parentOrder, parentSig, items, listPrice, offerPrice, downsellPrice }: { parentPaymentId: string; parentOrder: string; parentSig: string; items: Item[]; listPrice: number; offerPrice: number; downsellPrice: number }) {
  const [step, setStep] = useState<'upsell' | 'downsell' | 'done'>('upsell');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function accept(kind: 'upsell' | 'downsell') {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, parentPaymentId, parentOrder, parentSig }) });
      const j = await res.json();
      if (!res.ok || !j.url) throw new Error(j.error || 'No pudimos abrir el pago');
      window.location.href = j.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error'); setLoading(false);
    }
  }

  if (step === 'done') return <p className="mt-10 rounded-2xl bg-cream p-5 text-center text-muted">¡Perfecto! Empezá por el Manual: el capítulo 12 tiene tu plan de 7 días.</p>;

  const isUp = step === 'upsell';
  const price = isUp ? offerPrice : downsellPrice;
  return (
    <section className="mt-10 rounded-3xl border-2 border-dashed border-terra bg-[#fffaf2] p-5 md:p-8">
      <p className="kicker">{isUp ? 'Antes de irte: oferta solo en esta página' : 'Última oportunidad'}</p>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-forest">{isUp ? `Sumá ${items.length > 1 ? 'el Combo Profesional' : items[0].name} y vendé a más clientes` : `Te lo dejamos a mitad de precio: ${ars(price)}`}</h2>
      <p className="mt-2 text-muted">{isUp ? 'Docentes y profesionales con turnos compran agenda todos los años. Con esto tenés un producto específico para cada una.' : 'Mismo contenido, mismo acceso inmediato. Esta oferta no vuelve a aparecer.'}</p>
      <div className="mt-5 grid gap-3">
        {items.map((i) => (
          <div key={i.id} className="flex gap-4 rounded-2xl bg-white p-3">
            <Image src={i.image} alt="" width={96} height={72} className="h-[72px] w-24 shrink-0 rounded-lg object-cover" />
            <div><div className="font-semibold">{i.name}</div><div className="text-sm text-muted">{i.short}</div></div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-lg">
        {listPrice > price && <s className="mr-2 text-muted">{ars(listPrice)}</s>}<b className="font-serif text-3xl text-terra">{ars(price)}</b>
      </p>
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} onClick={() => accept(isUp ? 'upsell' : 'downsell')} className="btn-primary mt-4 w-full">{loading ? 'Abriendo Mercado Pago…' : `Sí, sumarlo por ${ars(price)}`}</button>
      <button disabled={loading} onClick={() => setStep(isUp ? 'downsell' : 'done')} className="mt-3 w-full text-center text-sm text-muted underline">No, gracias</button>
    </section>
  );
}
