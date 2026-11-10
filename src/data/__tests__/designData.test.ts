import { describe, it, expect } from 'vitest';
import { GALLERY_ITEMS } from '../galleryData';
import { buildSlideDesignSheet, MATERIALS, ORIENTATION, SOLAR, STRUCTURE } from '../designData';

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

describe('contenido de la sección Ficha de diseño', () => {
  it('numera los rumbos de forma consecutiva y dentro de la rosa de los vientos', () => {
    ORIENTATION.forEach((b, i) => {
      expect(b.n).toBe(i + 1);
      expect(b.degrees).toBeGreaterThanOrEqual(0);
      expect(b.degrees).toBeLessThan(360);
    });
  });

  it('cada material tiene nombre, uso y un tono hexadecimal para su muestra', () => {
    expect(MATERIALS.length).toBeGreaterThanOrEqual(6);
    MATERIALS.forEach((m) => {
      expect(m.name.length).toBeGreaterThan(2);
      expect(m.where.length).toBeGreaterThan(2);
      expect(m.tone).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('las cifras de estructura coinciden con las de la galería', () => {
    const text = JSON.stringify(GALLERY_ITEMS);
    expect(text).toContain('3.20 m');
    expect(text).toContain('2.80 m');
    expect(STRUCTURE.map((f) => f.figure)).toEqual(expect.arrayContaining(['3,20 m', '2,80 m']));
  });

  it('no usa palabras que el manual prohíbe', () => {
    const all = JSON.stringify({ ORIENTATION, MATERIALS, STRUCTURE, SOLAR }).toLowerCase();
    ['lujo', 'exclusiv', 'privilegiad', 'espectacular', 'apartamento'].forEach((w) => expect(all).not.toContain(w));
    expect(SOLAR.length).toBeGreaterThanOrEqual(3);
  });
});
