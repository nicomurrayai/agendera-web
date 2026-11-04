'use client';
// Captura de atribución (UTMs + ad_id + fbclid) y helpers del Pixel. Se guarda el último clic pago (como Utmify).

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ad_id', 'adset_id', 'campaign_id', 'fbclid'] as const;
const LS = 'agendera_attr';

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

function cookie(name: string) {
  return document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.split('=')[1] ?? '';
}

export function captureAttribution() {
  try {
    const qs = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    KEYS.forEach((k) => { const v = qs.get(k); if (v) found[k] = v.slice(0, 200); });
    if (Object.keys(found).length) {
      found.landed_at = new Date().toISOString();
      localStorage.setItem(LS, JSON.stringify(found));
      if (found.fbclid && !cookie('_fbc')) {
        const fbc = `fb.1.${Date.now()}.${found.fbclid}`;
        document.cookie = `_fbc=${fbc}; path=/; max-age=${90 * 86400}; SameSite=Lax`;
      }
    }
  } catch { /* storage bloqueado: seguimos sin atribución */ }
}

export function getAttribution(): Record<string, string> {
  let a: Record<string, string> = {};
  try { a = JSON.parse(localStorage.getItem(LS) || '{}'); } catch { /* noop */ }
  return { ...a, fbp: cookie('_fbp'), fbc: cookie('_fbc') };
}

export function track(event: string, params: Record<string, unknown> = {}, eventID?: string) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', event, params, eventID ? { eventID } : undefined);
}
