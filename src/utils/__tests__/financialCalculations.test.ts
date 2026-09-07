import { describe, it, expect } from 'vitest';
import {
  getDefaultPricePerM2,
  calculateInvestmentTotals,
  clampValidityDays,
  formatUsdCurrency,
} from '../financialCalculations';

describe('Financial Calculations & LOI Simulator (Residencias Caroní)', () => {
  describe('getDefaultPricePerM2', () => {
    it('debe retornar 3600 USD/m² para tipología Mirador', () => {
      expect(getDefaultPricePerM2('Mirador')).toBe(3600);
    });

    it('debe retornar 2950 USD/m² para tipología Jardín', () => {
      expect(getDefaultPricePerM2('Jardín')).toBe(2950);
    });

    it('debe retornar 3300 USD/m² para tipologías Tipo o desconocidas', () => {
      expect(getDefaultPricePerM2('Tipo')).toBe(3300);
      expect(getDefaultPricePerM2('Cualquiera')).toBe(3300);
    });
  });

  describe('calculateInvestmentTotals', () => {
    it('debe calcular correctamente los totales y desgloses porcentuales', () => {
      // Unidad de 420.5 m² a $3,600/m²
      const result = calculateInvestmentTotals(420.5, 3600);
      // 420.5 * 3600 = 1,513,800
      expect(result.totalValueUsd).toBe(1513800);
      // 10% de reserva = 151,380
      expect(result.reserveDepositUsd).toBe(151380);
      // 30% firma promesa = 454,140
      expect(result.promissoryContractUsd).toBe(454140);
      // 50% obra = 756,900
      expect(result.constructionInstallmentsUsd).toBe(756900);
      // 10% entrega protocolar = 151,380
      expect(result.finalTitleDeliveryUsd).toBe(151380);
    });

    it('debe ser resiliente ante valores no numéricos o negativos', () => {
      const result = calculateInvestmentTotals(-10, NaN);
      expect(result.totalValueUsd).toBe(0);
      expect(result.reserveDepositUsd).toBe(0);
    });
  });

  describe('clampValidityDays', () => {
    it('debe mantener valores dentro del rango institucional [7, 30]', () => {
      expect(clampValidityDays(15)).toBe(15);
      expect(clampValidityDays(7)).toBe(7);
      expect(clampValidityDays(30)).toBe(30);
    });

    it('debe ajustar a 7 días si el valor es menor o negativo', () => {
      expect(clampValidityDays(2)).toBe(7);
      expect(clampValidityDays(-10)).toBe(7);
    });

    it('debe limitar a 30 días si el valor excede el máximo permitido', () => {
      expect(clampValidityDays(60)).toBe(30);
    });

    it('debe retornar 15 días por defecto si no es un número válido', () => {
      expect(clampValidityDays(NaN)).toBe(15);
    });
  });

  describe('formatUsdCurrency', () => {
    it('debe formatear con separadores de miles y sufijo USD', () => {
      expect(formatUsdCurrency(1513800)).toBe('$1,513,800 USD');
      expect(formatUsdCurrency(0)).toBe('$0 USD');
    });
  });
});
