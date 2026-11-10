import React from 'react';
import type { GalleryItem } from '../../data/galleryData';
import { buildSlideDesignSheet } from '../../data/designData';

/* ------------------------------------------------------------------------------------------ */
/* A · Ficha dentro de cada lámina de la galería                                              */
/* ------------------------------------------------------------------------------------------ */

export function SlideDesignSheet({ item }: { item: GalleryItem }) {
  const { blocks, rest } = buildSlideDesignSheet(item);
  if (blocks.length === 0 && !item.cota) return null;

  const cota = item.cota?.replace(/^COTA\s*(ACCESO|CIMA|NIVEL[^:]*|JARDÍN)?\s*:\s*/i, '');

  return (
    <div className="pt-4 border-t border-[#1B1813]/10 flex flex-col space-y-3">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {blocks.map((block) => (
          <div key={block.key} className={block.key === 'materials' ? 'sm:col-span-2' : undefined}>
            <dt className="font-mono text-[10px] tracking-[0.2em] text-[#8C7452] uppercase font-semibold">
              {block.label}
            </dt>
            <dd className="font-serif text-[13.5px] sm:text-sm leading-snug text-[#1B1813] mt-0.5">{block.value}</dd>
          </div>
        ))}
      </dl>

      {(cota || rest.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {cota && (
            <span className="px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#1B1813]/10 text-[10px] font-mono text-[#5A554A]">
              <strong className="text-[#8C7452] font-medium">Cota:</strong> {cota}
            </span>
          )}
          {rest.slice(0, 2).map((spec) => (
            <span
              key={spec.label}
              className="px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#1B1813]/10 text-[10px] font-mono text-[#5A554A]"
            >
              <strong className="text-[#8C7452] font-medium">{spec.label}:</strong> {spec.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* B · Sección «Ficha de diseño»                                                              */
