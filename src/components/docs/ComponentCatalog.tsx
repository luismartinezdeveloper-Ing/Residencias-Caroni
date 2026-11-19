import React, { useState } from 'react';
import { ArrowLeft, Check, Globe, Layers, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { BRAND_COLORS, BRAND_INFO, UNITS_DATA } from '../../data/brandData';
import { CaroniIsotype } from '../ui/ArchitecturalDrawings';
import { OptimizedPicture } from '../ui/OptimizedPicture';
import { useLocale } from '../../i18n/I18nProvider';
import { getFunnelSummary } from '../../services/analyticsService';

/**
 * Catálogo Interactivo de Componentes & Tokens UI (?docs=ui)
 * Ingeniería de Software: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */
export const ComponentCatalog: React.FC = () => {
  const { locale, setLocale } = useLocale();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [showRecoveryPreview, setShowRecoveryPreview] = useState<boolean>(true);
  const funnelMetrics = getFunnelSummary();

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopiedHex(hex);
    window.setTimeout(() => setCopiedHex(null), 1600);
  };

  const handleReturnToExperience = () => {
    if (typeof window !== 'undefined') {
      window.location.assign(window.location.pathname || '/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B1813] font-sans antialiased">
      {/* Sticky Documentation Header */}
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#C9C4B5]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CaroniIsotype size={26} color="#8C7452" />
            <div>
              <p className="font-meta text-[10px] uppercase tracking-[0.24em] text-[#8C7452]">
                {BRAND_INFO.ref} · UI SYSTEM CATALOG
              </p>
              <h1 className="font-serif text-lg sm:text-xl text-[#1B1813] leading-tight">
                {BRAND_INFO.name} — Design System & Componentes
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C9C4B5] text-[10px] font-meta uppercase tracking-widest hover:border-[#8C7452] transition-colors cursor-pointer"
              aria-label="Cambiar idioma del catálogo"
            >
              <Globe className="w-3.5 h-3.5 text-[#8C7452]" />
              <span>{locale.toUpperCase()}</span>
            </button>

            <button
              type="button"
              onClick={handleReturnToExperience}
              className="btn-apple btn-apple-dark inline-flex items-center gap-1.5 px-4 py-1.5 font-meta text-[10px] uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C9A86A]" />
              <span>{locale === 'en' ? 'Back to Site' : 'Volver a la Obra'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-16">
        {/* 01. Brand Tokens & Color Palette */}
        <section aria-labelledby="catalog-colors">
          <div className="mb-6">
            <span className="font-meta text-[10px] uppercase tracking-[0.25em] text-[#8C7452]">
              01 · Tokens Cromáticos
            </span>
            <h2 id="catalog-colors" className="font-serif text-3xl text-[#1B1813] mt-1">
              Paleta Arquitectónica Institucional
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BRAND_COLORS.map((swatch) => (
              <div
                key={swatch.hex}
                className="bg-white border border-[#C9C4B5]/50 rounded-xl overflow-hidden shadow-xs"
              >
                <div
                  className="h-24 w-full border-b border-[#C9C4B5]/30 flex items-end justify-between p-3"
                  style={{ backgroundColor: swatch.hex }}
                >
                  <button
                    type="button"
                    onClick={() => handleCopyHex(swatch.hex)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1B1813]/85 text-[#FAF9F6] font-mono text-[11px] cursor-pointer"
                  >
                    {copiedHex === swatch.hex ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                    <span>{swatch.hex}</span>
                  </button>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/85 text-[#1B1813]">
                    {swatch.pantone}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-xl text-[#1B1813]">{swatch.name}</h3>
                    <span className="font-meta text-[10px] uppercase tracking-wider text-[#8C7452]">
                      {swatch.subName}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A463E] leading-relaxed">{swatch.functionDesc}</p>
                  <p className="font-mono text-[10px] text-[#8C8678] pt-1">
                    Contraste / Blanco: {swatch.contrastWhite}:1 · {swatch.minPtUsage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02. Typography Hierarchy */}
        <section aria-labelledby="catalog-typography">
          <div className="mb-6">
            <span className="font-meta text-[10px] uppercase tracking-[0.25em] text-[#8C7452]">
              02 · Tipografía Editorial
            </span>
            <h2 id="catalog-typography" className="font-serif text-3xl text-[#1B1813] mt-1">
              Jerarquía EB Garamond, Inter & Mono
            </h2>
          </div>

          <div className="bg-white border border-[#C9C4B5]/50 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#C9C4B5]/30 pb-5">
              <span className="font-meta text-[10px] uppercase tracking-widest text-[#8C8678]">
                Display Editorial · font-serif (EB Garamond)
              </span>
              <p className="font-serif text-3xl sm:text-5xl text-[#1B1813] mt-2 tracking-tight">
                Ocho residencias concebidas como una pieza de autor.
              </p>
            </div>
            <div className="border-b border-[#C9C4B5]/30 pb-5">
              <span className="font-meta text-[10px] uppercase tracking-widest text-[#8C8678]">
                Cuerpo & UI · font-sans (Inter)
              </span>
              <p className="font-sans text-sm sm:text-base text-[#4A463E] mt-2 leading-relaxed max-w-2xl">
                {BRAND_INFO.location} · Orientación norte frente al Parque Nacional El Ávila, con ventanales piso-techo de 3.20 metros de altura libre.
              </p>
            </div>
            <div>
              <span className="font-meta text-[10px] uppercase tracking-widest text-[#8C8678]">
                Metadatos & Cotas Técnicas · font-meta / font-mono
              </span>
              <p className="font-mono text-xs text-[#8C7452] mt-2">
                {BRAND_INFO.coordinates} · COTAS: {BRAND_INFO.cotas.join(' / ')}
              </p>
            </div>
          </div>
        </section>

        {/* 03. Interactive Surfaces & Media Atoms */}
        <section aria-labelledby="catalog-atoms" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-[#C9C4B5]/50 rounded-xl p-6 space-y-5">
            <div>
              <span className="font-meta text-[10px] uppercase tracking-[0.25em] text-[#8C7452]">
                03 · Controles & Superficies
              </span>
              <h2 id="catalog-atoms" className="font-serif text-2xl text-[#1B1813] mt-1">
                Apple Glass & Botones Institucionales
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="button" className="btn-apple btn-apple-dark px-5 py-2.5 text-xs font-meta uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A86A] mr-2 inline" />
                Explorar Maqueta 3D
              </button>
              <button type="button" className="btn-apple px-5 py-2.5 text-xs font-meta uppercase tracking-widest text-[#1B1813] border border-[#C9C4B5]">
                <Layers className="w-3.5 h-3.5 text-[#8C7452] mr-2 inline" />
                Plano Técnico
              </button>
            </div>

            <div className="pt-4 border-t border-[#C9C4B5]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-meta text-[10px] uppercase tracking-widest text-[#8C8678]">
                  MaintenanceBanner (Modo Recuperación)
                </span>
                <button
                  type="button"
                  onClick={() => setShowRecoveryPreview((v) => !v)}
                  className="font-mono text-[10px] text-[#8C7452] underline cursor-pointer"
                >
                  {showRecoveryPreview ? 'Ocultar' : 'Mostrar'} preview
                </button>
              </div>
              {showRecoveryPreview && (
                <div className="bg-[#1B1813] text-[#FAF9F6] border border-[#8C7452]/60 rounded-xl p-3.5 flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-[#C9A86A] shrink-0" />
                  <p className="text-xs text-[#EFEBE0]">
                    Modo de Recuperación Activo · Respaldo local garantizado en conexiones móviles inestables.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#C9C4B5]/50 rounded-xl p-6 space-y-4">
            <div>
              <span className="font-meta text-[10px] uppercase tracking-[0.25em] text-[#8C7452]">
                04 · Media Pipeline & Analítica
              </span>
              <h2 className="font-serif text-2xl text-[#1B1813] mt-1">
                OptimizedPicture (AVIF / WebP)
              </h2>
            </div>

            <div className="aspect-video rounded-lg overflow-hidden border border-[#C9C4B5]/40 bg-[#EFEBE0]">
              <OptimizedPicture
                src="/imagen/facha_sur.jpeg"
                alt="Vista arquitectónica de muestra — Fachada Sur Residencias Caroní"
                priority
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B665B] pt-1">
              <span>Inventario verificado: {UNITS_DATA.length} residencias</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#8C7452]">
                <Activity className="w-3.5 h-3.5" />
                Eventos locales: {Object.values(funnelMetrics).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#C9C4B5]/40 py-6 text-center text-[11px] font-meta text-[#8C8678] tracking-wider">
        {BRAND_INFO.name} · {BRAND_INFO.architect} · DESARROLLO DE SOFTWARE: {BRAND_INFO.leadDeveloper.toUpperCase()}
      </footer>
    </div>
  );
};
