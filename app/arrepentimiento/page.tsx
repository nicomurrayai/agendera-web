import type { Metadata } from 'next';
import Link from 'next/link';
import { RegretForm } from '@/components/RegretForm';

export const metadata: Metadata = { title: 'Botón de arrepentimiento · Agendera' };

export default function Arrepentimiento() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="font-serif text-xl font-bold text-terra">Agendera</Link>
        <div className="card mt-6 p-6 md:p-10">
          <h1 className="font-serif text-3xl font-semibold text-forest">Botón de arrepentimiento</h1>
          <p className="mt-3 text-muted">Podés revocar tu compra dentro de los 10 días corridos desde que la hiciste (Ley 24.240, art. 34, y Res. SCI 424/2020). Además, ofrecemos garantía de satisfacción de 7 días. Completá el formulario: te enviamos por mail un código de identificación de la solicitud y procesamos el reembolso por el mismo medio de pago.</p>
          <RegretForm />
        </div>
      </div>
    </main>
  );
}
