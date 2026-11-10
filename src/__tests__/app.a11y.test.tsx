// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import App from '../App';

/**
 * Auditoría de accesibilidad del diseño actual con axe-core (WCAG 2.2 AA y buenas prácticas).
 * axe no calcula contraste en jsdom, así que ese criterio se revisa aparte. El objetivo es que
 * las correcciones sean invisibles: etiquetas, roles y estructura, no cambios de aspecto.
 */

beforeAll(() => {
  class FakeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeObserver;
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = FakeObserver;
  window.matchMedia =
    window.matchMedia ||
    ((query: string) =>
      ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) as unknown as MediaQueryList);
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
  HTMLMediaElement.prototype.load = vi.fn();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const OPTIONS = {
  runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
  rules: { 'color-contrast': { enabled: false } },
};

function summarize(results: axe.AxeResults) {
  return results.violations.map((v) => ({
    id: v.id,
    impacto: v.impact,
    nodos: v.nodes.length,
    ejemplos: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' → ' + (n.html || '').slice(0, 110)),
  }));
}

async function settle() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
}

describe('diseño actual · axe-core', () => {
  it('página principal', async () => {
    const { container } = render(<App />);
    await settle();
    const results = await axe.run(container, OPTIONS);
    // eslint-disable-next-line no-console
    console.log('AXE_PAGINA ' + JSON.stringify(summarize(results), null, 1));
    expect(summarize(results)).toEqual([]);
  });

  it('puerta de acceso abierta (Maqueta 3D sin acreditar)', async () => {
    const { container } = render(<App />);
    await settle();
    const open = container.querySelector<HTMLElement>('button[title="Abrir Maqueta 3D Interactiva"]');
    expect(open).toBeTruthy();
    fireEvent.click(open!);
    await settle();
    const results = await axe.run(document.body, OPTIONS);
    // eslint-disable-next-line no-console
    console.log('AXE_PUERTA ' + JSON.stringify(summarize(results), null, 1));
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    expect(summarize(results)).toEqual([]);
  });

  it('la puerta de acceso se cierra con Escape, devuelve el foco y libera el scroll', async () => {
    const { container } = render(<App />);
    await settle();
    const open = container.querySelector<HTMLElement>('button[title="Abrir Maqueta 3D Interactiva"]')!;
    open.focus();
    fireEvent.click(open);
    await settle();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    await settle();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(open);
  });

  it('asesor (chat) abierto', async () => {
    const { container } = render(<App />);
    await settle();
    const open = container.querySelector<HTMLElement>('button[aria-label="Abrir Asesor"]');
    expect(open).toBeTruthy();
    fireEvent.click(open!);
    await settle();
    await settle();
    const results = await axe.run(document.body, OPTIONS);
    // eslint-disable-next-line no-console
    console.log('AXE_CHAT ' + JSON.stringify(summarize(results), null, 1));
    expect(summarize(results)).toEqual([]);
  });
});
