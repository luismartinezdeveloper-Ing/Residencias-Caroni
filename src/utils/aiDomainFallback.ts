import { BRAND_INFO, UNITS_DATA } from '../data/brandData';
import type { UnitData } from '../types/brand';
import type { SupportedLocale } from '../i18n/messages';

/**
 * Asistente de Dominio Local (Offline PWA & Fallback Bilingüe) - Residencias Caroní
 * Consulta en tiempo real los datos verificados del catálogo (UNITS_DATA y BRAND_INFO)
 * sin requerir conectividad con la nube.
 * Ingeniería de Software: Ing. Luis Martinez
 */

function normalizeText(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findMatchingUnit(normalizedQuery: string, contextUnit?: string): UnitData | undefined {
  const byQuery = UNITS_DATA.find((u) => {
    const nName = normalizeText(u.name);
    const nCode = normalizeText(u.code);
    const nId = normalizeText(u.id);
    return (
      normalizedQuery.includes(nName) ||
      normalizedQuery.includes(nId) ||
      new RegExp(`\\b${nCode}\\b`, 'i').test(normalizedQuery)
    );
  });
  if (byQuery) return byQuery;

  if (contextUnit) {
    const nCtx = normalizeText(contextUnit);
    return UNITS_DATA.find(
      (u) => normalizeText(u.name) === nCtx || normalizeText(u.id) === nCtx
    );
  }
  return undefined;
}

function formatUnitSummary(unit: UnitData, locale: SupportedLocale): string {
  const statusMapEs: Record<UnitData['status'], string> = {
    disponible: 'Disponible',
    en_reserva: 'En reserva / Prioridad',
    comprometida: 'Comprometida',
  };
  const statusMapEn: Record<UnitData['status'], string> = {
    disponible: 'Available',
    en_reserva: 'Reserved / Priority',
    comprometida: 'Committed',
  };

  const estMinUsd = Math.round(unit.totalArea * 2400).toLocaleString('en-US');
  const estMaxUsd = Math.round(unit.totalArea * 3000).toLocaleString('en-US');

  if (locale === 'en') {
    const gardenLine = unit.gardenArea ? ` · Private Garden: ${unit.gardenArea} m²` : '';
    return `${unit.name} (${unit.level} · ${unit.orientation === 'Norte' ? 'North / El Ávila' : 'South / Valley'}) — Status: ${statusMapEn[unit.status]}. Total Area: ${unit.totalArea} m² (Interior: ${unit.interiorArea} m² · Terrace: ${unit.terraceArea} m²${gardenLine}), ${unit.rooms} en-suite bedrooms, ${unit.parkingSpots} covered parking spaces, and ${unit.storageUnits} storage unit(s). Reference pre-sale range: $${estMinUsd} – $${estMaxUsd} USD ($2,400–$3,000/m²).`;
  }

  const gardenLine = unit.gardenArea ? ` · Jardín Privado: ${unit.gardenArea} m²` : '';
  return `${unit.name} (${unit.level} · Orientación ${unit.orientation}) — Estado: ${statusMapEs[unit.status]}. Superficie total: ${unit.totalArea} m² (Interior: ${unit.interiorArea} m² · Terraza: ${unit.terraceArea} m²${gardenLine}), ${unit.rooms} habitaciones en suite, ${unit.parkingSpots} puestos de estacionamiento y ${unit.storageUnits} maletero(s). Rango referencial de preventa: $${estMinUsd} – $${estMaxUsd} USD ($2.400–$3.000/m²).`;
}

export function getDomainFallbackReply(
  userMessage: string,
  contextUnit?: string,
  locale: SupportedLocale = 'es'
): string {
  const query = normalizeText(userMessage);
  const matchedUnit = findMatchingUnit(query, contextUnit);

  // 0. Disponibilidad / inventario completo desde el catálogo offline
  if (
    query.includes('disponib') ||
    query.includes('availab') ||
    query.includes('unidades') ||
    query.includes('units') ||
    query.includes('listado') ||
    query.includes('catalog')
  ) {
    const available = UNITS_DATA.filter((u) => u.status === 'disponible');
    const names = available.map((u) => `${u.name} (${u.totalArea} m²)`).join(', ');
    if (locale === 'en') {
      return `Of the 8 authored residences at ${BRAND_INFO.name}, ${available.length} units are currently open in the offline catalog: ${names}. Estimated delivery: Q3 ${BRAND_INFO.delivery}.`;
    }
    return `De las 8 residencias de autor en ${BRAND_INFO.name}, actualmente figuran ${available.length} unidades disponibles en catálogo: ${names}. Entrega estimada: ${BRAND_INFO.deliveryLong}.`;
  }

  // 1. Consulta específica sobre una residencia detectada
  if (
    matchedUnit &&
    (query.includes(normalizeText(matchedUnit.name)) ||
      query.includes('unidad') ||
      query.includes('unit') ||
      query.includes('ficha') ||
      query.includes('spec'))
  ) {
    return formatUnitSummary(matchedUnit, locale);
  }

  // 2. Precios, Reservas y Condiciones de Inversión
  if (
    query.includes('precio') ||
    query.includes('cuesta') ||
    query.includes('valor') ||
    query.includes('costo') ||
    query.includes('pago') ||
    query.includes('financ') ||
    query.includes('reserva') ||
    query.includes('loi') ||
    query.includes('price') ||
    query.includes('cost') ||
    query.includes('escrow') ||
    query.includes('invest')
  ) {
    if (locale === 'en') {
      const unitNote = matchedUnit ? ` For ${matchedUnit.name} (${matchedUnit.totalArea} m²), the reference range is $${Math.round(matchedUnit.totalArea * 2400).toLocaleString('en-US')}–$${Math.round(matchedUnit.totalArea * 3000).toLocaleString('en-US')} USD.` : '';
      return `Pre-sale reference values range from $2,400 to $3,000 USD / m² depending on typology and floor level.${unitNote} Formal acquisition proceeds via a fiduciary Letter of Intent (LOI) and Escrow custody account with private scheduled briefings.`;
    }
    const unitNote = matchedUnit ? ` Para ${matchedUnit.name} (${matchedUnit.totalArea} m²), el rango referencial estimado es de $${Math.round(matchedUnit.totalArea * 2400).toLocaleString('en-US')} a $${Math.round(matchedUnit.totalArea * 3000).toLocaleString('en-US')} USD.` : '';
    return `Los valores de preventa se sitúan en un rango referencial de $2.400 a $3.000 USD / m² según tipología y nivel.${unitNote} El proceso formal se articula mediante Letter of Intent (LOI) fiduciaria y cuenta custodia (Escrow). Las visitas y consultas de inversión se coordinan con cita previa.`;
  }

  // 3. Metrajes, Superficies y Áreas
  if (
    query.includes('metro') ||
    query.includes('m2') ||
    query.includes('tamano') ||
    query.includes('superficie') ||
    query.includes('area') ||
    query.includes('size') ||
    query.includes('square')
  ) {
    if (locale === 'en') {
      return 'Residencias Caroní comprises 8 full-scale residences: Ground-Floor Garden Duplexes from 931 m² to 1,030 m² with private landscaped gardens, Level 2 & 3 Residences of 415 m² with continuous terraces, and Summit Penthouses from 586 m² to 591 m².';
    }
    return 'El proyecto contempla 8 residencias de gran escala: Dúplex Jardín en planta baja desde 931 m² hasta 1.030 m² con jardines privados, Residencias en Niveles 2 y 3 de 415 m² con terrazas continuas, y Penthouses Mirador en nivel superior de 586 m² a 591 m².';
  }

  // 4. Habitaciones, Distribución y Suites
  if (
    query.includes('habitaci') ||
    query.includes('cuarto') ||
    query.includes('dormitorio') ||
    query.includes('bano') ||
    query.includes('suite') ||
    query.includes('distribuci') ||
    query.includes('bedroom') ||
    query.includes('layout') ||
    query.includes('room')
  ) {
    if (locale === 'en') {
      return 'Each residence offers 3 to 4 full en-suite bedrooms with independent walk-in closets, a column-free main living pavilion with 3.20m clear ceiling heights and floor-to-ceiling glazing, full service quarters, and direct private elevator foyer access.';
    }
    return 'Cada residencia cuenta con configuraciones de 3 a 4 habitaciones completas en suite con vestier independiente, salón principal con ventanales de piso a techo, área de servicio completa, lavandería y ascensor privado con acceso directo.';
  }

  // 5. Penthouses y Miradores
  if (
    query.includes('penthouse') ||
    query.includes('mirador') ||
    query.includes('ph') ||
    query.includes('cima') ||
    query.includes('summit')
  ) {
    if (locale === 'en') {
      return 'Mirador Norte (591 m²) and Mirador Sur (586 m²) Penthouses crown the building with panoramic wraparound terraces up to 180 m², 180° views of El Ávila National Park and the Caracas valley, plus 5 private subterranean parking spaces.';
    }
    return 'Los Penthouses Mirador Norte (591 m²) y Mirador Sur (586 m²) ocupan la cumbre del edificio, ofreciendo terrazas panorámicas de hasta 180 m² con vistas de 180° hacia el Parque Nacional El Ávila y 5 puestos de estacionamiento privado.';
  }

  // 6. Jardines y Plantas Bajas
  if (
    query.includes('jardin') ||
    query.includes('planta baja') ||
    query.includes('pb') ||
    query.includes('garden') ||
    query.includes('ground')
  ) {
    if (locale === 'en') {
      return 'Jardín Norte (1,030 m²) and Jardín Sur (931 m²) are ground-level duplex residences featuring up to 350 m² of private landscaped garden and private lap pool overlooking El Ávila.';
    }
    return 'Las residencias Jardín Norte y Jardín Sur son dúplex con áreas totales de 1.030 m² y 931 m², respectivamente, que incorporan hasta 350 m² de jardín privado continuo al aire libre y piscina privada con vista a la montaña.';
  }

  // 7. Infraestructura, Respaldo y Estacionamiento
  if (
    query.includes('planta') ||
    query.includes('electr') ||
    query.includes('agua') ||
    query.includes('pozo') ||
    query.includes('estacion') ||
    query.includes('puesto') ||
    query.includes('parque') ||
    query.includes('ascensor') ||
    query.includes('seguridad') ||
    query.includes('parking') ||
    query.includes('water') ||
    query.includes('power') ||
    query.includes('security') ||
    query.includes('elevator')
  ) {
    if (locale === 'en') {
      return 'Residencias Caroní integrates 100% backup power generation, a dedicated deep water well with filtration plant, 36 covered underground parking spaces (4 to 5 per residence), dual private/service elevators, and 24/7 armored gatehouse security.';
    }
    return 'Residencias Caroní cuenta con respaldo eléctrico del 100%, pozo de agua profundo propio con planta de filtración, 36 puestos de estacionamiento subterráneo techado (4 a 5 por residencia), doble ascensor (privado y servicio) y garita blindada 24/7.';
  }

  // 8. Ubicación y Entorno
  if (
    query.includes('donde') ||
    query.includes('ubic') ||
    query.includes('altamira') ||
    query.includes('avila') ||
    query.includes('direccion') ||
    query.includes('where') ||
    query.includes('location') ||
    query.includes('address')
  ) {
    if (locale === 'en') {
      return `The project sits on ${BRAND_INFO.location} (${BRAND_INFO.coordinates}), along the northern residential edge directly at the foot of El Ávila National Park.`;
    }
    return `El proyecto se implanta en ${BRAND_INFO.location} (${BRAND_INFO.coordinates}), en el último cuadro urbanístico al pie del Parque Nacional El Ávila.`;
  }

  // 9. Arquitectura y Autoría
  if (
    query.includes('arquitect') ||
    query.includes('disen') ||
    query.includes('autor') ||
    query.includes('anil') ||
    query.includes('lancara') ||
    query.includes('martinez') ||
    query.includes('architect') ||
    query.includes('design')
  ) {
    if (locale === 'en') {
      return `Architectural direction and massing are by ${BRAND_INFO.architect}. Software architecture and interactive digital experience are engineered by ${BRAND_INFO.leadDeveloper}.`;
    }
    return `La arquitectura y volumetría es de ${BRAND_INFO.architect}. La ingeniería de software y experiencia interactiva es desarrollada por el ${BRAND_INFO.leadDeveloper}.`;
  }

  // 10. Citas y Visitas
  if (
    query.includes('cita') ||
    query.includes('visita') ||
    query.includes('contacto') ||
    query.includes('reunion') ||
    query.includes('ver') ||
    query.includes('visit') ||
    query.includes('appointment') ||
    query.includes('schedule')
  ) {
    if (locale === 'en') {
      return `Private advisory is conducted under strict confidentiality by appointment only (${BRAND_INFO.contactEmail}). You may request accreditation directly through this portal.`;
    }
    return `La atención se brinda bajo estricto protocolo de confidencialidad y bajo la modalidad de visitas con cita (${BRAND_INFO.contactEmail}). Puede solicitar su acreditación privada a través de nuestro portal.`;
  }

  // 11. Saludos
  if (
    query.includes('hola') ||
    query.includes('buenos') ||
    query.includes('buenas') ||
    query.includes('saludos') ||
    query.includes('tarde') ||
    query.includes('dia') ||
    query.includes('hello') ||
    query.includes('hi') ||
    query.includes('good morning')
  ) {
    if (locale === 'en') {
      return 'Welcome to Residencias Caroní · Altamira. I can share verified technical specs, unit areas, pre-sale reference pricing, and private viewing details even offline. How may I assist you?';
    }
    return 'Bienvenido a Residencias Caroní · Altamira. Estoy a su disposición para detallar las ocho residencias, memorias técnicas, planos arquitectónicos y condiciones de preventa. Visitas con cita.';
  }

  // 12. Respuesta sobria contextual
  if (matchedUnit) {
    return formatUnitSummary(matchedUnit, locale);
  }

  if (locale === 'en') {
    return 'Residencias Caroní: eight authored residences conceived as a single sculptural volume at the foot of El Ávila in Altamira, Caracas. Ask about available units, floor areas, pre-sale pricing, or private appointments.';
  }
  return 'Residencias Caroní: ocho residencias de autor concebidas como un solo volumen escultórico al pie del Ávila en Altamira, Caracas. Puede consultar disponibilidad, metrajes, precios referenciales o especificaciones técnicas.';
}
