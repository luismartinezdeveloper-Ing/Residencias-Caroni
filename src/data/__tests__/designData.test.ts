import { describe, it, expect } from 'vitest';
import { GALLERY_ITEMS } from '../galleryData';
import { buildSlideDesignSheet } from '../designData';

const byId = (id: string) => GALLERY_ITEMS.find((item) => item.id === id)!;

describe('buildSlideDesignSheet - ficha por lámina', () => {
  it('la fachada principal tiene los cuatro bloques, con los datos de la lámina', () => {
    const { blocks } = buildSlideDesignSheet(byId('ext-fachada-frontal'));
    expect(blocks.map((b) => b.key)).toEqual(['orientation', 'materials', 'structure', 'solar']);
    expect(blocks.find((b) => b.key === 'structure')?.value).toBe('Concreto Armado en Obra Limpia');
    expect(blocks.find((b) => b.key === 'solar')?.value).toContain('Celosías');
  });

  it('un bloque sin dato se omite en vez de inventarse', () => {
    const { blocks } = buildSlideDesignSheet(byId('int-pb-norte-cocina'));
    expect(blocks.map((b) => b.key)).toEqual(['orientation', 'materials']);
  });

  it('el resto de datos no repite los que ya están en un bloque', () => {
    const { blocks, rest } = buildSlideDesignSheet(byId('ext-fachada-frontal'));
    const shown = blocks.map((b) => b.value);
    rest.forEach((spec) => expect(shown).not.toContain(spec.value));
    expect(rest.map((s) => s.label)).toContain('Niveles');
  });

  it('toda lámina muestra al menos orientación y materiales', () => {
    GALLERY_ITEMS.forEach((item) => {
      const keys = buildSlideDesignSheet(item).blocks.map((b) => b.key);
      expect(keys, item.id).toContain('orientation');
      expect(keys, item.id).toContain('materials');
    });
  });

  it('la terraza sur usa su sombra proyectada como protección solar', () => {
    const solar = buildSlideDesignSheet(byId('int-pb-sur-terraza')).blocks.find((b) => b.key === 'solar');
    expect(solar?.value).toContain('Alero');
  });
});
