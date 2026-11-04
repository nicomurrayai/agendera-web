import Image from 'next/image';

export function PaymentBrand() {
  return (
    <div className="payment-brand">
      <span>Pagá con</span>
      <Image src="/img/mercado-pago.svg" alt="Mercado Pago" width={124} height={50} unoptimized className="payment-brand-logo" />
      <span className="payment-brand-detail">Hasta 3 cuotas<br />con tarjeta</span>
    </div>
  );
}
