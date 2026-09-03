import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const SLIDES = [
  {
    id: 1,
    category: "EL PAISAJE",
    title: "El Ávila como Testigo",
    subtitle: "Diseñado para enmarcar la montaña, permitiendo que el paisaje caraqueño inunde cada espacio con luz natural y vistas ininterrumpidas.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: 2,
    category: "MATERIALIDAD",
    title: "Materia y Verdad",
    subtitle: "Concreto en obra limpia, maderas nobles y metales oscuros. Materiales honestos que envejecen con dignidad y carácter.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: 3,
    category: "ORIENTACIÓN",
    title: "Luz Esculpida",
    subtitle: "Orientación estratégica que filtra el sol del trópico, creando atmósferas dinámicas y sombras poéticas durante todo el día.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: 4,
    category: "ESPACIALIDAD",
    title: "El Refugio Interior",
    subtitle: "Proporciones generosas, altura imponente y un diseño inmersivo que redefine por completo el lujo espacial contemporáneo.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2574&auto=format&fit=crop"
  }
];

export const HorizontalGallery = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={targetRef} id="galeria" className="relative h-[400vh] bg-[#EFEBE0] border-t border-[#1B1813]/10">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex w-[400vw]">
          {SLIDES.map((slide, index) => (
            <div key={slide.id} className="relative w-screen h-screen flex items-center justify-center px-4 sm:px-12 md:px-24">
              <div className="w-full max-w-7xl flex flex-col md:flex-row items-center gap-10 md:gap-20">
                
                {/* Text Column (Editorial Layout) */}
                <div className="w-full md:w-1/3 flex flex-col space-y-6 md:pr-8">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-[1px] bg-[#8C7452]"></span>
                    <span className="font-meta text-[9px] sm:text-[10px] text-[#8C7452] tracking-[0.2em] uppercase font-semibold">
                      0{index + 1} — {slide.category}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-4xl sm:text-5xl md:text-6xl text-[#1B1813] leading-[1.1] tracking-tight">
                    {slide.title}
                  </h3>
                  
                  <p className="font-serif text-base sm:text-lg text-[#8C8678] leading-relaxed max-w-md">
                    {slide.subtitle}
                  </p>
                </div>
                
                {/* Image Column (Architectural Frame) */}
                <div className="w-full md:w-2/3 h-[45vh] md:h-[75vh] relative overflow-hidden rounded-xl border border-[#C9C4B5]/60 shadow-sm group">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover scale-[1.03] transition-transform duration-[1500ms] ease-out group-hover:scale-100"
                  />
                  {/* Subtle inner shadow for depth, avoiding heavy gradients */}
                  <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(27,24,19,0.05)] pointer-events-none rounded-xl" />
                </div>

              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
