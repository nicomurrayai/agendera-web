'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAttribution, track } from '@/lib/client-tracking';

type Bump = { id: string; name: string; short: string; image: string; price: number };
const ars = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export function CheckoutForm({ front, bumps }: { front: { name: string; short: string; price: number }; bumps: Bump[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const total = useMemo(() => front.price + bumps.filter((b) => selected.includes(b.id)).reduce((a, b) => a + b.price, 0), [selected, bumps, front.price]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'front', bumps: selected, email, name, attribution: getAttribution() }),
      });
      const j = await res.json();
      if (!res.ok || !j.url) throw new Error(j.error || 'No pudimos iniciar el pago.');
      track('InitiateCheckout', { value: j.value, currency: 'ARS', content_ids: ['kit', ...selected], num_items: 1 + selected.length }, j.eventId);
      setTimeout(() => { window.location.href = j.url; }, 250);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5">
      <div className="card flex items-center gap-4 p-4">
        <Image src="/img/hero-kit.jpg" alt="" width={120} height={80} className="h-20 w-28 rounded-xl object-cover" />
        <div className="flex-1"><div className="font-semibold">{front.name}</div><div className="text-sm text-muted">{front.short}</div></div>
        <div className="font-semibold">{ars(front.price)}</div>
      </div>

      <div className="card grid gap-4 p-5">
        <label className="grid gap-1 text-sm font-semibold">Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="given-name" className="rounded-xl border border-sand bg-cream px-4 py-3 text-base font-normal outline-none focus:border-terra" placeholder="Tu nombre" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">Email (ahí te llegan los archivos)
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" className="rounded-xl border border-sand bg-cream px-4 py-3 text-base font-normal outline-none focus:border-terra" placeholder="tu@email.com" />
        </label>
      </div>

      <div>
        <p className="kicker">Sumá a tu pedido (opcional)</p>
        <div className="mt-3 grid gap-3">
          {bumps.map((b) => {
            const on = selected.includes(b.id);
            return (
              <label key={b.id} className={`flex cursor-pointer gap-4 rounded-2xl border-2 border-dashed p-4 transition ${on ? 'border-terra bg-white' : 'border-mustard bg-[#fffaf2]'}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(b.id)} className="mt-1 h-5 w-5 shrink-0 accent-[#b4553a]" />
                <Image src={b.image} alt="" width={96} height={72} className="hidden h-[72px] w-24 shrink-0 rounded-lg object-cover sm:block" />
                <span className="flex-1">
                  <span className="block font-semibold">{on ? '✓ ' : ''}Sí, sumar {b.name} por {ars(b.price)}</span>
                  <span className="mt-1 block text-sm text-muted">{b.short}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between text-lg"><span>Total</span><b>{ars(total)}</b></div>
        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-4 w-full">{loading ? 'Abriendo Mercado Pago…' : 'Completar mi compra'}</button>
        <p className="mt-3 text-center text-xs text-muted">Pago seguro con Mercado Pago: tarjeta de crédito (hasta 3 cuotas), débito o dinero en cuenta. Al continuar aceptás los <Link href="/terminos" className="underline">Términos</Link> y la <Link href="/privacidad" className="underline">Política de privacidad</Link>. Garantía de 7 días.</p>
      </div>
    </form>
  );
}
