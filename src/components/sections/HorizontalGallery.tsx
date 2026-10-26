import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const SLIDES = [
  {
    id: 1,
    category: "IMPLANTACIÓN URBANA",
    title: "El Ávila como Testigo",
    subtitle: "Implantación al pie del Parque Nacional en Altamira. Ocho residencias concebidas como un solo volumen escultórico que dialoga con la tradición moderna caraqueña.",
    image: "/imagen/exterior/RC-exterior.frontal.jpeg"
  },
  {
    id: 2,
    category: "HONESTIDAD CONSTRUCTIVA",
    title: "Materia y Verdad",
    subtitle: "Concreto visto en obra limpia, celosías de protección solar y perfilería arquitectónica. Materiales nobles que dialogan con el clima y envejecen con carácter.",
    image: "/imagen/exterior/RC.exterior.ventanal-p1op2.jpeg"
  },
  {
    id: 3,
    category: "ESPACIALIDAD INTERIOR",
    title: "Espacios sin Fronteras",
    subtitle: "Alturas libres imponentes, salones diáfanos sin columnas intermedias y una transición fluida hacia los ventanales que baña el interior de luz natural tamizada.",
    image: "/imagen/interior/pb-norte/02_PB_Norte_Salon.jpeg"
  },
  {
    id: 4,
    category: "EXPANSIÓN PRIVADA",
    title: "El Jardín y la Terraza",
    subtitle: "Terrazas profundas y jardines privados protegidos del entorno urbano. Un oasis de calma diseñado para la contemplación y la serenidad cotidiana.",
    image: "/imagen/interior/pb-norte/01_PB_Norte_Terraza.jpeg"
  },
  {
    id: 5,
    category: "EL PENTHOUSE",
    title: "La Cima Panorámica",
    subtitle: "Perspectivas privilegiadas sobre el valle de Caracas y la cresta verde del Ávila, con terrazas perimetrales y privacidad absoluta.",
    image: "/imagen/exterior/RC-exterior.ventanal-PH.jpeg"
  }
];

export const HorizontalGallery = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <section ref={targetRef} id="galeria" className="relative h-[500vh] bg-[#EFEBE0] border-t border-[#1B1813]/15">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Subtle Top Section Identifier */}
        <div className="absolute top-6 left-6 sm:left-12 z-20 flex items-center space-x-3 pointer-events-none">
          <span className="w-6 h-[1.5px] bg-[#8C7452]"></span>
          <span className="font-meta text-[9px] sm:text-[10px] text-[#8C7452] tracking-[0.25em] uppercase font-semibold">
            02 · PERSPECTIVAS Y MATERIALIDAD
          </span>
        </div>

        {/* Scroll Progress Bar at the top of the viewport */}
        <motion.div 
          style={{ scaleX: scrollYProgress }} 
          className="absolute top-0 left-0 right-0 h-[2px] bg-[#8C7452] origin-left z-30" 
        />

        <motion.div style={{ x }} className="flex w-[500vw]">
          {SLIDES.map((slide, index) => (
            <div key={slide.id} className="relative w-screen h-screen flex items-center justify-center px-4 sm:px-12 md:px-20 pt-10">
              <div className="w-full max-w-7xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
                
                {/* Text Column (Editorial Layout) */}
                <div className="w-full md:w-5/12 flex flex-col space-y-4 sm:space-y-6 md:pr-6">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-[10px] text-[#8C7452] font-semibold">
                      0{index + 1} / 0{SLIDES.length}
                    </span>
                    <span className="text-[#C9C4B5]">|</span>
                    <span className="font-meta text-[9px] sm:text-[10px] text-[#8C8678] tracking-[0.2em] uppercase font-medium">
                      {slide.category}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#1B1813] leading-[1.1] tracking-tight">
                    {slide.title}
                  </h3>
                  
                  <p className="font-serif text-sm sm:text-base md:text-lg text-[#5A554A] leading-relaxed max-w-lg">
                    {slide.subtitle}
                  </p>

                  <div className="pt-2 flex items-center space-x-2 text-[10px] font-meta text-[#8C8678] tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full border border-[#8C7452] bg-[#8C7452]/20"></span>
                    <span>Añil Arquitectura · Renders Oficiales</span>
                  </div>
                </div>
                
                {/* Image Column (Architectural Frame) */}
                <div className="w-full md:w-7/12 h-[42vh] sm:h-[50vh] md:h-[72vh] relative overflow-hidden rounded-lg border border-[#1B1813]/15 shadow-md bg-[#1B1813]/5 group">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover scale-[1.02] transition-transform duration-[1200ms] ease-out group-hover:scale-100"
                  />
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(27,24,19,0.08)] pointer-events-none rounded-lg" />
                </div>

              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom Editorial Hint */}
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center space-x-2 text-[9px] font-meta text-[#8C8678] tracking-widest pointer-events-none">
          <span>DESPLAZAMIENTO CONTINUO</span>
          <span>→</span>
        </div>
      </div>
    </section>
  );
};
