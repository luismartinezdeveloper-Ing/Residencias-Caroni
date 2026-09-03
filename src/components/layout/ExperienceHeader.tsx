import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CaroniIsotype } from '../ui/ArchitecturalDrawings';
import { BRAND_INFO, UNITS_DATA } from '../../data/brandData';
import { UnitData } from '../../types/brand';
import { useConfidentiality } from '../../context/ConfidentialityContext';
import { ShieldCheck, Sparkles, LockKeyhole } from 'lucide-react';

export type NavSection = 'obra' | 'elevacion' | 'inversion' | 'ledger' | 'contacto';

interface ExperienceHeaderProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  selectedUnit: UnitData;
  onSelectUnit: (unit: UnitData) => void;
  onQuickLoi: () => void;
  onOpen3DModal: () => void;
}

export const ExperienceHeader: React.FC<ExperienceHeaderProps> = ({
  activeSection,
  onNavigate,
  selectedUnit,
  onSelectUnit,
  onQuickLoi,
  onOpen3DModal,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAccredited, openAuthModal, revokeAccess, credentials, isAdvisorMode, toggleAdvisorMode } = useConfidentiality();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
        setIsScrolled(window.scrollY > 40);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  const navItems = isAdvisorMode ? [
    { id: 'obra', code: '01', label: 'EL PROYECTO' },
    { id: 'elevacion', code: '02', label: 'RESIDENCIAS' },
    { id: 'inversion', code: '03', label: 'CONDICIONES & RESERVA' },
    { id: 'ledger', code: '04', label: 'AVANCE DE OBRA' },
    { id: 'contacto', code: '05', label: 'CONTACTO' },
  ] : [
    { id: 'obra', code: '01', label: 'EL PROYECTO' },
    { id: 'elevacion', code: '02', label: 'RESIDENCIAS' },
    { id: 'contacto', code: '03', label: 'CONTACTO' },
  ];


  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#FAF9F6]/50 backdrop-blur-md border-b border-[#1B1813]/5 shadow-sm'
          : 'bg-[#FAF9F6]/90 backdrop-blur-sm border-b border-[#1B1813]/5'
      }`}
    >
      {/* Top Institutional Micro-Strip */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center text-[9px] sm:text-[10px] font-meta text-[#8C8678] tracking-wider overflow-hidden transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 border-transparent' : 'h-8 sm:h-9 py-1.5 border-b border-[#C9C4B5]/40 opacity-100'}`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="font-semibold text-[#1B1813] tracking-widest">RESIDENCIAS CARONÍ</span>
          <span className="text-[#8C7452]">·</span>
          <span className="text-[#8C8678]">ALTAMIRA, CARACAS</span>
          <span className="text-[#C9C4B5]">|</span>
          <button onClick={toggleAdvisorMode} className="text-[#8C8678] hover:text-[#1B1813] transition-colors flex items-center space-x-1 cursor-pointer rounded-full">
            <LockKeyhole className="w-2.5 h-2.5" />
            <span>{isAdvisorMode ? 'MODO GALERÍA' : 'PORTAL ASESOR'}</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-center font-display lowercase italic text-[11px] text-[#1B1813]/70">
          <span>ocho residencias · una sola pieza</span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Protocol Status Badge */}
          {isAccredited ? (
            <div className="flex items-center space-x-1.5 bg-[#8C7452]/10 border border-[#8C7452]/30 px-2.5 py-0.5 text-[#1B1813]">
              <ShieldCheck className="w-3 h-3 text-[#8C7452]" />
              <span className="font-meta text-[8.5px] uppercase font-semibold text-[#8C7452]">
                SESIÓN ACTIVA: {credentials?.holderName.split(' ')[0]}
              </span>
              <button
                onClick={revokeAccess}
                title="Cerrar sesión privada"
                className="text-[8px] text-[#8C8678] hover:text-[#1B1813] ml-1.5 underline cursor-pointer"
              >
                SALIR
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('inversion')}
              className="flex items-center space-x-1.5 bg-white hover:bg-[#FAF9F6] border border-[#C9C4B5] px-2.5 py-0.5 text-[#1B1813] transition-colors cursor-pointer rounded-full"
              title="Solicitar información privada y disponibilidad"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C7452]"></span>
              <span className="font-meta text-[8.5px] uppercase tracking-wider text-[#1B1813]">
                SOLICITAR INFORMACIÓN
              </span>
            </button>
          )}

          <span className="hidden sm:inline font-mono text-[9px]">{BRAND_INFO.coordinates}</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Lockup */}
        <div
          onClick={() => onNavigate('obra')}
          className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group select-none shrink-0"
        >
          <CaroniIsotype size={28} color="#1B1813" className="shrink-0 sm:w-8 sm:h-8" />
          <div className="border-l border-[#C9C4B5] pl-2 sm:pl-3">
            <div className="font-display text-lg sm:text-2xl tracking-tight text-[#1B1813] leading-none group-hover:text-[#8C7452] transition-colors">
              Residencias Caroní
            </div>
            <div className="font-meta text-[7.5px] sm:text-[8.5px] text-[#8C8678] mt-0.5 tracking-[0.16em] sm:tracking-[0.2em] hidden sm:block">
              AÑIL ARQUITECTURA · ALTAMIRA
            </div>
          </div>
        </div>

        {/* Dynamic Section Navigation (Architectural Subtle Indicator) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FAF8F5]/80 p-1 border border-[#C9C4B5]/70 shrink-0 rounded-full">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative font-meta text-[10px] sm:text-[10.5px] px-3 py-1.5 transition-colors flex items-center space-x-1.5 cursor-pointer rounded-full ${
                  isActive
                    ? 'text-[#1B1813] font-semibold'
                    : 'text-[#8C8678] hover:text-[#1B1813]'
                }`}
              >
                <span className={isActive ? 'text-[#8C7452] font-semibold' : 'text-[#8C8678]'}>{item.code}</span>
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavUnderlineDesktop"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#8C7452]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Context Actions: Quick Unit & LOI Trigger */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={onOpen3DModal}
            className="flex font-meta text-[9px] sm:text-[10.5px] px-2.5 sm:px-3.5 py-1.5 bg-[#1B1813] text-[#FAF9F6] hover:bg-[#2A261E] hover:text-[#EFEBE0] transition-colors items-center space-x-1.5 shadow-xs cursor-pointer rounded-full active:scale-95"
          >
            <span className="text-[#8C7452] animate-pulse">●</span>
            <span className="inline">MAQUETA 3D</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-[#C9C4B5]/40 bg-[#FAF9F6]/95 backdrop-blur-md px-2.5 py-1.5 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative font-meta text-[9.5px] px-3 py-1.5 whitespace-nowrap transition-all duration-200 shrink-0 flex items-center space-x-1 rounded-full cursor-pointer min-h-[32px] ${
                  isActive
                    ? 'bg-[#1B1813] text-[#FAF9F6] font-semibold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#8C8678] border border-[#C9C4B5]/50 hover:text-[#1B1813] hover:border-[#1B1813]/30'
                }`}
              >
                <span className={`font-mono text-[9px] ${isActive ? 'text-[#8C7452]' : 'text-[#8C8678]'}`}>
                  {item.code}
                </span>
                <span className="tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
