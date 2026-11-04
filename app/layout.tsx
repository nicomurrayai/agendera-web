import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import { SITE, META } from '@/lib/config';
import { Tracking } from '@/components/Tracking';

const lora = localFont({ src: './fonts/Lora-Variable.woff2', variable: '--font-lora', display: 'swap', weight: '400 700' });
const inter = localFont({
  src: [
    { path: './fonts/Inter-Regular.woff2', weight: '400' },
    { path: './fonts/Inter-Medium.woff2', weight: '500' },
    { path: './fonts/Inter-SemiBold.woff2', weight: '600' },
    { path: './fonts/Inter-Bold.woff2', weight: '700' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: 'Agendera · Armá y vendé tus propias agendas 2027',
  description: 'Kit con +190 diseños de agendas 2027 listos para imprimir (con feriados de Argentina) + el método para armarlas, ponerles precio y venderlas desde tu casa.',
  openGraph: { title: 'Armá y vendé tus propias agendas 2027', description: 'Diseños listos para imprimir + el método para venderlas.', images: ['/og.jpg'], locale: 'es_AR', type: 'website' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#FBF5EE', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" data-scroll-behavior="smooth" className={`${lora.variable} ${inter.variable}`}>
      <body className="font-sans">
        {META.pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META.pixelId}');`}</Script>
        )}
        <Tracking />
        {children}
      </body>
    </html>
  );
}
