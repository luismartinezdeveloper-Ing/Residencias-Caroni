import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMediaAssetUrl } from '../mediaConfig';

describe('mediaConfig - getMediaAssetUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('debe retornar la ruta local inalterada cuando no hay CDN configurado', () => {
    const url = getMediaAssetUrl('/videos/Camera_rotating_around_building.mp4');
    expect(url).toBe('/videos/Camera_rotating_around_building.mp4');
  });

  it('debe respetar URLs absolutas existentes sin modificarlas', () => {
    const externalUrl = 'https://cdn.residenciascaroni.com/videos/drone.mp4';
    expect(getMediaAssetUrl(externalUrl)).toBe(externalUrl);

    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    expect(getMediaAssetUrl(dataUrl)).toBe(dataUrl);
  });

  it('debe manejar entradas vacías retornando string vacío', () => {
    expect(getMediaAssetUrl('')).toBe('');
  });
});
