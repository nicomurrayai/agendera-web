'use client';
import { useState } from 'react';

export function RegretForm() {
  const [state, setState] = useState<{ loading?: boolean; code?: string; error?: string }>({});
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState({ loading: true });
    const res = await fetch('/api/arrepentimiento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const j = await res.json();
    setState(res.ok ? { code: j.code } : { error: j.error });
  }
  if (state.code) return <p className="mt-6 rounded-2xl bg-cream p-5">Solicitud registrada. Tu código es <b>{state.code}</b>. Te lo enviamos también por mail.</p>;
  const field = 'rounded-xl border border-sand bg-cream px-4 py-3 text-base font-normal outline-none focus:border-terra';
  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className="grid gap-1 text-sm font-semibold">Nombre y apellido<input name="name" required className={field} /></label>
      <label className="grid gap-1 text-sm font-semibold">Email con el que compraste<input name="email" type="email" required className={field} /></label>
      <label className="grid gap-1 text-sm font-semibold">Número de operación de Mercado Pago u orden (opcional)<input name="order" className={field} /></label>
      <label className="grid gap-1 text-sm font-semibold">Motivo (opcional)<textarea name="reason" rows={3} className={field} /></label>
      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button disabled={state.loading} className="btn-primary">{state.loading ? 'Enviando…' : 'Solicitar arrepentimiento'}</button>
    </form>
  );
}
