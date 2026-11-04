import { PRICING } from './config';

export const BUMP_IDS = ['ob-turnos', 'ob-docente', 'ob-etiquetas'] as const;
export type BumpId = (typeof BUMP_IDS)[number];
export type ProductId = 'kit' | BumpId | 'up-combo' | 'down-combo';

export type FileKey =
  | 'interiores-a5' | 'interiores-a4' | 'tapas' | 'extras' | 'manual' | 'bonos' | 'calendarios'
  | 'turnos' | 'docente' | 'etiquetas';

// Cada archivo se entrega desde la URL definida en DOWNLOAD_URLS (JSON) — ver scripts/upload-blob.mjs
export const FILES: Record<FileKey, { label: string; zip: string; size: string }> = {
  'interiores-a5': { label: 'Interiores 2027 · A5 (para fotocopiadora o imprenta)', zip: '01-interiores-A5.zip', size: '26 MB' },
  'interiores-a4': { label: 'Interiores 2027 · A4 para imprimir en casa', zip: '01-interiores-A4-imprimir-en-casa.zip', size: '26 MB' },
  tapas: { label: 'Tapas · 40 diseños', zip: '02-tapas.zip', size: '4 MB' },
  extras: { label: 'Hojas extra · 8 estilos', zip: '03-hojas-extra.zip', size: '1 MB' },
  manual: { label: 'Manual: de la primera hoja a la primera venta', zip: '04-manual.zip', size: '0,3 MB' },
  bonos: { label: 'Bonos: Calculadora de costos + Kit de ventas', zip: '05-bonos-calculadora-y-kit-de-ventas.zip', size: '0,3 MB' },
  calendarios: { label: 'Bono: Calendarios 2027 (pared y escritorio)', zip: '06-bono-calendarios-2027.zip', size: '10 MB' },
  turnos: { label: 'Agenda de Turnos 2027 · 8 estilos', zip: 'bump-agenda-de-turnos-2027.zip', size: '51 MB' },
  docente: { label: 'Agenda Docente 2027 · 8 estilos', zip: 'bump-agenda-docente-2027.zip', size: '9 MB' },
  etiquetas: { label: 'Etiquetas escolares y stickers', zip: 'bump-etiquetas-escolares.zip', size: '2 MB' },
};

export type Product = { id: ProductId; name: string; short: string; files: FileKey[]; image?: string; listPrice?: number };

export const PRODUCTS: Record<ProductId, Product> = {
  kit: {
    id: 'kit', name: 'Kit Agendera 2027', short: 'Interiores, tapas, hojas extra, manual y 3 bonos',
    files: ['interiores-a5', 'interiores-a4', 'tapas', 'extras', 'manual', 'bonos', 'calendarios'], image: '/img/hero-kit.jpg',
  },
  'ob-turnos': {
    id: 'ob-turnos', name: 'Agenda de Turnos 2027', short: 'Para manicuras, peluqueras, estéticas y consultorios: grilla cada 30 min, fichas de clientas y control de cobros. 8 estilos.',
    files: ['turnos'], image: '/img/bump-turnos.jpg', listPrice: 3900,
  },
  'ob-docente': {
    id: 'ob-docente', name: 'Agenda Docente 2027', short: 'Planificación anual y mensual, semana con módulos, asistencia, calificaciones y actos escolares. 8 estilos.',
    files: ['docente'], image: '/img/bump-docente.jpg', listPrice: 4900,
  },
  'ob-etiquetas': {
    id: 'ob-etiquetas', name: 'Etiquetas escolares y stickers', short: 'Etiquetas para cuadernos, materias, útiles y libros + stickers. Para la vuelta a clases.',
    files: ['etiquetas'], image: '/img/bump-etiquetas.jpg', listPrice: 2900,
  },
  'up-combo': { id: 'up-combo', name: 'Combo Profesional', short: 'Los productos que todavía no tenés, con descuento', files: [] },
  'down-combo': { id: 'down-combo', name: 'Combo Profesional (última oportunidad)', short: 'El mismo combo a mitad de precio', files: [] },
};

export const isBump = (x: string): x is BumpId => (BUMP_IDS as readonly string[]).includes(x);
const round100 = (n: number) => Math.round(n / 100) * 100;

export function isLaunchPrice(now = new Date()) {
  const until = Date.parse(PRICING.launchUntil);
  return Number.isFinite(until) ? now.getTime() <= until : true;
}
export function frontPrice(now = new Date()) {
  return isLaunchPrice(now) ? PRICING.launch : PRICING.regular;
}
export const bumpPrice = (id: BumpId) => PRODUCTS[id].listPrice!;

export function remainingBumps(owned: string[]): BumpId[] {
  return BUMP_IDS.filter((b) => !owned.includes(b));
}
export function comboPrice(items: BumpId[]) {
  const sum = items.reduce((a, b) => a + bumpPrice(b), 0);
  return round100(sum * (1 - PRICING.comboDiscount));
}
export function downsellPrice(items: BumpId[]) {
  return round100(comboPrice(items) * PRICING.downsellFactor);
}
export const comboListPrice = (items: BumpId[]) => items.reduce((a, b) => a + bumpPrice(b), 0);

// Archivos a los que da derecho un pago, según su metadata.
export function entitlements(products: string[], comboItems: string[] = []): FileKey[] {
  const keys = new Set<FileKey>();
  for (const p of products) {
    if (p === 'up-combo' || p === 'down-combo') comboItems.filter(isBump).forEach((b) => PRODUCTS[b].files.forEach((f) => keys.add(f)));
    else if (p in PRODUCTS) PRODUCTS[p as ProductId].files.forEach((f) => keys.add(f));
  }
  return [...keys];
}

export function downloadUrl(key: FileKey): string | null {
  try {
    const map = JSON.parse(process.env.DOWNLOAD_URLS || '{}') as Record<string, string>;
    return map[key] || map[FILES[key].zip] || null;
  } catch {
    return null;
  }
}

export const formatARS = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
