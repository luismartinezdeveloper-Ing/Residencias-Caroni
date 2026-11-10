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
        pillTitle: 'Fachada Principal · Acceso',
        tag: 'Fachada Principal · Portón de Acceso y Balcones Laterales',
        subtitle: 'Proyección ortográfica 2K con portón en el área de acceso (±0.00m) y extensión lateral continua de balcones curvos.',
        image: '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027141757.jpg?v=20261030',
      },
      {
        id: 'elev-2',
        number: '02',
        pillTitle: 'Alzado Lateral & Acceso',
        tag: 'Fachada Lateral · Extensión de Balcones y Portón',
        subtitle: 'Alzado lateral con balcones extendidos en voladizo sobre el área de acceso vehicular, muro en «L» y celosías verticales.',
        image: '/planos/Professional_architectural_orthographic_front_elevation_2K_20261027142134.jpg?v=20261030',
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
        subtitle: 'Detalle de losas de concreto armado, piscinas de planta baja con muro continuo de piedra laja y alturas de 3.20 m.',
        image: '/planos/Architectural_sectional_cutaway_perspective_3D_2K_20261027142408.jpg?v=20261030',
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
        pillTitle: 'Fachada de Acceso Real',
        tag: 'Render Arquitectónico · Pórtico de Acceso y Balcones Laterales',
        subtitle: 'Vista real de la fachada de acceso con el portón en la zona exterior de entrada, rampa de 5 franjas y balcones extendidos lateralmente.',
        image: '/planos/RC-exterior.entrada-costado-real_2K.jpg?v=20261030',
      },
      {
        id: 'persp-2',
        number: '02',
        pillTitle: 'Fachada Frontal',
        tag: 'Fachada Frontal 2K',
        subtitle: 'Alzado en alta definición bajo la atmósfera lumínica matutina de Altamira.',
        image: '/planos/RC-exterior.frontal.jpeg_2K_20261027140555.jpg',
      },
      {
        id: 'persp-3',
        number: '03',
        pillTitle: 'Encuadre de Autor',
        tag: 'Encuadre Arquitectónico',
        subtitle: 'Perspectiva con ángulo medio destacando la horizontalidad monolítica de la obra.',
        image: '/planos/RC-exterior.frontal.jpeg_2K_20261027141020.jpg',
      },
      {
        id: 'persp-4',
        number: '04',
        pillTitle: 'Axonometría de Acceso',
        tag: 'Pórtico, Rampa y Extensión Lateral de Balcones',
        subtitle: 'Detalle axonométrico del portón posicionado en el área de acceso, rampa vehicular y balcones extendidos lateralmente.',
        image: '/planos/RC-exterior.entrada-costado.jpeg_2K_20261027142428.jpg?v=20261030',
      },
    ],
  },
];

export const InteractiveElevationViewer: React.FC<InteractiveElevationViewerProps> = () => {
  const [activeCategory, setActiveCategory] = useState<ViewCategoryId>('elevacion');
  const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0);
  const [isMobileRailOpen, setIsMobileRailOpen] = useState<boolean>(false);
  const [loupeCoords, setLoupeCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loupeImageCoords, setLoupeImageCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  // Loupe Mouse Tracking — Activa y alinea con precisión exclusivamente al posar el cursor sobre la lámina
  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || !canvasRef.current) return;
    const iRect = imgRef.current.getBoundingClientRect();
    const cRect = canvasRef.current.getBoundingClientRect();

    const imgX = Math.max(0, Math.min(e.clientX - iRect.left, iRect.width));
    const imgY = Math.max(0, Math.min(e.clientY - iRect.top, iRect.height));

    const canvasX = e.clientX - cRect.left;
    const canvasY = e.clientY - cRect.top;

    setLoupeCoords({ x: canvasX, y: canvasY });
    setLoupeImageCoords({ x: imgX, y: imgY });
    setImageDimensions({ width: iRect.width, height: iRect.height });
    setIsHoveringImage(true);
  };

  const handleImageMouseEnter = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || !canvasRef.current) return;
    const iRect = imgRef.current.getBoundingClientRect();
    const cRect = canvasRef.current.getBoundingClientRect();

    const imgX = Math.max(0, Math.min(e.clientX - iRect.left, iRect.width));
    const imgY = Math.max(0, Math.min(e.clientY - iRect.top, iRect.height));

    setLoupeCoords({ x: e.clientX - cRect.left, y: e.clientY - cRect.top });
    setLoupeImageCoords({ x: imgX, y: imgY });
    setImageDimensions({ width: iRect.width, height: iRect.height });
    setIsHoveringImage(true);
  };

  const handleImageMouseLeave = () => {
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
                  ref={imgRef}
                  src={currentVariant.image}
                  alt={currentVariant.tag}
                  onMouseMove={handleImageMouseMove}
                  onMouseEnter={handleImageMouseEnter}
                  onMouseLeave={handleImageMouseLeave}
                  className="max-w-full max-h-full object-contain pointer-events-auto select-none drop-shadow-xl cursor-crosshair"
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
                  className="px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-md text-[#1B1813] font-mono text-[11px] tracking-wider uppercase font-semibold flex items-center space-x-1.5 cursor-pointer"
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
                <div className="border-b border-[#1B1813]/10 pb-2.5">
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
                                className={`w-full text-left px-4 py-2 rounded-full text-[11px] font-mono tracking-wider transition-all duration-200 uppercase flex items-center justify-between cursor-pointer active:scale-[0.98] ${isCatActive
                                    ? 'bg-[#1B1813]/90 text-[#FAF9F6] shadow-[0_2px_8px_rgba(27,24,19,0.2),inset_0_1px_0.5px_rgba(255,255,255,0.25)] border border-white/20 backdrop-blur-md font-semibold'
                                    : 'text-[#5A554A] hover:text-[#1B1813] hover:bg-white/60 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-transparent hover:border-white/50'
                                  }`}
                          >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isCatActive ? 'bg-[#C9A86A] shadow-[0_0_6px_#C9A86A]' : 'bg-[#1B1813]/25'
                        }`}
                      />
                      <span>{cat.label}</span>
                    </div>
                  </button>

                    {/* Tomas de la Categoría Activa */ }
                    <AnimatePresence>
                      {isCatActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden pl-3 pr-0 py-1 space-y-1 my-1"
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
                                className={`w-full text-left px-3.5 py-2 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-[0.98] ${isVarActive
                                    ? 'bg-gradient-to-r from-[#8C7452] to-[#A08255] text-white shadow-[0_2px_8px_rgba(140,116,82,0.35),inset_0_1px_0.5px_rgba(255,255,255,0.3)] border border-white/30 font-medium'
                                    : 'text-[#5A554A] hover:text-[#1B1813] hover:bg-white/60 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-transparent hover:border-white/50'
                                  }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVarActive ? 'bg-white shadow-[0_0_4px_#ffffff]' : 'bg-[#1B1813]/25'}`} />
                                  <span className="truncate">{variant.pillTitle}</span>
                                </div>
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

              {/* Footer del Rail: Cédula de Lámina */}
              <div className="border-t border-[#1B1813]/10 pt-2.5">
                {/* Ficha Resumida de la Lámina */}
                <div className="bg-white/50 backdrop-blur-md rounded-xl p-2.5 border border-white/80 shadow-2xs space-y-1">
                  <div className="font-display text-[13px] text-[#1B1813] font-semibold leading-tight">
                    {currentVariant.tag}
                  </div>
                  <div className="font-serif text-xs text-[#5A554A] font-light leading-snug line-clamp-3 italic">
                    «{currentVariant.subtitle}»
                  </div>
                </div>
              </div>
            </div>

            {/* ── LUPA CIRCULAR APPLE 2.5X (ACTIVA EXCLUSIVAMENTE AL POSAR EL CURSOR SOBRE LA IMAGEN) ── */}
            {isHoveringImage && imageDimensions.width > 0 && (
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
                <img
                  src={currentVariant.image}
                  alt="Aumento de plano"
                  className="absolute pointer-events-none max-w-none select-none"
                  style={{
                    width: `${imageDimensions.width * ZOOM_FACTOR}px`,
                    height: `${imageDimensions.height * ZOOM_FACTOR}px`,
                    left: `${LENS_RADIUS - loupeImageCoords.x * ZOOM_FACTOR}px`,
                    top: `${LENS_RADIUS - loupeImageCoords.y * ZOOM_FACTOR}px`,
                    objectFit: 'contain',
                  }}
                />

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
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#1B1813]/85 backdrop-blur-md border border-white/25 text-[10px] font-mono tracking-widest text-[#FAF9F6] uppercase whitespace-nowrap shadow-md">
                  2.5× DETALLE
                </div>
              </div>
            )}
          </div>
        </section>
        );
};