import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CaroniIsotype } from '../ui/ArchitecturalDrawings';
import { UnitData } from '../../types/brand';
import { Sparkles } from 'lucide-react';

/**
 * Residencias Caroní · Altamira, Caracas
 * Encabezado Arquitectónico Institucional (Diseño Simplificado de Autor)
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Desarrollo & Experiencia Interactiva: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */

export type NavSection = 'obra' | 'galeria' | 'elevacion' | 'contacto';

interface ExperienceHeaderProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  selectedUnit: UnitData;
  onSelectUnit: (unit: UnitData) => void;
  onOpen3DModal: () => void;
}

export const ExperienceHeader: React.FC<ExperienceHeaderProps> = ({
  activeSection,
  onNavigate,
  onOpen3DModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'obra' as NavSection, label: 'EL PROYECTO' },
    { id: 'galeria' as NavSection, label: 'GALERÍA' },
    { id: 'elevacion' as NavSection, label: 'RESIDENCIAS' },
    { id: 'contacto' as NavSection, label: 'CONTACTO' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#FAF9F6]/80 backdrop-blur-md border-b border-[#1B1813]/5 shadow-xs'
          : 'bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#1B1813]/5'
      }`}
    >
      {/* 1. Franja Superior Institucional: Únicamente el lema de autor centrado */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex justify-center items-center overflow-hidden transition-all duration-500 ${
          isScrolled
            ? 'h-0 opacity-0 border-transparent py-0'
            : 'h-8 sm:h-9 py-1.5 border-b border-[#C9C4B5]/35 opacity-100'
        }`}
      >
        <span className="font-display lowercase italic text-xs sm:text-[13px] text-[#1B1813]/75 tracking-[0.22em] sm:tracking-[0.28em] select-none text-center">
          ocho residencias · una sola pieza
        </span>
      </div>

      {/* 2. Barra de Navegación Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Logotipo & Firma de Autor */}
        <div
          onClick={() => onNavigate('obra')}
          className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group select-none shrink-0"
        >
          <CaroniIsotype size={28} color="#1B1813" className="shrink-0 sm:w-8 sm:h-8" />
          <div className="border-l border-[#C9C4B5] pl-2.5 sm:pl-3">
            <div className="font-display text-lg sm:text-2xl tracking-tight text-[#1B1813] leading-none group-hover:text-[#8C7452] transition-colors">
              Residencias Caroní
            </div>
            <div className="font-meta text-[7.5px] sm:text-[8.5px] text-[#8C8678] mt-0.5 tracking-[0.18em] sm:tracking-[0.22em] hidden sm:block">
              AÑIL ARQUITECTURA · ALTAMIRA
            </div>
          </div>
        </div>

        {/* Menú Cápsula Unificado: Secciones + Maqueta 3D integrada con el mismo estilo */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FAF8F5]/90 p-1 border border-[#C9C4B5]/70 shrink-0 rounded-full shadow-xs">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative font-meta text-[10px] sm:text-[11px] px-3.5 py-1.5 transition-colors flex items-center cursor-pointer rounded-full tracking-wider ${
                  isActive
                    ? 'text-[#1B1813] font-semibold'
                    : 'text-[#8C8678] hover:text-[#1B1813]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavUnderlineDesktop"
                    className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#8C7452]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}

          {/* Separador fino de autor */}
          <span className="w-[1px] h-3.5 bg-[#C9C4B5]/60 mx-1" />

          {/* Botón Maqueta 3D integrado al mismo estilo de la cápsula */}
          <button
            onClick={onOpen3DModal}
            className="font-meta text-[10px] sm:text-[11px] px-3.5 py-1.5 transition-all flex items-center space-x-1.5 cursor-pointer rounded-full text-[#8C7452] hover:text-[#1B1813] hover:bg-[#8C7452]/10 font-semibold tracking-wider active:scale-95"
            title="Abrir Maqueta 3D Interactiva"
          >
            <Sparkles className="w-3 h-3 text-[#8C7452]" />
            <span>MAQUETA 3D</span>
          </button>
        </nav>
      </div>

      {/* 3. Sub-Barra de Navegación Móvil */}
      <div className="md:hidden border-t border-[#C9C4B5]/40 bg-[#FAF9F6]/95 backdrop-blur-md px-2.5 py-1.5 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative font-meta text-[9.5px] px-3 py-1.5 whitespace-nowrap transition-all duration-200 shrink-0 flex items-center space-x-1 rounded-full cursor-pointer min-h-[32px] tracking-wider ${
                  isActive
                    ? 'bg-[#1B1813] text-[#FAF9F6] font-semibold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#8C8678] border border-[#C9C4B5]/50 hover:text-[#1B1813] hover:border-[#1B1813]/30'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Maqueta 3D en versión móvil */}
          <button
            onClick={onOpen3DModal}
            className="relative font-meta text-[9.5px] px-3 py-1.5 whitespace-nowrap transition-all duration-200 shrink-0 flex items-center space-x-1 rounded-full cursor-pointer min-h-[32px] bg-[#FAF8F5] text-[#8C7452] border border-[#8C7452]/40 hover:text-[#1B1813] font-semibold tracking-wider"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#8C7452]" />
            <span>MAQUETA 3D</span>
          </button>
        </div>
      </div>
    </header>
  );
};
