'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution, track } from '@/lib/client-tracking';

// PageView en cada navegación + captura de UTMs/ad_id/fbclid.
export function Tracking() {
  const pathname = usePathname();
  useEffect(() => { captureAttribution(); }, []);
  useEffect(() => {
    const t = setTimeout(() => { if (window.fbq) window.fbq('track', 'PageView'); }, 50);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

export function TrackOnce({ event, params, eventId }: { event: string; params?: Record<string, unknown>; eventId?: string }) {
  useEffect(() => {
    const key = `ev_${event}_${eventId || ''}`;
    try { if (eventId && sessionStorage.getItem(key)) return; } catch { /* noop */ }
    const t = setTimeout(() => {
      track(event, params, eventId);
      try { if (eventId) sessionStorage.setItem(key, '1'); } catch { /* noop */ }
    }, 400);
    return () => clearTimeout(t);
  }, [event, eventId, params]);
  return null;
}
