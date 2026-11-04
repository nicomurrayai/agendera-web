import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="font-serif text-2xl font-bold text-terra">Agendera</div>
      <h1 className="font-serif text-3xl text-forest">Esta página no existe</h1>
      <Link href="/" className="btn-primary">Ir al inicio</Link>
    </main>
  );
}
