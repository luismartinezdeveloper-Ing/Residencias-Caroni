import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UnitData } from '../../types/brand';

/**
 * Explorador Monográfico de Planos & Estratigrafía 2K — Rail Flotante Apple Glass
 * Residencias Caroní · Altamira, Caracas
 * 
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Ingeniería de Software & Experiencia Interactiva: Ing. Luis Martinez
 */

interface InteractiveElevationViewerProps {
  selectedUnit?: UnitData;
  onSelectUnit?: (unit: UnitData) => void;
  onInspectUnitDetails?: (unit: UnitData) => void;
  onOpen3DModal?: (initialMode?: 'assembled' | 'exploded' | 'floorplan') => void;
}

type ViewCategoryId = 'elevacion' | 'corte' | 'explotado' | 'perspectiva';

interface ViewVariant {
  id: string;
  number: string;
  pillTitle: string;
  tag: string;
  subtitle: string;
  image: string;
}

interface ArchitecturalCategory {
  id: ViewCategoryId;
  label: string;
  code: string;
  badge: string;
  variants: ViewVariant[];
}

const ARCHITECTURAL_CATEGORIES: ArchitecturalCategory[] = [
  {
    id: 'elevacion',
    label: 'Elevación Frontal',
    code: '01',
    badge: 'PROYECCIÓN ORTOGRÁFICA 2K',
    variants: [
      {
        id: 'elev-1',
        number: '01',
        pillTitle: 'Fachada Principal',
        tag: 'Fachada Norte · Altimetría Principal',
        subtitle: 'Proyección ortográfica en obra limpia con cotas de nivel y modulación de celosías.',
        image: '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027141757.jpg',
      },
      {
        id: 'elev-2',
        number: '02',
        pillTitle: 'Modulación de Vanos',
        tag: 'Modulación de Ventanales',
        subtitle: 'Estudio de llenos y vacíos con protección solar pasiva y ritmo arquitectónico continuo.',
        image: '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027142134.jpg',
      },
      {
        id: 'elev-3',
        number: '03',
        pillTitle: 'Coronamiento & Aleros',
        tag: 'Cotas y Coronamiento',
        subtitle: 'Alzado técnico completo con detalle de aleros y remate mirador de penthouse.',
        image: '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027142540.jpg',
      },
    ],
  },
  {
    id: 'corte',
    label: 'Corte Seccional 3D',
    code: '02',
    badge: 'SECCIÓN ARQUITECTÓNICA 2K',
    variants: [
      {
        id: 'corte-1',
        number: '01',
        pillTitle: 'Sección Transversal',
        tag: 'Corte Transversal Norte-Sur',
        subtitle: 'Sección espacial que expone el dúplex jardín, salones centrales y doble altura.',
        image: '/planos/Architectural_sectional_cutaway_perspective_3D_2K_20261027141845.jpg',
      },
      {
        id: 'corte-2',
        number: '02',
        pillTitle: 'Espacialidad PB',
        tag: 'Espacialidad Interior PB',
        subtitle: 'Relación directa entre las terrazas privadas de planta baja y los salones diáfanos.',
        image: '/planos/Architectural_sectional_cutaway_perspective_3D_2K_20261027142150.jpg',
      },
      {
        id: 'corte-3',
        number: '03',
        pillTitle: 'Estructura de Losas',
        tag: 'Transición Estructural de Losas',
        subtitle: 'Detalle de losas de concreto armado sin columnas intermedias y alturas de 3.20 m.',
        image: '/planos/Architectural_sectional_cutaway_perspective_3D_2K_20261027142408.jpg',
      },
      {
        id: 'corte-4',
        number: '04',
        pillTitle: 'Mirador Penthouse',
        tag: 'Mirador Superior Penthouse',
        subtitle: 'Remate cenital y terrazas panorámicas con vistas abiertas de 180° a El Ávila.',
        image: '/planos/Architectural_sectional_cutaway_perspective_3D_2K_20261027142554.jpg',
      },
    ],
  },
  {
    id: 'explotado',
    label: 'Diagrama Explotado',
    code: '03',
    badge: 'ESTRUCTURA AXONOMÉTRICA 2K',
    variants: [
      {
        id: 'expl-1',
        number: '01',
        pillTitle: 'Despiece Integral',
        tag: 'Despiece Axonométrico Integral',
        subtitle: 'Separación vertical de losas que revela la independencia acústica y estructural por nivel.',
        image: '/planos/Axonometric_exploded_architectural_diagram_of_2K_20261027141100.jpg',
      },
      {
        id: 'expl-2',
        number: '02',
        pillTitle: 'Estratigrafía de Niveles',
        tag: 'Estratigrafía de Niveles',
        subtitle: 'Lectura secuencial desde el subsuelo de estacionamientos hasta la cubierta mirador.',
        image: '/planos/Axonometric_exploded_architectural_diagram_of_2K_20261027141958.jpg',
      },
      {
        id: 'expl-3',
        number: '03',
        pillTitle: 'Terrazas en Voladizo',
        tag: 'Capas y Terrazas en Volado',
        subtitle: 'Articulación de los balcones en voladizo continuo y jardineras perimetrales.',
        image: '/planos/Axonometric_exploded_architectural_diagram_of_2K_20261027142207.jpg',
      },
      {
        id: 'expl-4',
        number: '04',
        pillTitle: 'Núcleo & Circulaciones',
        tag: 'Núcleo Central y Circulaciones',
        subtitle: 'Ubicación de los ascensores privados directos y cajas de escaleras presurizadas.',
        image: '/planos/Axonometric_exploded_architectural_diagram_of_2K_20261027142625.jpg',
      },
    ],
  },
  {
    id: 'perspectiva',
    label: 'Perspectiva Real 2K',
    code: '04',
    badge: 'RENDER FOTORREALISTA 2K',
    variants: [
      {
        id: 'persp-1',
        number: '01',
        pillTitle: 'Fachada Frontal',
        tag: 'Fachada Frontal 2K',
        subtitle: 'Renderizado en alta definición bajo la atmósfera lumínica matutina de Altamira.',
        image: '/planos/RC-exterior.frontal.jpeg_2K_20261027140555.jpg',
      },
      {
        id: 'persp-2',
        number: '02',
        pillTitle: 'Encuadre de Autor',
        tag: 'Encuadre Arquitectónico',
        subtitle: 'Perspectiva con ángulo medio destacando la horizontalidad monolítica de la obra.',
        image: '/planos/RC-exterior.frontal.jpeg_2K_20261027141020.jpg',
      },
      {
        id: 'persp-3',
        number: '03',
        pillTitle: 'Pórtico & Acceso',
        tag: 'Pórtico y Acceso Peatonal',
        subtitle: 'Detalle de la llegada peatonal, muros vegetales y control biométrico discreto.',
        image: '/planos/RC-exterior.entrada-costado.jpeg_2K_20261027142428.jpg',
      },
    ],
  },
];

export const InteractiveElevationViewer: React.FC<InteractiveElevationViewerProps> = () => {
  const [activeCategory, setActiveCategory] = useState<ViewCategoryId>('elevacion');
  const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0);
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [isMobileRailOpen, setIsMobileRailOpen] = useState<boolean>(false);
  const [loupeCoords, setLoupeCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const currentCategoryConfig = ARCHITECTURAL_CATEGORIES.find((c) => c.id === activeCategory)!;
  const currentVariant = currentCategoryConfig.variants[activeVariantIndex] || currentCategoryConfig.variants[0];

  const handleSelectCategory = (categoryId: ViewCategoryId) => {
    setActiveCategory(categoryId);
    setActiveVariantIndex(0);
  };

  const handleNextVariant = () => {
    setActiveVariantIndex((prev) => (prev + 1) % currentCategoryConfig.variants.length);
  };

  const handlePrevVariant = () => {
    setActiveVariantIndex((prev) => (prev - 1 + currentCategoryConfig.variants.length) % currentCategoryConfig.variants.length);
  };

  // Loupe Mouse Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setLoupeCoords({ x, y });
  };

  const handleMouseEnter = () => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setImageDimensions({ width: rect.width, height: rect.height });
    setIsHoveringImage(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringImage(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextVariant();
      } else if (e.key === 'ArrowLeft') {
        handlePrevVariant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCategoryConfig.variants.length]);

  // Dimensiones Lupa
  const LENS_DIAMETER = 210;
  const LENS_RADIUS = LENS_DIAMETER / 2;
  const ZOOM_FACTOR = 2.5;

  return (
    <section
      id="elevacion"
      className="relative w-full h-[calc(100vh-4.5rem)] min-h-[580px] max-h-[960px] bg-[#FAF9F6] border-t border-[#1B1813]/10 flex items-center justify-center p-2 sm:p-4 lg:p-6 select-none scroll-mt-20 overflow-hidden"
    >
      {/* Resplandor ambiental marfil cálido */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,168,106,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* LIENZO DE LA MESA DE DIBUJO CON RAIL FLOTANTE */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full max-w-7xl mx-auto rounded-3xl overflow-hidden border border-[#1B1813]/12 shadow-[0_25px_70px_rgba(27,24,19,0.08)] bg-[#F5F2EA]/60 flex items-center justify-center group"
      >
        {/* Marcas de Registro Técnico CAD en las 4 Esquinas */}
        <div className="absolute top-3 left-4 font-mono text-[11px] text-[#1B1813]/20 select-none pointer-events-none">＋</div>
        <div className="absolute top-3 right-4 font-mono text-[11px] text-[#1B1813]/20 select-none pointer-events-none">＋</div>
        <div className="absolute bottom-3 left-4 font-mono text-[11px] text-[#1B1813]/20 select-none pointer-events-none">＋</div>
        <div className="absolute bottom-3 right-4 font-mono text-[11px] text-[#1B1813]/20 select-none pointer-events-none">＋</div>

          {/* ── ESCENARIO DE LA LÁMINA 2K (DESPEJADO CON PADDING ADAPTATIVO) ── */}
          <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 lg:pl-[330px] lg:pr-8 lg:py-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentVariant.id}
                initial={{ opacity: 0, scale: 0.993 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={currentVariant.image}
                  alt={currentVariant.tag}
                  className="max-w-full max-h-full object-contain pointer-events-none select-none drop-shadow-xl"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>

            {/* Flechas de Avance Rápido */}
            <button
              onClick={handlePrevVariant}
              className="absolute left-4 lg:left-[325px] top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/70 hover:bg-white backdrop-blur-2xl border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-[#1B1813] flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-20 opacity-70 group-hover:opacity-100"
              title="Lámina anterior (← Flecha Izquierda)"
            >
              ‹
            </button>

            <button
              onClick={handleNextVariant}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/70 hover:bg-white backdrop-blur-2xl border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-[#1B1813] flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-20 opacity-70 group-hover:opacity-100"
              title="Siguiente lámina (→ Flecha Derecha)"
            >
              ›
            </button>
          </div>

              {/* ── BOTÓN TOGGLE PARA MÓVIL ── */}
              <div className="absolute top-4 left-4 z-40 lg:hidden">
                <button
                  onClick={() => setIsMobileRailOpen(!isMobileRailOpen)}
                  className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-md text-[#1B1813] font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C7452]" />
                  <span>{isMobileRailOpen ? '✕ CERRAR MENÚ' : '☰ PLANOS & VISTAS'}</span>
                </button>
              </div>

              {/* ── RAIL FLOTANTE APPLE GLASS (LADO IZQUIERDO DENTRO DEL CANVAS) ── */}
              <div
                className={`absolute left-3 sm:left-5 top-3 sm:top-5 bottom-3 sm:bottom-5 w-[280px] sm:w-[300px] z-30 flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/75 backdrop-blur-3xl border border-white/90 shadow-[0_20px_50px_rgba(27,24,19,0.12),0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)] ring-1 ring-black/[0.04] transition-all duration-300 ${isMobileRailOpen ? 'translate-x-0 opacity-100' : '-translate-x-[115%] lg:translate-x-0 opacity-0 lg:opacity-100'
                  }`}
              >
                {/* Header del Rail */}
                <div className="space-y-2 border-b border-[#1B1813]/10 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#8C7452] shadow-[0_0_8px_rgba(140,116,82,0.4)]" />
                      <span className="font-mono text-[9.5px] text-[#8C7452] tracking-[0.22em] uppercase font-bold">
                        AÑIL ARQUITECTURA
                      </span>
                    </div>
                    <span className="font-mono text-[8.5px] px-2 py-0.5 rounded-full bg-[#1B1813]/5 text-[#5A554A] uppercase font-semibold">
                      ARCHIVO 2K
                    </span>
                  </div>
                  <div className="font-display text-sm text-[#1B1813] font-semibold tracking-tight">
                    Estratigrafía & Láminas Técnicas
                  </div>
                </div>

                    {/* Menú Interactivo Acordeón de Familias y Tomas */ }
                    <div className="flex-1 overflow-y-auto no-scrollbar py-2.5 space-y-1.5 my-1">
                      {ARCHITECTURAL_CATEGORIES.map((cat) => {
                        const isCatActive = activeCategory === cat.id;

                        return (
                                  < div key={cat.id} className="space-y-1">
                              {/* Botón de Categoría */}
                              <button
                                onClick={() => {
                                  handleSelectCategory(cat.id);
                                  setIsMobileRailOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-[10px] sm:text-[10.5px] font-mono tracking-wider transition-all duration-200 uppercase flex items-center justify-between cursor-pointer ${isCatActive
                                    ? 'bg-[#1B1813] text-[#FAF9F6] shadow-sm font-semibold'
                                    : 'text-[#5A554A] hover:text-[#1B1813] hover:bg-black/[0.03]'
                                  }`}
                          >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isCatActive ? 'bg-[#C9A86A]' : 'bg-[#1B1813]/25'
                        }`}
                      />
                      <span>{cat.code} · {cat.label}</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded-full ${isCatActive ? 'bg-white/20 text-[#FAF9F6]' : 'text-[#8C8678]'}`}>
                      {cat.variants.length}
                    </span>
                  </button>

                    {/* Tomas de la Categoría Activa */ }
                    <AnimatePresence>
                      {isCatActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#8C7452]/30 ml-2.5 my-1"
                        >
                          {cat.variants.map((variant, idx) => {
                            const isVarActive = activeVariantIndex === idx;

                            return (
                              <button
                                key={variant.id}
                                onClick={() => {
                                  setActiveVariantIndex(idx);
                                  setIsMobileRailOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[9px] sm:text-[9.5px] font-mono tracking-wider uppercase transition-all duration-150 flex items-center justify-between cursor-pointer ${isVarActive
                                    ? 'bg-[#8C7452]/15 text-[#1B1813] font-bold border-l-2 border-[#8C7452] shadow-2xs'
                                    : 'text-[#5A554A] hover:text-[#1B1813] hover:bg-black/[0.03]'
                                  }`}
                              >
                                <div className="flex items-center space-x-1.5 truncate">
                                  <span className={isVarActive ? 'text-[#8C7452]' : 'text-[#1B1813]/25'}>▪</span>
                                  <span className="truncate">{variant.pillTitle}</span>
                                </div>
                                <span className="text-[8px] font-serif text-[#8C8678] shrink-0 ml-1">
                                  {variant.number}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
                );
            })}
              </div>

              {/* Footer del Rail: Lupa 2.5x & Cédula de Lámina */}
              <div className="space-y-2.5 border-t border-[#1B1813]/10 pt-3">
                {/* Botón Lupa de Precisión */}
                <button
                  onClick={() => setIsLoupeActive(!isLoupeActive)}
                  className={`w-full py-2 px-3 rounded-xl text-[9px] sm:text-[9.5px] font-mono tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer border ${isLoupeActive
                      ? 'bg-[#1B1813] text-[#FAF9F6] border-[#1B1813] shadow-sm font-semibold'
                      : 'bg-white/80 text-[#5A554A] border-white/80 hover:text-[#1B1813] hover:bg-white shadow-xs'
                    }`}
                >
                  <span className={isLoupeActive ? 'text-[#C9A86A]' : 'text-[#8C7452]'}>⌕</span>
                  <span>LUPA 2.5×: {isLoupeActive ? 'ACTIVA' : 'INACTIVA'}</span>
                </button>

                {/* Ficha Resumida de la Lámina */}
                <div className="bg-white/50 backdrop-blur-md rounded-xl p-2.5 border border-white/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[8px] font-mono text-[#8C7452] uppercase font-bold tracking-wider">
                    <span>LÁMINA {currentVariant.number}</span>
                    <span>{currentCategoryConfig.badge.split(' ')[0]}</span>
                  </div>
                  <div className="font-display text-[11px] text-[#1B1813] font-semibold leading-tight truncate">
                    {currentVariant.tag}
                  </div>
                  <div className="font-serif text-[10px] text-[#5A554A] font-light leading-snug line-clamp-2 italic">
                    «{currentVariant.subtitle}»
                  </div>
                </div>

                {/* Autoría Oficial */}
                <div className="text-[7.5px] font-mono text-[#8C8678] uppercase tracking-wider text-center pt-0.5">
                  Arq. Juan Carlos Láncara · Ing. Luis Martinez
                </div>
              </div>
            </div>

            {/* ── LUPA CIRCULAR APPLE 2.5X (CUANDO ESTÁ ACTIVA) ── */}
            {isLoupeActive && isHoveringImage && (
              <div
                className="pointer-events-none absolute z-40 rounded-full overflow-hidden transition-opacity duration-150 ease-out"
                style={{
                  width: `${LENS_DIAMETER}px`,
                  height: `${LENS_DIAMETER}px`,
                  left: `${loupeCoords.x}px`,
                  top: `${loupeCoords.y}px`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow:
                    '0 25px 60px -10px rgba(27,24,19,0.45), 0 10px 20px -5px rgba(27,24,19,0.25), inset 0 0 15px rgba(255,255,255,0.45)',
                  border: '2.5px solid rgba(255, 255, 255, 0.95)',
                }}
              >
                {imageDimensions.width > 0 && (
                  <img
                    src={currentVariant.image}
                    alt="Aumento de plano"
                    className="absolute pointer-events-none max-w-none select-none"
                    style={{
                      width: `${imageDimensions.width * ZOOM_FACTOR}px`,
                      height: `${imageDimensions.height * ZOOM_FACTOR}px`,
                      left: `${LENS_RADIUS - loupeCoords.x * ZOOM_FACTOR}px`,
                      top: `${LENS_RADIUS - loupeCoords.y * ZOOM_FACTOR}px`,
                      objectFit: 'contain',
                    }}
                  />
                )}

                {/* Reflejo Especular Diagonal Apple */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.1] to-white/[0.35] pointer-events-none" />

                {/* Anillo Perimetral Oro Cálido */}
                <div className="absolute inset-0 rounded-full border border-[#8C7452]/40 pointer-events-none" />

                {/* Retícula de Precisión */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-[1px] bg-white/80 absolute shadow-[0_0_2px_rgba(0,0,0,0.6)]" />
                  <div className="h-5 w-[1px] bg-white/80 absolute shadow-[0_0_2px_rgba(0,0,0,0.6)]" />
                  <div className="w-2 h-2 rounded-full bg-[#C9A86A] shadow-[0_0_8px_#C9A86A] z-10 border border-black/40" />
                </div>

                {/* Micro-Píldora Flotante Superior */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#1B1813]/85 backdrop-blur-md border border-white/25 text-[8px] font-mono tracking-widest text-[#FAF9F6] uppercase whitespace-nowrap shadow-md">
                  2.5× DETALLE
                </div>
              </div>
            )}
          </div>
        </section>
        );
};