// Reglas de "surfeo" y escala (Tutorial 1 + Tutorial 2) y unit economics para Argentina.
import { ECON } from './config';

export type SurfInput = {
  spend: number; // gasto del día (Meta, sin impuestos)
  sales: number; // ventas del día atribuidas al anuncio
  revenue: number; // facturación del día atribuida
  roasYesterday?: number | null;
  cpaTarget: number; // CPA objetivo = ticket front / 2
};

export type SurfAction = 'SIN_GASTO' | 'ESPERAR' | 'APAGAR_SIN_VENTA' | 'DUPLICAR' | 'APAGAR_DOS_DIAS' | 'MANTENER_CHANCE' | 'BAJAR_50' | 'MANTENER';

export const SURF_LABEL: Record<SurfAction, string> = {
  SIN_GASTO: 'Sin gasto',
  ESPERAR: 'Esperar (no llegó al CPA objetivo)',
  APAGAR_SIN_VENTA: 'Apagar: gastó el CPA objetivo sin vender',
  DUPLICAR: 'Duplicar presupuesto',
  APAGAR_DOS_DIAS: 'Apagar: dos días malos',
  MANTENER_CHANCE: 'Mantener: ayer fue bueno',
  BAJAR_50: 'Bajar presupuesto 50 %',
  MANTENER: 'Mantener',
};

export function surfAction(i: SurfInput): { action: SurfAction; roas: number; budgetFactor: number } {
  const roas = i.spend > 0 ? i.revenue / i.spend : 0;
  let action: SurfAction;
  if (i.spend <= 0) action = 'SIN_GASTO';
  else if (i.sales === 0 && i.spend >= i.cpaTarget) action = 'APAGAR_SIN_VENTA';
  else if (i.sales === 0) action = 'ESPERAR';
  else if (roas >= 2) action = 'DUPLICAR';
  else if (roas < 1.3 && (i.roasYesterday ?? 0) < 1.3) action = 'APAGAR_DOS_DIAS';
  else if (roas < 1.3) action = 'MANTENER_CHANCE';
  else if (roas < 1.7) action = 'BAJAR_50';
  else action = 'MANTENER';
  const budgetFactor = action === 'DUPLICAR' ? 2 : action === 'BAJAR_50' ? 0.5 : action.startsWith('APAGAR') ? 0 : 1;
  return { action, roas, budgetFactor };
}

export function scaleStatus(salesTotal: number, roasTotal: number): 'WINNER' | 'ESCALAR' | null {
  if ((salesTotal >= 20 && roasTotal >= 2) || (salesTotal >= 50 && roasTotal >= 1.7)) return 'WINNER';
  if (salesTotal > 10 && roasTotal > 1.7) return 'ESCALAR';
  return null;
}

export function economics(frontPrice: number) {
  const mpFee = ECON.mpFee * (1 + ECON.mpFeeVat);
  const netRate = 1 - mpFee - ECON.salesTax;
  const adMultiplier = 1 + ECON.adVat + ECON.adProvincial + (ECON.countPerception ? 0.3 : 0);
  return {
    mpFee,
    netRate,
    adMultiplier,
    breakevenRoas: adMultiplier / netRate,
    cpaTarget: frontPrice / 2,
    cpaMaxFront: (frontPrice * netRate) / adMultiplier,
    testBudget: (frontPrice / 2) * 3,
    pretestBudget: frontPrice / 7,
  };
}
