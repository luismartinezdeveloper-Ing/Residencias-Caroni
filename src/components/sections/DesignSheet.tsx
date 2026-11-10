import React from 'react';
import type { GalleryItem } from '../../data/galleryData';
import {
  buildSlideDesignSheet,
  ORIENTATION,
  MATERIALS,
  STRUCTURE,
  STRUCTURE_NOTES,
  SOLAR,
} from '../../data/designData';

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
/* ------------------------------------------------------------------------------------------ */

const CARD = 'rounded-3xl bg-white/80 border border-[#1B1813]/10 p-6 sm:p-8 flex flex-col';
const EYEBROW = 'font-mono text-[10px] tracking-[0.25em] text-[#8C7452] uppercase font-semibold';

function CompassDiagram() {
  const c = 100;
  const r = 70;
  const point = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: c + radius * Math.cos(rad), y: c + radius * Math.sin(rad) };
  };
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto" aria-hidden="true" focusable="false">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#1B1813" strokeOpacity="0.18" />
      <circle cx={c} cy={c} r={r - 14} fill="none" stroke="#1B1813" strokeOpacity="0.08" strokeDasharray="2 3" />
      {[0, 90, 180, 270].map((deg) => {
        const a = point(deg, r - 6);
        const b = point(deg, r + 6);
        return <line key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1B1813" strokeOpacity="0.5" />;
      })}
      <rect x={c - 18} y={c - 12} width="36" height="24" fill="#1B1813" fillOpacity="0.08" stroke="#1B1813" strokeOpacity="0.5" />
      <text x={c} y="18" textAnchor="middle" fontSize="11" fill="#1B1813" fontFamily="Inter, sans-serif" letterSpacing="2">N</text>
      <text x={c} y="194" textAnchor="middle" fontSize="9" fill="#5A554A" fontFamily="Inter, sans-serif" letterSpacing="2">S</text>
      <text x="190" y={c + 3} textAnchor="middle" fontSize="9" fill="#5A554A" fontFamily="Inter, sans-serif" letterSpacing="2">E</text>
      <text x="10" y={c + 3} textAnchor="middle" fontSize="9" fill="#5A554A" fontFamily="Inter, sans-serif" letterSpacing="2">O</text>
      {ORIENTATION.map((b) => {
        const p = point(b.degrees, r);
        return (
          <g key={b.n}>
            <circle cx={p.x} cy={p.y} r="9" fill="#8C7452" />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="10" fill="#FAF9F6" fontFamily="Inter, sans-serif" fontWeight="600">
              {b.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SolarDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="w-full max-w-[260px] mx-auto" aria-hidden="true" focusable="false">
      {/* rayos de sol */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={150 + i * 22} y1="8" x2={92 + i * 22} y2={78 + i * 6} stroke="#C9A86A" strokeWidth="1.2" strokeDasharray="4 3" />
      ))}
      <circle cx="196" cy="16" r="8" fill="#C9A86A" fillOpacity="0.85" />
      {/* zona en sombra bajo el alero */}
      <polygon points="60,86 128,86 128,128 60,128" fill="#1B1813" fillOpacity="0.07" />
      {/* muro y losa */}
      <rect x="42" y="20" width="18" height="108" fill="#A9A59C" stroke="#1B1813" strokeOpacity="0.5" />
      <rect x="42" y="70" width="86" height="12" fill="#A9A59C" stroke="#1B1813" strokeOpacity="0.5" />
      {/* suelo */}
      <line x1="20" y1="128" x2="210" y2="128" stroke="#1B1813" strokeOpacity="0.5" />
      {/* cota del alero */}
      <line x1="60" y1="62" x2="128" y2="62" stroke="#8C7452" />
      <line x1="60" y1="58" x2="60" y2="66" stroke="#8C7452" />
      <line x1="128" y1="58" x2="128" y2="66" stroke="#8C7452" />
      <text x="94" y="55" textAnchor="middle" fontSize="9" fill="#8C7452" fontFamily="Inter, sans-serif" letterSpacing="1">ALERO</text>
      <text x="94" y="112" textAnchor="middle" fontSize="8" fill="#5A554A" fontFamily="Inter, sans-serif" letterSpacing="1">SOMBRA</text>
    </svg>
  );
}

export function DesignSection() {
  return (
    <section id="diseno" aria-labelledby="diseno-title" className="relative bg-[#FAF9F6] border-t border-[#1B1813]/10 py-20 sm:py-28 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12 sm:mb-16 space-y-3">
          <p className={EYEBROW}>Ficha de diseño</p>
          <h2 id="diseno-title" className="font-display text-3xl sm:text-4xl md:text-5xl text-[#1B1813] leading-[1.1] tracking-tight">
            Orientación, materiales, estructura y sol
          </h2>
          <p className="font-serif text-sm sm:text-base text-[#5A554A] leading-relaxed font-light">
            Lo que define cómo se habita la casa: hacia dónde mira, de qué está hecha, cómo se sostiene y cómo se protege del sol tropical.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Orientación */}
          <article className={CARD}>
            <p className={EYEBROW}>Orientación</p>
            <div className="my-6"><CompassDiagram /></div>
            <ol className="space-y-3">
              {ORIENTATION.map((b) => (
                <li key={b.n} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8C7452] text-[10px] font-mono text-[#FAF9F6]" aria-hidden="true">{b.n}</span>
                  <p className="font-serif text-sm leading-snug text-[#1B1813]"><strong className="font-semibold">{b.title}.</strong> {b.detail}</p>
                </li>
              ))}
            </ol>
          </article>

          {/* Materiales */}
          <article className={CARD}>
            <p className={EYEBROW}>Materiales</p>
            <ul className="mt-6 space-y-4">
              {MATERIALS.map((m) => (
                <li key={m.name} className="flex gap-4 items-start">
                  <span className="mt-0.5 h-10 w-10 shrink-0 rounded-lg border border-[#1B1813]/15" style={{ backgroundColor: m.tone }} aria-hidden="true" />
                  <div>
                    <p className="font-display text-lg text-[#1B1813] leading-tight">{m.name}</p>
                    <p className="font-serif text-[13.5px] text-[#5A554A] leading-snug">{m.where}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[10px] text-[#8C8678]">Tono referencial de la muestra. Acabados definitivos según memoria de calidades.</p>
          </article>

          {/* Estructura */}
          <article className={CARD}>
            <p className={EYEBROW}>Estructura</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6">
              {STRUCTURE.map((f) => (
                <div key={f.figure}>
                  <dt className="font-display text-2xl sm:text-3xl text-[#1B1813] leading-none">{f.figure}</dt>
                  <dd className="font-serif text-[13.5px] text-[#5A554A] leading-snug mt-1.5">{f.caption}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-6 pt-5 border-t border-[#1B1813]/10 space-y-1.5">
              {STRUCTURE_NOTES.map((n) => (
                <li key={n} className="font-serif text-sm text-[#1B1813] accent-dot">{n}</li>
              ))}
            </ul>
          </article>

          {/* Protección solar */}
          <article className={CARD}>
            <p className={EYEBROW}>Protección solar</p>
            <div className="my-6"><SolarDiagram /></div>
            <ul className="space-y-3">
              {SOLAR.map((s) => (
                <li key={s.title} className="font-serif text-sm leading-snug text-[#1B1813]">
                  <strong className="font-semibold">{s.title}.</strong> {s.detail}
                </li>
              ))}
            </ul>
            <p className="mt-5 font-mono text-[10px] text-[#8C8678]">Esquema ilustrativo, sin escala.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
