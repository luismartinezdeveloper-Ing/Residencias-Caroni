import { describe, it, expect } from 'vitest';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../galleryData';

describe('Gallery Data Model & Assets Integrity', () => {
  it('debe contener todas las categorías institucionales definidas', () => {
    const categoryIds = GALLERY_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('todos');
    expect(categoryIds).toContain('exterior');
    expect(categoryIds).toContain('pb-norte');
    expect(categoryIds).toContain('pb-sur');
    expect(categoryIds).toContain('penthouse');
  });

  it('debe incluir los renders exteriores oficiales', () => {
    const exteriorItems = GALLERY_ITEMS.filter((item) => item.category === 'exterior');
    expect(exteriorItems.length).toBeGreaterThanOrEqual(1);
    expect(exteriorItems[0].image).toContain('RC-exterior.frontal.jpeg');
  });

  it('debe incluir los renders interiores oficiales de PB Norte y PB Sur', () => {
    const pbNorteItems = GALLERY_ITEMS.filter((item) => item.category === 'pb-norte');
    const pbSurItems = GALLERY_ITEMS.filter((item) => item.category === 'pb-sur');

    expect(pbNorteItems.length).toBeGreaterThanOrEqual(3);
    expect(pbSurItems.length).toBeGreaterThanOrEqual(3);

    // Salón, terraza y cocina de PB Norte
    const norteImages = pbNorteItems.map((i) => i.image);
    expect(norteImages.some((img) => img?.includes('01_PB_Norte_Terraza.jpeg'))).toBe(true);
    expect(norteImages.some((img) => img?.includes('02_PB_Norte_Salon.jpeg'))).toBe(true);
    expect(norteImages.some((img) => img?.includes('03_PB_Norte_Cocina.jpg.jpeg'))).toBe(true);

    // Salón, terraza y cocina de PB Sur
    const surImages = pbSurItems.map((i) => i.image);
    expect(surImages.some((img) => img?.includes('04_PB_Sur_Terraza.jpeg'))).toBe(true);
    expect(surImages.some((img) => img?.includes('05_PB_Sur_Salon.jpeg'))).toBe(true);
    expect(surImages.some((img) => img?.includes('06_PB_Sur_Cocina.jpg.jpeg'))).toBe(true);
  });

  it('cada elemento de la galería debe contar con ficha técnica estructurada', () => {
    GALLERY_ITEMS.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.subtitle).toBeTruthy();
      expect(item.cota).toBeTruthy();
      expect(item.orientation).toBeTruthy();
      expect(item.specs.length).toBeGreaterThanOrEqual(3);
    });
  });
});
