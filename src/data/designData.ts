/**
 * Ficha de diseño: orientación, materiales, estructura y protección solar.
 *
 * Todo el contenido sale de textos que ya existen en src/data/galleryData.ts; aquí solo se
 * ordena y se agrupa por tema. Cada dato indica la lámina de la que procede (entre corchetes)
 * para poder contrastarlo con el keynote de Añil Arquitectura. No se añade ninguna cifra ni
 * característica nueva.
 */

import type { GalleryItem, GallerySpec } from './galleryData';

/* ------------------------------------------------------------------------------------------ */
/* A · Ficha dentro de cada lámina de la galería                                              */
/* ------------------------------------------------------------------------------------------ */

export type DesignBlockKey = 'orientation' | 'materials' | 'structure' | 'solar';

export interface DesignBlock {
  key: DesignBlockKey;
  label: string;
  value: string;
}

// Etiquetas de `specs` que describen cada tema, por orden de preferencia
const STRUCTURE_LABELS = ['Estructura Portante', 'Altura Libre', 'Altura Interior', 'Geometría', 'Ejecución', 'Muros Límite'];
const SOLAR_LABELS = ['Protección Solar', 'Sombra Proyectada', 'Protección', 'Control Térmico'];

function pickSpec(specs: GallerySpec[], labels: string[]): GallerySpec | undefined {
  for (const label of labels) {
    const found = specs.find((spec) => spec.label === label);
    if (found) return found;
  }
  return undefined;
}

export interface SlideDesignSheet {
  blocks: DesignBlock[];
  /** Resto de datos de la lámina, ya sin los que se muestran en los cuatro bloques. */
  rest: GallerySpec[];
}

/**
 * Cuatro bloques por lámina (orientación, materiales, estructura, protección solar). Un bloque
 * sin dato en esa lámina simplemente no se muestra: no se rellena con texto inventado.
 */
export function buildSlideDesignSheet(item: GalleryItem): SlideDesignSheet {
  const specs = item.specs ?? [];
  const structure = pickSpec(specs, STRUCTURE_LABELS);
  const solar = pickSpec(specs, SOLAR_LABELS);

  const blocks: DesignBlock[] = [];
  if (item.orientation) blocks.push({ key: 'orientation', label: 'Orientación', value: item.orientation });
  if (item.material) blocks.push({ key: 'materials', label: 'Materiales', value: item.material });
  if (structure) blocks.push({ key: 'structure', label: 'Estructura', value: structure.value });
  if (solar) blocks.push({ key: 'solar', label: 'Protección solar', value: solar.value });

  const used = new Set([structure, solar].filter(Boolean));
  return { blocks, rest: specs.filter((spec) => !used.has(spec)) };
}

/* ------------------------------------------------------------------------------------------ */
/* B · Sección «Ficha de diseño»                                                              */
/* ------------------------------------------------------------------------------------------ */

export interface Bearing {
  n: number;
  /** Rumbo en grados sobre la rosa de los vientos (0 = Norte, 90 = Este, 180 = Sur, 270 = Oeste). */
  degrees: number;
  title: string;
  detail: string;
}

export const ORIENTATION: Bearing[] = [
  // [Fachada principal] «Fachada Principal · Orientación Norte»; [PB Norte] «Norte Franco · Vista El Ávila»
  { n: 1, degrees: 0, title: 'Norte', detail: 'Fachada principal y vista al Ávila' },
  // [PB Sur] «Sur · Valle de Caracas»; [Acceso] «Acceso Sur · 8va Transversal»
  { n: 2, degrees: 180, title: 'Sur', detail: 'Acceso por la 8va Transversal y vista al valle de Caracas' },
  // [Costado] «Lateral Poniente»
  { n: 3, degrees: 270, title: 'Poniente', detail: 'Alzado lateral, protegido del sol de la tarde' },
];

export interface Material {
  name: string;
  where: string;
  /** Tono aproximado, solo para la muestra de color (no es una referencia de obra). */
  tone: string;
}

export const MATERIALS: Material[] = [
  { name: 'Concreto visto', where: 'Fachada, muros pantalla y aleros', tone: '#A9A59C' }, // [Fachada] [Costado] [Ventanal]
  { name: 'Perfilería anodizada bronce', where: 'Carpintería de fachada', tone: '#8C7452' }, // [Fachada]
  { name: 'Vidrio DVH Low-E', where: 'Ventanales con filtro UV 99 %', tone: '#B7C4C6' }, // [Salón PB Norte]
  { name: 'Madera', where: 'Nogal y roble ahumado en interiores', tone: '#7A5A3E' }, // [Salón PB Norte] [Cocina PB Sur]
  { name: 'Mármol y piedra natural', where: 'Travertino Navona, crema marfil y piedra de gran formato', tone: '#D8D0BF' }, // [Salón Norte] [Salón Sur] [Terraza Sur]
  { name: 'Granito pulido', where: 'Pórtico de acceso peatonal', tone: '#4A4743' }, // [Acceso]
];

export interface Fact {
  figure: string;
  caption: string;
}

export const STRUCTURE: Fact[] = [
  { figure: 'Concreto armado', caption: 'en obra limpia' }, // [Fachada] «Estructura Portante»
  { figure: '4 niveles', caption: 'más terrazas penthouse' }, // [Fachada] «Niveles»
  { figure: '3,20 m', caption: 'de altura libre, sin columnas intermedias' }, // [Salón PB Norte]
  { figure: '2,80 m', caption: 'de alero estructural' }, // [Terraza PB Sur]
];

export const STRUCTURE_NOTES: string[] = [
  'Muros pantalla de concreto armado', // [Costado] «Material»
  'Encofrado de tabla fina texturizada', // [Costado] «Ejecución»
];

export const SOLAR: { title: string; detail: string }[] = [
  // [Fachada] «Protección Solar: Celosías… Reguladas» (el dato original dice «horizontales»; los
  // renders muestran celosías verticales: pendiente de confirmar con Añil, por eso no se precisa)
  { title: 'Celosías reguladas', detail: 'Tamizan la luz tropical en la fachada' },
  // [Terraza PB Sur] subtítulo
  { title: 'Aleros de concreto', detail: 'Sombra permanente y resguardo de la lluvia tropical' },
  // [Costado] «Control Térmico»
  { title: 'Muros pantalla', detail: 'Protección frente al sol de poniente' },
  // [Ventanal PH] «Terrazas»
  { title: 'Balcones corridos en voladizo', detail: 'Terrazas que sombrean los niveles inferiores' },
];
