import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'motion/react';

type GalleryCategoryId = 'exteriores' | 'pb-norte' | 'pb-sur' | 'penthouse';

interface CategoryConfig {
  id: GalleryCategoryId;
  label: string;
  badge: string;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'exteriores', label: 'Exteriores', badge: 'FACHADAS & ENTORNO' },
  { id: 'pb-norte', label: 'PB Norte · Ávila', badge: 'RESIDENCIAS PB NORTE' },
  { id: 'pb-sur', label: 'PB Sur · Valle', badge: 'RESIDENCIAS PB SUR' },
  { id: 'penthouse', label: 'Penthouse', badge: 'MIRADORES SUPERIORES' },
];

interface GallerySlide {
  id: string;
  categoryId: GalleryCategoryId;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  dockLabel: string;
}

const ALL_SLIDES: GallerySlide[] = [
  // 1. EXTERIORES & FACHADAS
  {
    id: 'ext-frontal',
    categoryId: 'exteriores',
    tag: 'FACHADA PRINCIPAL',
    title: 'El Ávila como Testigo',
    subtitle: 'Implantación al pie del Parque Nacional en Altamira. Ocho residencias concebidas como un solo volumen escultórico que dialoga con la tradición moderna caraqueña.',
    image: '/imagen/exterior/RC-exterior.frontal.jpeg',
    dockLabel: 'Frontal',
  },
  {
    id: 'ext-urbana',
    categoryId: 'exteriores',
    tag: 'IMPLANTACIÓN URBANA',
    title: 'Presencia en la 8va Transversal',
    subtitle: 'Relación armónica con el perfil urbano de Altamira. El edificio se retranquea generando un zócalo vegetal que aporta privacidad absoluta a las residencias de cota baja.',
    image: '/imagen/exterior/RC-exterior.frontal-lejos.jpeg',
    dockLabel: 'Urbana',
  },
  {
    id: 'ext-celosias',
    categoryId: 'exteriores',
    tag: 'HONESTIDAD CONSTRUCTIVA',
    title: 'Materia y Verdad',
    subtitle: 'Concreto visto en obra limpia, celosías de protección solar y perfilería arquitectónica. Materiales nobles que dialogan con el clima y envejecen con carácter.',
    image: '/imagen/exterior/RC.exterior.ventanal-p1op2.jpeg',
    dockLabel: 'Celosías',
  },
  {
    id: 'ext-lateral',
    categoryId: 'exteriores',
    tag: 'VOLUMETRÍA ESCULTÓRICA',
    title: 'Alzado Lateral y Muros Pantalla',
    subtitle: 'Muros ciegos en concreto visto intercalados con aberturas estratégicas. Una arquitectura que resguarda la privacidad entre vecinos y orienta las miradas hacia la naturaleza.',
    image: '/imagen/exterior/RC-exterior.costado.izquierdo.jpeg',
    dockLabel: 'Lateral',
  },
  {
    id: 'ext-acceso',
    categoryId: 'exteriores',
    tag: 'ACCESO & UMBRAL',
    title: 'Pórtico y Entrada Peatonal',
    subtitle: 'El umbral de ingreso está concebido como una transición de serenidad: control de acceso biométrico discreto, pavimento en granito pulido y muro vegetal de bienvenida.',
    image: '/imagen/exterior/RC-exterior.entrada-costado.jpeg',
    dockLabel: 'Acceso',
  },
  {
    id: 'ext-patio',
    categoryId: 'exteriores',
    tag: 'JARDINES & PAISAJISMO',
    title: 'Patio Ajardinado de Planta Baja',
    subtitle: 'Un microclima fresco al pie del Ávila que ofrece el confort de una casa unifamiliar aislada con la total seguridad de un conjunto privado de autor.',
    image: '/imagen/exterior/RC-exterior.PB-patio.jpeg',
    dockLabel: 'Patio',
  },

  // 2. PB NORTE · EL ÁVILA
  {
    id: 'pbn-salon',
    categoryId: 'pb-norte',
    tag: 'ÁREA SOCIAL',
    title: 'Espacios sin Fronteras',
    subtitle: 'Alturas libres imponentes de 3.20 metros, salones diáfanos sin columnas intermedias y una transición fluida hacia los ventanales que baña el interior de luz natural tamizada.',
    image: '/imagen/interior/pb-norte/02_PB_Norte_Salon.jpeg',
    dockLabel: 'Salón',
  },
  {
    id: 'pbn-terraza',
    categoryId: 'pb-norte',
    tag: 'EXTERIOR EXCLUSIVO',
    title: 'El Jardín y la Terraza Norte',
    subtitle: 'Terrazas continuas y jardines privados protegidos del entorno urbano. Un oasis de calma diseñado para la contemplación directa de la cresta verde del Parque Nacional.',
    image: '/imagen/interior/pb-norte/01_PB_Norte_Terraza.jpeg',
    dockLabel: 'Terraza',
  },
  {
    id: 'pbn-cocina',
    categoryId: 'pb-norte',
    tag: 'ALTA COCINA DE AUTOR',
    title: 'Cocina Gourmet & Isla Social',
    subtitle: 'Isla central escultórica en cuarcita exótica con carpintería europea oculta sin tiradores. Equipada con electrodomésticos empotrados de grado profesional e iluminación cenital.',
    image: '/imagen/interior/pb-norte/03_PB_Norte_Cocina.jpg.jpeg',
    dockLabel: 'Cocina',
  },

  // 3. PB SUR · EL VALLE
  {
    id: 'pbs-salon',
    categoryId: 'pb-sur',
    tag: 'ÁREA SOCIAL',
    title: 'Salón Principal Diáfano PB Sur',
    subtitle: 'Composición sobria orientada al sur hacia la panorámica del valle de Caracas. Su orientación captura una calidez solar envolvente durante las mañanas y tardes caraqueñas.',
    image: '/imagen/interior/pb-sur/05_PB_Sur_Salon.jpeg',
    dockLabel: 'Salón',
  },
  {
    id: 'pbs-terraza',
    categoryId: 'pb-sur',
    tag: 'EXPANSIÓN PRIVADA',
    title: 'Terraza y Deck Perimetral PB Sur',
    subtitle: 'Refugio al aire libre con aleros de concreto que proporcionan sombra permanente y resguardo de la lluvia tropical sin restar luminosidad al interior.',
    image: '/imagen/interior/pb-sur/04_PB_Sur_Terraza.jpeg',
    dockLabel: 'Terraza',
  },
  {
    id: 'pbs-cocina',
    categoryId: 'pb-sur',
    tag: 'ALTA COCINA DE AUTOR',
    title: 'Cocina & Desayunador PB Sur',
    subtitle: 'Concepto abierto que articula elegancia minimalista con funcionalidad gastronómica. Tonos minerales cálidos y conexión directa con el comedor formal y área de servicio.',
    image: '/imagen/interior/pb-sur/06_PB_Sur_Cocina.jpg.jpeg',
    dockLabel: 'Cocina',
  },

  // 4. PENTHOUSE
  {
    id: 'ph-cima',
    categoryId: 'penthouse',
    tag: 'MIRADOR SUPERIOR',
    title: 'La Cima Panorámica',
    subtitle: 'Perspectivas privilegiadas de 180° sobre el valle de Caracas y la cresta verde del Ávila, con terrazas perimetrales y privacidad absoluta.',
    image: '/imagen/exterior/RC-exterior.ventanal-PH.jpeg',
    dockLabel: 'Mirador',
  },
  {
    id: 'ph-doble-altura',
    categoryId: 'penthouse',
    tag: 'VOLADIZOS Y VENTANALES',
    title: 'Doble Altura y Voladizos Perimetrales',
    subtitle: 'Grandes luces estructurales con losas en voladizo continuo. Fachadas completamente acristaladas con atenuación solar y acústica de máxima especificación.',
    image: '/imagen/exterior/RC.exterior.ventanal.jpeg',
    dockLabel: 'Doble Altura',
  },
  {
    id: 'ph-transicion',
    categoryId: 'penthouse',
    tag: 'LUCES Y CELOSÍAS',
    title: 'Transición Vidriada y Luz Cenital',
    subtitle: 'La modulación de celosías regula el asoleamiento de la tarde, creando un juego dinámico de luces y sombras en los salones de doble altura.',
    image: '/imagen/exterior/RC.exterior.sala-ventanal-p1op2.jpeg',
    dockLabel: 'Ventanales',
  },
];

interface AppleCircularLoupeImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

const AppleCircularLoupeImage: React.FC<AppleCircularLoupeImageProps> = ({
  src,
  alt,
  priority = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const LENS_DIAMETER = 190; // Diámetro óptico lupa circular clásica Apple
  const LENS_RADIUS = LENS_DIAMETER / 2;
  const ZOOM_FACTOR = 2.5;

  const updateCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    setCoords({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    updateCoordinates(e.clientX, e.clientY);
    setIsHovering(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    const touch = e.touches[0];
    updateCoordinates(touch.clientX, touch.clientY);
    setIsHovering(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    updateCoordinates(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsHovering(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[44vh] sm:h-[50vh] md:h-[66vh] rounded-2xl overflow-hidden border border-[#1B1813]/10 shadow-[0_15px_35px_rgba(27,24,19,0.08)] bg-[#EFEBE0] group cursor-crosshair select-none"
    >
      {/* Imagen Arquitectónica Pura */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
      />

      {/* Sutil halo interior para acabado editorial */}
      <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(27,24,19,0.06)] pointer-events-none rounded-2xl" />

      {/* Lupa Circular Clásica Estilo Apple */}
      <div
        className="pointer-events-none absolute z-30 rounded-full overflow-hidden transition-opacity duration-150 ease-out"
        style={{
          width: `${LENS_DIAMETER}px`,
          height: `${LENS_DIAMETER}px`,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: 'translate(-50%, -50%)',
          opacity: isHovering ? 1 : 0,
          boxShadow:
            '0 25px 60px -10px rgba(27,24,19,0.45), 0 10px 20px -5px rgba(27,24,19,0.25), inset 0 0 15px rgba(255,255,255,0.45)',
          border: '2.5px solid rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Renderizado Aumentado a 2.5x con Enfoque 1:1 Exacto */}
        {dimensions.width > 0 && (
          <img
            src={src}
            alt={`${alt} aumentado`}
            className="absolute pointer-events-none max-w-none select-none"
            style={{
              width: `${dimensions.width * ZOOM_FACTOR}px`,
              height: `${dimensions.height * ZOOM_FACTOR}px`,
              left: `${LENS_RADIUS - coords.x * ZOOM_FACTOR}px`,
              top: `${LENS_RADIUS - coords.y * ZOOM_FACTOR}px`,
              objectFit: 'cover',
            }}
          />
        )}

        {/* Reflejo Especular Diagonal (Bisel Óptico Apple) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.1] to-white/[0.3] pointer-events-none" />

        {/* Anillo Perimetral Biselado Oro Cálido */}
        <div className="absolute inset-0 rounded-full border border-[#8C7452]/40 pointer-events-none" />

        {/* Retícula de Precisión con Micro-Punto Central */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-[1px] bg-white/80 absolute shadow-[0_0_2px_rgba(0,0,0,0.6)]" />
          <div className="h-5 w-[1px] bg-white/80 absolute shadow-[0_0_2px_rgba(0,0,0,0.6)]" />
          <div className="w-2 h-2 rounded-full bg-[#C9A86A] shadow-[0_0_8px_#C9A86A] z-10 border border-black/40" />
        </div>

        {/* Micro-Píldora Flotante Superior en Lupa */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#1B1813]/85 backdrop-blur-md border border-white/25 text-[8px] font-mono tracking-widest text-[#FAF9F6] uppercase whitespace-nowrap shadow-md">
          2.5×
        </div>
      </div>
    </div>
  );
};

export const HorizontalGallery = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategoryId>('exteriores');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Filtrado reactivo de diapositivas según categoría activa
  const currentSlides = useMemo(() => {
    return ALL_SLIDES.filter((slide) => slide.categoryId === selectedCategory);
  }, [selectedCategory]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Transformación horizontal ligada al número de diapositivas de la categoría activa
  const maxTranslatePercent = useMemo(() => {
    if (currentSlides.length <= 1) return '0%';
    return `-${((currentSlides.length - 1) / currentSlides.length) * 100}%`;
  }, [currentSlides.length]);

  const x = useTransform(scrollYProgress, [0, 1], ['0%', maxTranslatePercent]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const total = currentSlides.length;
    if (total <= 1) {
      setActiveSlideIndex(0);
      return;
    }
    const index = Math.min(total - 1, Math.max(0, Math.round(latest * (total - 1))));
    setActiveSlideIndex(index);
  });

  const handleSelectCategory = (categoryId: GalleryCategoryId) => {
    setSelectedCategory(categoryId);
    setActiveSlideIndex(0);
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const sectionTop = rect.top + window.pageYOffset;
      window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
  };

  const scrollToSlide = (index: number) => {
    if (!targetRef.current) return;
    const total = currentSlides.length;
    if (total <= 1) return;
    const rect = targetRef.current.getBoundingClientRect();
    const sectionTop = rect.top + window.pageYOffset;
    const sectionHeight = targetRef.current.offsetHeight - window.innerHeight;
    const targetY = sectionTop + (index / (total - 1)) * sectionHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <section
      ref={targetRef}
      id="galeria"
      className="relative h-[450vh] bg-[#FAF9F6] border-t border-[#1B1813]/10"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Resplandor ambiental marfil cálido */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(140,116,82,0.06)_0%,transparent_60%)] pointer-events-none" />

        {/* Identificador Superior Izquierdo Minimalista */}
        <div className="absolute top-6 left-6 sm:left-12 z-20 hidden md:flex items-center space-x-3 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#8C7452] shadow-[0_0_8px_rgba(140,116,82,0.35)]" />
          <span className="font-mono text-[9px] sm:text-[10px] text-[#8C7452] tracking-[0.25em] uppercase font-semibold">
            PERSPECTIVAS & MATERIALIDAD
          </span>
          <span className="text-[#1B1813]/20 text-xs font-mono">·</span>
          <span className="font-meta text-[9px] sm:text-[10px] text-[#5A554A] tracking-[0.2em] uppercase">
            RENDERS DE AUTOR
          </span>
        </div>

        {/* Indicador de Desplazamiento Superior Derecho */}
        <div className="absolute top-6 right-6 sm:right-12 z-20 hidden md:flex items-center space-x-2 text-[9px] font-mono text-[#5A554A] tracking-widest pointer-events-none">
          <span className="hidden lg:inline">DESPLAZAMIENTO HORIZONTAL</span>
          <span className="text-[#8C7452]">→</span>
        </div>

        {/* Barra Láser de Progreso Superior */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8C7452] via-[#C9A86A] to-[#8C7452] origin-left z-30"
        />

        {/* Carrusel Horizontal de Perspectivas Filtradas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ x, width: `${currentSlides.length * 100}vw` }}
            className="flex"
          >
            {currentSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="relative w-screen h-screen flex items-center justify-center px-4 sm:px-10 md:px-16 pt-10 sm:pt-12 pb-24 sm:pb-28"
              >
                <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-8 lg:gap-14 bg-white/80 backdrop-blur-2xl border border-[#1B1813]/10 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(27,24,19,0.06)]">
                  {/* Columna Editorial (Apple Glass Minimalist Claro) */}
                  <div className="w-full lg:w-5/12 flex flex-col space-y-4 sm:space-y-6 lg:pr-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-3 py-1 rounded-full bg-[#1B1813]/[0.04] backdrop-blur-md border border-[#1B1813]/10 text-[9px] sm:text-[10px] font-mono tracking-[0.22em] text-[#8C7452] uppercase font-semibold">
                        {CATEGORIES.find((c) => c.id === slide.categoryId)?.badge || 'RESIDENCIAS'}
                      </span>
                      <span className="text-[#1B1813]/25 text-xs font-mono">·</span>
                      <span className="text-[10px] font-mono tracking-widest text-[#5A554A] uppercase font-medium">
                        {slide.tag}
                      </span>
                    </div>

                    <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#1B1813] leading-[1.1] tracking-tight">
                      {slide.title}
                    </h3>

                    <p className="font-serif text-sm sm:text-base md:text-lg text-[#5A554A] leading-relaxed max-w-lg font-light">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Columna de Imagen con Lupa Circular Clásica Estilo Apple */}
                  <div className="w-full lg:w-7/12">
                    <AppleCircularLoupeImage
                      src={slide.image}
                      alt={slide.title}
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Barra / Navbar Flotante Inferior Unificada de Doble Nivel (Auténtico Apple Vision / Liquid Glass) */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white/55 backdrop-blur-3xl border border-white/80 shadow-[0_20px_50px_rgba(27,24,19,0.12),0_4px_12px_rgba(0,0,0,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] max-w-[96vw]">
          {/* Nivel Superior: Selector de Categorías Principales */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 max-w-full">
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider transition-all duration-200 uppercase whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                    isCatActive
                      ? 'bg-[#1B1813]/90 text-[#FAF9F6] shadow-[0_2px_8px_rgba(27,24,19,0.2),inset_0_1px_0.5px_rgba(255,255,255,0.25)] border border-white/20 backdrop-blur-md font-semibold'
                      : 'text-[#5A554A] hover:text-[#1B1813] hover:bg-white/60 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-transparent hover:border-white/50'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCatActive ? 'bg-[#C9A86A] shadow-[0_0_6px_#C9A86A]' : 'bg-[#1B1813]/25'
                    }`}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Línea Divisoria de Cristal Especular */}
          <div className="w-[92%] h-[1px] bg-gradient-to-r from-transparent via-[#1B1813]/10 to-transparent shadow-[0_1px_0_rgba(255,255,255,0.8)]" />

          {/* Nivel Inferior: Perspectivas de la Categoría Activa */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 max-w-full">
            {currentSlides.map((slide, idx) => {
              const isActive = activeSlideIndex === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => scrollToSlide(idx)}
                  className={`px-2.5 sm:px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider transition-all duration-200 uppercase whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8C7452] to-[#A08255] text-white shadow-[0_2px_8px_rgba(140,116,82,0.35),inset_0_1px_0.5px_rgba(255,255,255,0.3)] border border-white/30 font-medium'
                      : 'text-[#5A554A] hover:text-[#1B1813] hover:bg-white/60 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-transparent hover:border-white/50'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-white shadow-[0_0_4px_#ffffff]' : 'bg-[#1B1813]/25'
                    }`}
                  />
                  <span>{slide.dockLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
