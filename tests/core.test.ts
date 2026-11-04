import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';

beforeAll(() => {
  process.env.DOWNLOAD_SECRET = 'test-secret';
  process.env.FRONT_PRICE_ARS = '9900';
  process.env.REGULAR_PRICE_ARS = '14900';
  process.env.LAUNCH_PRICE_UNTIL = '2026-11-30T23:59:59-03:00';
  process.env.DOWNLOAD_URLS = JSON.stringify({ manual: 'https://example.com/manual.zip' });
});

describe('firma de webhooks de Mercado Pago', () => {
  it('acepta una firma válida y rechaza una alterada', async () => {
    const { verifyWebhookSignature } = await import('@/lib/mercadopago');
    const secret = 'abc123', ts = '1742505638683', reqId = '2066ca19-c6f1-498a-be75-1923005edd06', dataId = '123456789';
    const v1 = crypto.createHmac('sha256', secret).update(`id:${dataId};request-id:${reqId};ts:${ts};`).digest('hex');
    expect(verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: reqId, dataId, secret })).toBe(true);
    expect(verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: reqId, dataId: '999', secret })).toBe(false);
    expect(verifyWebhookSignature({ xSignature: `ts=1,v1=${v1}`, xRequestId: reqId, dataId, secret })).toBe(false);
    expect(verifyWebhookSignature({ xSignature: null, xRequestId: reqId, dataId, secret })).toBe(false);
  });
  it('pasa a minúsculas los data.id alfanuméricos (como pide la doc)', async () => {
    const { verifyWebhookSignature } = await import('@/lib/mercadopago');
    const secret = 's', ts = '1', reqId = 'r', dataId = 'ORD01JQ4S4KY8HWQ6NA5PXB65B3D3';
    const v1 = crypto.createHmac('sha256', secret).update(`id:${dataId.toLowerCase()};request-id:${reqId};ts:${ts};`).digest('hex');
    expect(verifyWebhookSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: reqId, dataId, secret })).toBe(true);
  });
});

describe('tokens de descarga', () => {
  it('firma y verifica; rechaza manipulaciones', async () => {
    const { signDownloadToken, verifyDownloadToken } = await import('@/lib/tokens');
    const t = signDownloadToken('1234567');
    expect(verifyDownloadToken(t)).toBe('1234567');
    const [p, s] = t.split('.');
    const other = Buffer.from('7654321').toString('base64url');
    expect(verifyDownloadToken(`${other}.${s}`)).toBeNull();
    expect(verifyDownloadToken(`${p}.x${s.slice(1)}`)).toBeNull();
    expect(verifyDownloadToken('basura')).toBeNull();
  });
});

describe('catálogo y precios', () => {
  it('precio de lanzamiento vs regular según la fecha real', async () => {
    const { frontPrice } = await import('@/lib/catalog');
    expect(frontPrice(new Date('2026-11-15T12:00:00-03:00'))).toBe(9900);
    expect(frontPrice(new Date('2026-12-01T00:00:01-03:00'))).toBe(14900);
  });
  it('combo con 33 % off y downsell a mitad, redondeados a $100', async () => {
    const { comboPrice, downsellPrice, remainingBumps } = await import('@/lib/catalog');
    expect(remainingBumps(['kit', 'ob-docente'])).toEqual(['ob-turnos', 'ob-etiquetas']);
    expect(comboPrice(['ob-turnos', 'ob-docente', 'ob-etiquetas'])).toBe(7800); // 11700 * 0.67 = 7839 → 7800
    expect(downsellPrice(['ob-turnos', 'ob-docente', 'ob-etiquetas'])).toBe(3900);
  });
  it('entitlements expande el combo a los archivos de cada bump', async () => {
    const { entitlements } = await import('@/lib/catalog');
    expect(entitlements(['kit']).length).toBe(7);
    expect(entitlements(['up-combo'], ['ob-turnos', 'ob-etiquetas']).sort()).toEqual(['etiquetas', 'turnos']);
    expect(entitlements(['kit', 'ob-docente'])).toContain('docente');
  });
  it('downloadUrl lee DOWNLOAD_URLS', async () => {
    const { downloadUrl } = await import('@/lib/catalog');
    expect(downloadUrl('manual')).toBe('https://example.com/manual.zip');
    expect(downloadUrl('tapas')).toBeNull();
  });
});

describe('reglas de surfeo (T1 + T2)', () => {
  it('aplica cada regla', async () => {
    const { surfAction, scaleStatus } = await import('@/lib/surf');
    const cpa = 4950;
    expect(surfAction({ spend: 0, sales: 0, revenue: 0, cpaTarget: cpa }).action).toBe('SIN_GASTO');
    expect(surfAction({ spend: 3000, sales: 0, revenue: 0, cpaTarget: cpa }).action).toBe('ESPERAR');
    expect(surfAction({ spend: 5000, sales: 0, revenue: 0, cpaTarget: cpa }).action).toBe('APAGAR_SIN_VENTA');
    expect(surfAction({ spend: 4900, sales: 1, revenue: 9900, cpaTarget: cpa })).toMatchObject({ action: 'DUPLICAR', budgetFactor: 2 });
    expect(surfAction({ spend: 6000, sales: 1, revenue: 9900, cpaTarget: cpa }).action).toBe('BAJAR_50');
    expect(surfAction({ spend: 9000, sales: 1, revenue: 9900, roasYesterday: 1.8, cpaTarget: cpa }).action).toBe('MANTENER_CHANCE');
    expect(surfAction({ spend: 9000, sales: 1, revenue: 9900, roasYesterday: 1.1, cpaTarget: cpa }).action).toBe('APAGAR_DOS_DIAS');
    expect(surfAction({ spend: 5500, sales: 1, revenue: 9900, cpaTarget: cpa }).action).toBe('MANTENER');
    expect(scaleStatus(11, 1.8)).toBe('ESCALAR');
    expect(scaleStatus(20, 2.1)).toBe('WINNER');
    expect(scaleStatus(50, 1.75)).toBe('WINNER');
    expect(scaleStatus(9, 3)).toBeNull();
  });
  it('unit economics coincide con el tablero Excel', async () => {
    const { economics } = await import('@/lib/surf');
    const e = economics(9900);
    expect(e.breakevenRoas).toBeCloseTo(1.313, 3);
    expect(Math.round(e.cpaMaxFront)).toBe(7539);
    expect(e.testBudget).toBe(14850);
  });
});

describe('firma de orden (URL de retorno)', () => {
  it('verifica la orden firmada y rechaza otra', async () => {
    const { signOrder, verifyOrder } = await import('@/lib/tokens');
    const s = signOrder('AG-123');
    expect(verifyOrder('AG-123', s)).toBe(true);
    expect(verifyOrder('AG-124', s)).toBe(false);
    expect(verifyOrder('AG-123', '')).toBe(false);
  });
});
