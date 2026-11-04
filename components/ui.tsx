'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Cuenta regresiva hacia una fecha REAL (fin del precio de lanzamiento). No se reinicia.
export function Countdown({ until }: { until: string }) {
  const target = Date.parse(until);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  if (!Number.isFinite(target) || now === null || now > target) return null;
  const s = Math.floor((target - now) / 1000);
  const parts = [[Math.floor(s / 86400), 'días'], [Math.floor((s % 86400) / 3600), 'horas'], [Math.floor((s % 3600) / 60), 'min'], [s % 60, 'seg']] as const;
  return (
    <div className="flex justify-center gap-2" aria-live="off">
      {parts.map(([v, l]) => (
        <div key={l} className="min-w-[3.6rem] rounded-xl bg-forest px-2 py-2 text-center text-white">
          <div className="text-xl font-bold tabular-nums">{String(v).padStart(2, '0')}</div>
          <div className="text-[0.65rem] uppercase tracking-wider opacity-80">{l}</div>
        </div>
      ))}
    </div>
  );
}

export function StickyCta({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-cream/95 p-3 backdrop-blur transition-transform md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}>
      <Link href="/checkout" className="btn-primary w-full">{label}</Link>
    </div>
  );
}
