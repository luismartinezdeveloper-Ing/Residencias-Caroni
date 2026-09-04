import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExperienceHeader, NavSection } from './components/layout/ExperienceHeader';
import { HeroCinematic } from './components/sections/HeroCinematic';
import { CinematicScrollNarrative } from './components/sections/CinematicScrollNarrative';
import { InteractiveElevationViewer } from './components/sections/InteractiveElevationViewer';
import { InvestmentTermSheet } from './components/sections/InvestmentTermSheet';
import { InstitutionalLedger } from './components/sections/InstitutionalLedger';
import { PrivateAdvisoryCTA } from './components/sections/PrivateAdvisoryCTA';
import { Architectural3DModal } from './components/modals/Architectural3DModal';
import { ConfidentialityModal } from './components/modals/ConfidentialityModal';
import { LeadGateModal } from './components/modals/LeadGateModal';
import { ConfidentialityProvider, useConfidentiality } from './context/ConfidentialityContext';
import { UnitData } from './types/brand';
import { UNITS_DATA, BRAND_INFO } from './data/brandData';
import { CaroniIsotype } from './components/ui/ArchitecturalDrawings';
import { OfflineNotification } from './components/ui/OfflineNotification';

import { CinematicIntroLoader } from './components/ui/CinematicIntroLoader';
import { AIChatbot } from './components/modals/AIChatbot';
import { Sparkles, PhoneCall, Bot } from 'lucide-react';

function MainAppContent() {
  const { isAdvisorMode, openAuthModal, isAccredited } = useConfidentiality();
  const [activeSection, setActiveSection] = useState<NavSection>('obra');
  const [selectedUnit, setSelectedUnit] = useState<UnitData>(UNITS_DATA[0]);
  const [is3DModalOpen, setIs3DModalOpen] = useState<boolean>(false);
  const [isLeadGateOpen, setIsLeadGateOpen] = useState<boolean>(false);
  const [isVoiceAdvisorOpen, setIsVoiceAdvisorOpen] = useState<boolean>(false);
  const [modalInitialViewMode, setModalInitialViewMode] = useState<'assembled' | 'exploded' | 'tour360' | 'floorplan' | 'pricing'>('assembled');

  // Smooth Scroll Anchor Navigation
  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    const elem = document.getElementById(section);
    if (elem) {
      const yOffset = -72; // Header offset
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Lead Gate / 3D Access Funnel Trigger
  const handleOpen3DOrGate = (mode?: string | unknown) => {
    const validModes: Array<'assembled' | 'exploded' | 'tour360' | 'floorplan' | 'pricing'> = [
      'assembled',
      'exploded',
      'tour360',
      'floorplan',
      'pricing',
    ];
    const safeMode = typeof mode === 'string' && (validModes as string[]).includes(mode)
      ? (mode as 'assembled' | 'exploded' | 'tour360' | 'floorplan' | 'pricing')
      : 'assembled';

    setModalInitialViewMode(safeMode);
    if (isAccredited) {
      setIs3DModalOpen(true);
    } else {
      setIsLeadGateOpen(true);
    }
  };

  // Quick Action: transfer selected unit straight to the LOI Term Sheet and scroll down
  const handleQuickLoi = (unit?: UnitData) => {
    if (unit) {
      setSelectedUnit(unit);
    }
    handleNavigate('inversion');
  };

  // High-precision viewport-based ScrollSpy
  useEffect(() => {
    const sections: NavSection[] = isAdvisorMode
      ? ['obra', 'elevacion', 'inversion', 'ledger', 'contacto']
      : ['obra', 'elevacion', 'contacto'];

    const handleScrollObserver = () => {
      // Trigger when section reaches top 35% of the viewport
      const triggerThreshold = window.innerHeight * 0.35;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= triggerThreshold) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollObserver, { passive: true });
    handleScrollObserver();

    return () => window.removeEventListener('scroll', handleScrollObserver);
  }, [isAdvisorMode]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EFEBE0] text-[#1B1813] font-sans antialiased selection:bg-[#8C7452] selection:text-[#EFEBE0]">
      {/* 00. Cinematic Intro Loader (Institutional Gala Curtain) */}
      <CinematicIntroLoader minDurationMs={1500} />

      {/* Confidentiality & Accreditation Modal */}
      <ConfidentialityModal />

      {/* Offline Status & PWA Install Notification */}
      <OfflineNotification />

      {/* Lead Gate Modal (Unlock 3D & Precios Funnel) */}
      <LeadGateModal
        isOpen={isLeadGateOpen}
        onClose={() => setIsLeadGateOpen(false)}
        onUnlocked={() => {
          setIsLeadGateOpen(false);
          setIs3DModalOpen(true);
        }}
        initialUnitInterest={selectedUnit.name}
      />

      {/* Top Floating Architectural Institutional Header */}
      <ExperienceHeader
        activeSection={activeSection}
        onNavigate={handleNavigate}
        selectedUnit={selectedUnit}
        onSelectUnit={setSelectedUnit}
        onQuickLoi={() => handleQuickLoi(selectedUnit)}
        onOpen3DModal={handleOpen3DOrGate}
      />

      {/* 3D Maqueta Modal strictly following architectural standards */}
      <Architectural3DModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        selectedUnit={selectedUnit}
        onSelectUnit={setSelectedUnit}
        onEmitLoi={handleQuickLoi}
        initialViewMode={modalInitialViewMode}
      />

      {/* Main Continuous Scroll Narrative with Apple-Style Section Transitions */}
      <main className="flex-1">
        {/* 01. LA PIEZA (Experiencia Cinemática Protagónica en Video por Scroll) */}
        <CinematicScrollNarrative
          onOpen3DModal={() => handleOpen3DOrGate('assembled')}
          onExploreElevation={() => handleNavigate('elevacion')}
          onRequestDossier={() => handleOpen3DOrGate('pricing')}
        />

        {/* 02. FACHADAS & COTAS (Interactive Elevation) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={sectionVariants}
        >
          <InteractiveElevationViewer
            selectedUnit={selectedUnit}
            onSelectUnit={setSelectedUnit}
            onInspectUnitDetails={(unit) => {
              setSelectedUnit(unit);
              handleOpen3DOrGate('assembled');
            }}
            onEmitLoi={handleQuickLoi}
            onOpen3DModal={(mode) => handleOpen3DOrGate(mode || 'assembled')}
          />
        </motion.div>

{isAdvisorMode && (<>{/* 03. ESTRUCTURA FINANCIERA & LOI (Investment Grade Simulator & Binding LOI) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={sectionVariants}
        >
          <InvestmentTermSheet
            selectedUnit={selectedUnit}
            onSelectUnit={setSelectedUnit}
          />
        </motion.div>

        {/* 06. ESTADO DEL PROYECTO & AVANCE (S-Curve & Portfolio Ledger) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={sectionVariants}
        >
          <InstitutionalLedger
            onSelectUnitToEmitLoi={handleQuickLoi}
          />
        </motion.div></>)}

        {/* 07. ATENCIÓN PRIVADA & CONTACTO INSTITUCIONAL */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={sectionVariants}
        >
          <PrivateAdvisoryCTA
            onOpenAdvisoryModal={() => openAuthModal('inversion')}
          />
        </motion.div>
      </main>

      {/* Floating Executive Action Hub (Phase 1 Conversion Engine) */}
      

      {/* Floating Concierge / Gemini Live Voice Advisor Orb */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center">
        <button
          onClick={() => setIsVoiceAdvisorOpen(true)}
          className="group relative flex items-center space-x-2.5 bg-gradient-to-r from-[#1B1813] to-[#2A241C] text-[#FAF8F5] pl-3.5 pr-4 py-2.5 rounded-full border border-[#C9A86A]/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-[#C9A86A] transition-all cursor-pointer select-none active:scale-95"
          title="Hablar en Vivo con el Asesor IA de Residencias Caroní"
        >
          {/* Glowing Aura Ring */}
          <span className="absolute -inset-0.5 rounded-full bg-[#C9A86A]/30 blur-sm group-hover:bg-[#C9A86A]/50 animate-pulse pointer-events-none" />

          {/* Golden Orb Icon */}
          <div className="relative w-7 h-7 rounded-full bg-[#8C7452] flex items-center justify-center shadow-inner">
            <PhoneCall className="w-3.5 h-3.5 text-[#FAF8F5] animate-bounce" />
          </div>

          <div className="relative flex flex-col items-start leading-none pr-1">
            <span className="text-[10.5px] font-display font-semibold tracking-wide text-[#FAF8F5]">
              Asesor de Voz IA
            </span>
            <span className="text-[8px] font-mono tracking-widest text-[#C9A86A] uppercase mt-0.5">
              Gemini Live · En Línea
            </span>
          </div>
        </button>
      </div>

      {/* AIChatbot Modal (Voz en Tiempo Real & Asesoría Inmobiliaria) */}
      <AIChatbot
        isOpen={isVoiceAdvisorOpen}
        onClose={() => setIsVoiceAdvisorOpen(false)}
        selectedUnit={selectedUnit}
      />

      {/* Slim Minimalist Footer */}
      <footer className="w-full bg-[#14120E] text-[#8C8678] border-t border-[#FAF9F6]/10 py-6 pb-28 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-meta">
          {/* Left: Brand & Copyright */}
          <div className="flex items-center space-x-3">
            <CaroniIsotype size={20} color="#8C7452" />
            <span className="text-[#EFEBE0] font-medium tracking-wider">RESIDENCIAS CARONÍ</span>
            <span className="text-[#8C7452]">·</span>
            <span>© 2026 AÑIL ARQUITECTURA</span>
          </div>

          {/* Center: Location, Architecture & Engineering Reference */}
          <div className="text-[#8C8678] tracking-widest text-center hidden sm:block">
            ALTAMIRA · CARACAS · ARQ. JUAN CARLOS LÁNCARA · <span className="text-[#C9C4B5]">DESARROLLO: ING. LUIS MARTINEZ</span>
          </div>

          {/* Right: Quick Links & Back to Top */}
          <div className="flex items-center space-x-5 text-[9.5px] uppercase tracking-wider">
            <button 
              onClick={() => handleNavigate('obra')} 
              className="text-[#C9C4B5] hover:text-[#8C7452] transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <button 
              onClick={() => handleNavigate('elevacion')} 
              className="text-[#C9C4B5] hover:text-[#8C7452] transition-colors cursor-pointer"
            >
              Residencias
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="text-[#8C7452] hover:text-[#EFEBE0] transition-colors cursor-pointer flex items-center space-x-1 ml-2"
            >
              <span>Subir</span>
              <span>↑</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ConfidentialityProvider>
      <MainAppContent />
    </ConfidentialityProvider>
  );
}
