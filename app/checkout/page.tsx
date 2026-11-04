import type { Metadata } from 'next';
import Link from 'next/link';
import { BUMP_IDS, PRODUCTS, frontPrice, bumpPrice } from '@/lib/catalog';
import { CheckoutForm } from '@/components/CheckoutForm';

export const metadata: Metadata = { title: 'Finalizá tu compra · Agendera', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const bumps = BUMP_IDS.map((id) => ({ id, name: PRODUCTS[id].name, short: PRODUCTS[id].short, image: PRODUCTS[id].image!, price: bumpPrice(id) }));
  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-serif text-xl font-bold text-terra">Agendera</Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-forest">Estás a un paso de tu kit</h1>
        <p className="mt-2 text-muted">Completá tus datos: ahí te mandamos los archivos apenas se apruebe el pago.</p>
        <CheckoutForm front={{ name: PRODUCTS.kit.name, short: PRODUCTS.kit.short, price: frontPrice() }} bumps={bumps} />
      </div>
    </main>
  );
}
