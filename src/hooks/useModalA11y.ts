import { useEffect, useRef } from 'react';

/**
 * Accesibilidad común de los modales, sin tocar su aspecto. Devuelve la ref del panel y, mientras
 * `active` es true:
 *  - lleva el foco al primer control del panel (o al panel) y lo devuelve a quien abrió el modal;
 *  - cierra con Escape (si `escape` no es false);
 *  - atrapa Tab dentro del panel (si `trap` no es false);
 *  - bloquea el scroll de la página (si `lockScroll` no es false).
 *
 * El panel debe llevar además role="dialog" y aria-labelledby o aria-label (aria-modal solo si
 * es realmente modal).
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalA11yOptions {
  escape?: boolean;
  trap?: boolean;
  lockScroll?: boolean;
  /** Mover el foco al abrir. Desactivar si el modal ya gestiona su foco inicial. */
  autoFocus?: boolean;
}

export function useModalA11y<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  onClose: () => void,
  { escape = true, trap = true, lockScroll = true, autoFocus = true }: ModalA11yOptions = {}
) {
  const panelRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';

    const focusables = (): HTMLElement[] =>
      panelRef.current ? Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];

    // Espera un frame: los modales con animación montan su contenido justo al abrirse
    let frame = 0;
    if (autoFocus) {
      frame = requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (!panel || panel.contains(document.activeElement)) return;
        (focusables()[0] ?? panel).focus?.();
      });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (escape && event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (!trap || event.key !== 'Tab') return;

      const panel = panelRef.current;
      const items = focusables();
      if (!panel || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || current === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown, true);
      if (lockScroll) document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [active, escape, trap, lockScroll, autoFocus]);

  return panelRef;
}
