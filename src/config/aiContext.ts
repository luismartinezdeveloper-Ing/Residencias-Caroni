/**
 * Contexto de proyecto para el asesor IA, construido en el servidor a partir de los datos
 * oficiales. El cliente solo envía el id de la unidad en foco; nunca texto libre que
 * termine dentro del system prompt.
 */

import { UNITS_DATA } from '../data/brandData';
import type { UnitData } from '../types/brand';
import {
  calculateInvestmentTotals,
  formatUsdCurrency,
  getDefaultPricePerM2,
} from '../utils/financialCalculations';

export function findUnitById(unitId?: string): UnitData | undefined {
  if (!unitId) return undefined;
  return UNITS_DATA.find((unit) => unit.id === unitId);
}

export function buildProjectContext(unit?: UnitData): string {
  let unitDetails = '';
  if (unit) {
    const defaultPrice = getDefaultPricePerM2(unit.typology);
    const totals = calculateInvestmentTotals(unit.totalArea, defaultPrice);
    unitDetails = `
      Unidad en foco actual: ${unit.name}
      Nivel: ${unit.level}
      Tipo: ${unit.typology}
      Área Total: ${unit.totalArea} m² (Interior: ${unit.interiorArea} m², Terraza: ${unit.terraceArea} m²)
      Habitaciones: ${unit.rooms} (todas en suite) | Puestos: ${unit.parkingSpots} | Maleteros: ${unit.storageUnits}
      Precio referencial: ${formatUsdCurrency(totals.totalValueUsd)} (a $${totals.pricePerM2}/m²)
      Señal de Reserva Escrow (10%): ${formatUsdCurrency(totals.reserveDepositUsd)}
      Distribución: ${unit.roomList.join(', ')}
      `;
  }

  return `
      Proyecto: Residencias Caroní · Altamira, Caracas
      Desarrollo y Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
      Ingeniería de Software & Experiencia Interactiva: Ing. Luis Martinez (luismartinez.developer@gmail.com)
      Ubicación: Transversal 8, entre 2da y 3ra Avenida, Altamira, Chacao, Caracas, Venezuela
      Descripción: 8 exclusivas residencias de autor al pie del Parque Nacional El Ávila (PB Norte, PB Sur, Nivel 1 Norte, Nivel 1 Sur, Nivel 2 Norte, Nivel 2 Sur, Penthouse Norte, Penthouse Sur).
      Acabados de autor: Piedras naturales, carpintería a medida, ventanales de suelo a techo con doble acristalamiento acústico y térmico, elevador privado directo a cada residencia, domótica integral.
      Seguridad y amenidades: Vigilancia privada 24/7, control de acceso biométrico, pozo de agua profundo de caudal continuo, planta eléctrica 100% de respaldo, estacionamiento subterráneo privado con puntos para vehículos eléctricos.
      ${unitDetails}
    `;
}
