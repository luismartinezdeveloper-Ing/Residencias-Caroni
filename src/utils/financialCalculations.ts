/**
 * Residencias Caroní · Altamira, Caracas
 * Utilidades de Cálculo Financiero y Condiciones Comerciales (LOI)
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Software & Modelado Financiero: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */

export type UnitTypology = 'Mirador' | 'Jardín' | 'Tipo' | string;

export interface InvestmentTotals {
  totalArea: number;
  pricePerM2: number;
  totalValueUsd: number;
  reserveDepositUsd: number;       // 10% señal de reserva
  promissoryContractUsd: number;   // 30% a la firma de promesa bilateral
  constructionInstallmentsUsd: number; // 50% durante el avance de obra
  finalTitleDeliveryUsd: number;   // 10% contra entrega protocolar de llaves
}

/**
 * Retorna el precio base oficial por m² según la tipología arquitectónica
 */
export function getDefaultPricePerM2(typology: UnitTypology): number {
  if (typology === 'Mirador') return 3600;
  if (typology === 'Jardín') return 2950;
  return 3300; // Tipología estándar / planta tipo
}

/**
 * Calcula el desglose financiero fiduciario para la unidad y precio dados
 */
export function calculateInvestmentTotals(totalArea: number, pricePerM2: number): InvestmentTotals {
  const safeArea = Math.max(0, Number(totalArea) || 0);
  const safePrice = Math.max(0, Number(pricePerM2) || 0);
  const totalValueUsd = Math.round(safeArea * safePrice);

  const reserveDepositUsd = Math.round(totalValueUsd * 0.10);
  const promissoryContractUsd = Math.round(totalValueUsd * 0.30);
  const constructionInstallmentsUsd = Math.round(totalValueUsd * 0.50);
  const finalTitleDeliveryUsd = Math.round(totalValueUsd * 0.10);

  return {
    totalArea: safeArea,
    pricePerM2: safePrice,
    totalValueUsd,
    reserveDepositUsd,
    promissoryContractUsd,
    constructionInstallmentsUsd,
    finalTitleDeliveryUsd,
  };
}

/**
 * Limita los días de validez de la oferta fiduciaria dentro de los parámetros institucionales
 * (mínimo 7 días, máximo 30 días, por defecto 15 días)
 */
export function clampValidityDays(days: number): number {
  const parsed = parseInt(String(days), 10);
  if (isNaN(parsed)) return 15;
  return Math.min(30, Math.max(7, parsed));
}

/**
 * Formatea un valor numérico a divisa USD con separadores de miles estándar
 */
export function formatUsdCurrency(value: number): string {
  const safeValue = Math.round(Number(value) || 0);
  return `$${safeValue.toLocaleString('en-US')} USD`;
}
