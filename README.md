# Agendera · web

Landing + checkout con Mercado Pago (ARS) + entrega automática + Pixel/CAPI + panel `/admin` para el **Kit Agendera 2027**.

- Next.js 16 · TypeScript · Tailwind 4 · Vercel
- Flujo: `/` → `/checkout` (order bumps) → Mercado Pago Checkout Pro → `/gracias` (descarga + upsell/downsell) → webhook `/api/webhooks/mercadopago` (firma HMAC → mail Resend + Purchase CAPI) → `/descargas` (token firmado) → `/admin?key=…` (ventas por anuncio + gasto Meta + reglas de surfeo)

## Desarrollo

```bash
npm install
cp .env.example .env.local   # para probar sin Mercado Pago: ALLOW_DEMO=true
npm run dev
npm test
```

Variables: ver `.env.example`. Sin `MP_ACCESS_TOKEN` el checkout responde "todavía no está configurado".
Los archivos del producto se suben con `npm run upload:blob` (Vercel Blob) y sus URLs van en `DOWNLOAD_URLS`.
