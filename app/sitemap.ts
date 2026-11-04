import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/terminos', '/privacidad', '/arrepentimiento'].map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: 'weekly', priority: p ? 0.3 : 1 }));
}
