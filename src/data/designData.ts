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
