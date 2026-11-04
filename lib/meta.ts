import crypto from 'node:crypto';
import { META, SITE } from './config';

const sha = (v?: string | null) => (v ? crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : undefined);

export type CapiEvent = {
  eventName: 'Purchase' | 'InitiateCheckout' | 'Lead';
  eventId: string;
  value?: number;
  contentIds?: string[];
  sourceUrl?: string;
  user: { email?: string; firstName?: string; externalId?: string; ip?: string; ua?: string; fbp?: string; fbc?: string };
  custom?: Record<string, string | number>;
};

// Conversions API: deduplica con el Pixel usando el mismo event_id.
export async function sendCapi(ev: CapiEvent) {
  if (!META.pixelId || !META.capiToken) return { skipped: true };
  const body = {
    data: [{
      event_name: ev.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: ev.eventId,
      action_source: 'website',
      event_source_url: ev.sourceUrl || SITE.url,
      user_data: {
        em: ev.user.email ? [sha(ev.user.email)] : undefined,
        fn: ev.user.firstName ? [sha(ev.user.firstName)] : undefined,
        country: [sha('ar')],
        external_id: ev.user.externalId ? [sha(ev.user.externalId)] : undefined,
        client_ip_address: ev.user.ip || undefined,
        client_user_agent: ev.user.ua || undefined,
        fbp: ev.user.fbp || undefined,
        fbc: ev.user.fbc || undefined,
      },
      custom_data: {
        currency: 'ARS',
        value: ev.value,
        content_ids: ev.contentIds,
        content_type: 'product',
        num_items: ev.contentIds?.length,
        ...ev.custom,
      },
    }],
    ...(META.testEventCode ? { test_event_code: META.testEventCode } : {}),
  };
  const res = await fetch(`https://graph.facebook.com/${META.graphVersion}/${META.pixelId}/events?access_token=${encodeURIComponent(META.capiToken)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
  });
  if (!res.ok) console.error('[capi]', res.status, (await res.text()).slice(0, 300));
  return { ok: res.ok };
}

export type AdInsight = { ad_id: string; ad_name: string; adset_name: string; campaign_name: string; spend: number; impressions: number; clicks: number };

// Gasto por anuncio (para el panel /admin). Requiere META_ADS_TOKEN con permiso ads_read.
export async function getAdInsights(since: string, until: string): Promise<AdInsight[] | null> {
  if (!META.adsToken || !META.adAccountId) return null;
  const qs = new URLSearchParams({
    level: 'ad', fields: 'ad_id,ad_name,adset_name,campaign_name,spend,impressions,clicks',
    time_range: JSON.stringify({ since, until }), limit: '500', access_token: META.adsToken,
  });
  const res = await fetch(`https://graph.facebook.com/${META.graphVersion}/act_${META.adAccountId}/insights?${qs}`, { cache: 'no-store' });
  if (!res.ok) { console.error('[insights]', res.status, (await res.text()).slice(0, 300)); return null; }
  const j = (await res.json()) as { data: Record<string, string>[] };
  return j.data.map((r) => ({ ad_id: r.ad_id, ad_name: r.ad_name, adset_name: r.adset_name, campaign_name: r.campaign_name, spend: Number(r.spend || 0), impressions: Number(r.impressions || 0), clicks: Number(r.clicks || 0) }));
}
