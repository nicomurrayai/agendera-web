// Configuración central. Todo lo sensible viene de variables de entorno (ver .env.example).
const env = (k: string, d = '') => (process.env[k] ?? d).trim();
const num = (k: string, d: number) => {
  const v = Number(process.env[k]);
  return Number.isFinite(v) && v > 0 ? v : d;
};

export const SITE = {
  name: 'Agendera',
  url: env(
    'SITE_URL',
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000',
  ).replace(/\/$/, ''),
  supportEmail: env('SUPPORT_EMAIL', 'hola@tudominio.com.ar'),
  whatsapp: env('NEXT_PUBLIC_WHATSAPP'), // formato 549XXXXXXXXXX
  seller: {
    name: env('SELLER_NAME', '[Nombre y apellido o razón social]'),
    cuit: env('SELLER_CUIT', '[CUIT]'),
    address: env('SELLER_ADDRESS', '[Domicilio comercial]'),
  },
  showTestimonials: env('SHOW_TESTIMONIALS') === 'true',
};

export const PRICING = {
  launch: num('FRONT_PRICE_ARS', 9900),
  regular: num('REGULAR_PRICE_ARS', 14900),
  // Fecha real de fin del precio de lanzamiento (ISO con zona horaria). Después rige el precio regular.
  launchUntil: env('LAUNCH_PRICE_UNTIL', '2026-11-30T23:59:59-03:00'),
  comboDiscount: num('COMBO_DISCOUNT', 0.33),
  downsellFactor: num('DOWNSELL_FACTOR', 0.5),
};

export const MP = {
  accessToken: env('MP_ACCESS_TOKEN'),
  webhookSecret: env('MP_WEBHOOK_SECRET'),
  statementDescriptor: env('MP_STATEMENT_DESCRIPTOR', 'AGENDERA'),
  maxInstallments: num('MP_MAX_INSTALLMENTS', 3),
};

export const META = {
  pixelId: env('NEXT_PUBLIC_META_PIXEL_ID'),
  capiToken: env('META_CAPI_TOKEN'),
  testEventCode: env('META_TEST_EVENT_CODE'),
  graphVersion: env('META_GRAPH_VERSION', 'v23.0'),
  adsToken: env('META_ADS_TOKEN'), // token con ads_read para el panel /admin (opcional)
  adAccountId: env('META_AD_ACCOUNT_ID').replace(/^act_/, ''),
};

export const EMAIL = {
  resendKey: env('RESEND_API_KEY'),
  from: env('EMAIL_FROM', 'Agendera <hola@tudominio.com.ar>'),
};

export const SECRETS = {
  download: env('DOWNLOAD_SECRET'),
  admin: env('ADMIN_KEY'),
};

// Costos para el panel (ver docs/05-medicion-escalamiento.md)
export const ECON = {
  mpFee: num('MP_FEE_RATE', 0.0649), // sin IVA
  mpFeeVat: 0.21,
  salesTax: Number(process.env.SALES_TAX_RATE ?? 0),
  adVat: 0.21,
  adProvincial: Number(process.env.AD_PROVINCIAL_RATE ?? 0),
  countPerception: process.env.COUNT_RG5617_AS_COST === 'true',
};

// Modo demo SOLO para desarrollo local sin credenciales (nunca en producción).
export const DEMO = !MP.accessToken && env('ALLOW_DEMO') === 'true' && process.env.NODE_ENV !== 'production';
