// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { OptimizedPicture, getModernImageSources } from '../OptimizedPicture';

describe('OptimizedPicture (IntersectionObserver + AVIF/WebP)', () => {
  afterEach(() => {
    cleanup();
  });

  it('deriva rutas .avif y .webp conservando parámetros de caché ?v=...', () => {
    const withQuery = getModernImageSources(
      '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027141757.jpg?v=20261030'
    );
    expect(withQuery.hasModernVariants).toBe(true);
    expect(withQuery.avif).toBe(
      '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027141757.avif?v=20261030'
    );
    expect(withQuery.webp).toBe(
      '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027141757.webp?v=20261030'
    );

    const gallery = getModernImageSources('/imagen/exterior/RC-exterior.frontal.jpeg');
    expect(gallery.avif).toBe('/imagen/exterior/RC-exterior.frontal.avif');
    expect(gallery.webp).toBe('/imagen/exterior/RC-exterior.frontal.webp');
  });

  it('difiere el montaje de <picture> hasta que IntersectionObserver detecta intersección', () => {
    let observerCallback: IntersectionObserverCallback | null = null;
    class MockObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
      constructor(cb: IntersectionObserverCallback) {
        observerCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }

    const originalObserver = window.IntersectionObserver;
    window.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;

    try {
      const { container } = render(
        <OptimizedPicture
          src="/imagen/exterior/RC-exterior.frontal.jpeg"
          alt="Fachada Frontal"
        />
      );

      // Antes de entrar al viewport, no debe montar <picture> ni <img>
      expect(container.querySelector('picture')).toBeNull();
      expect(container.querySelector('img')).toBeNull();

      // Al intersectar, monta <picture> con fuentes AVIF, WebP y fallback JPEG
      act(() => {
        observerCallback?.(
          [{ isIntersecting: true, intersectionRatio: 0.5 } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      });

      const picture = container.querySelector('picture');
      expect(picture).toBeTruthy();
      const sources = Array.from(picture!.querySelectorAll('source')).map((s) => ({
        type: s.getAttribute('type'),
        srcset: s.getAttribute('srcset'),
      }));
      expect(sources).toEqual([
        { type: 'image/avif', srcset: '/imagen/exterior/RC-exterior.frontal.avif' },
        { type: 'image/webp', srcset: '/imagen/exterior/RC-exterior.frontal.webp' },
      ]);

      const img = picture!.querySelector('img');
      expect(img?.getAttribute('src')).toBe('/imagen/exterior/RC-exterior.frontal.jpeg');
      expect(img?.getAttribute('loading')).toBe('lazy');
    } finally {
      window.IntersectionObserver = originalObserver;
    }
  });
});
