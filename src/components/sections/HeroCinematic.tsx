import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { CaroniIsotype } from '../ui/ArchitecturalDrawings';
import { BRAND_INFO, UNITS_DATA } from '../../data/brandData';
import { useConfidentiality } from '../../context/ConfidentialityContext';
import {
  Lock,
  Unlock,
  Sparkles,
  Compass,
  Building2,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface HeroCinematicProps {
  onExploreUnits: () => void;
  onSimulateInvestment: () => void;
  onViewElevation: () => void;
  onOpen3DOrGate: () => void;
}

export const HeroCinematic: React.FC<HeroCinematicProps> = ({
  onExploreUnits,
  onSimulateInvestment,
  onViewElevation,
  onOpen3DOrGate,
}) => {
  const { isAccredited } = useConfidentiality();

  // Mouse spotlight coordinates
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const totalMetros = UNITS_DATA.reduce((acc, u) => acc + u.totalArea, 0);
  const unitsReservedOrCommitted = UNITS_DATA.filter((u) => u.status !== 'disponible').length;
  const availableCount = UNITS_DATA.filter((u) => u.status === 'disponible').length;

  // Handle cursor spotlight movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <section
      ref={heroRef}
      id="obra"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[95vh] lg:min-h-screen bg-[#070706] text-[#FAF8F5] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* 1. ATMOSPHERE & LUXURY ARCHITECTURAL BACKDROP */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Ambient High-Res Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 contrast-[1.08] brightness-[0.9] transition-opacity duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2600&auto=format&fit=crop')`,
          }}
        />

        {/* Cursor Glow Spotlight (Warm Luxury Amber Gold) */}
        <div
          className="pointer-events-none absolute w-[500px] h-[500px] rounded-full blur-[100px] transition-transform duration-75 ease-out opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,106,0.5) 0%, rgba(140,116,82,0.15) 50%, transparent 70%)',
            left: `${mousePos.x - 250}px`,
            top: `${mousePos.y - 250}px`,
          }}
        />

        {/* Dark Luxury Vignette & Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070706] via-[#070706]/40 to-[#070706]/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070706]/90 via-[#070706]/30 to-[#070706]/85 pointer-events-none" />
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[#8C7452]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#8C7452]/8 rounded-full blur-[130px] pointer-events-none" />

        {/* Subtle Anamorphic 35mm Light Streak */}
        <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8C7452]/30 to-transparent blur-xs pointer-events-none" />
      </div>

      {/* 2. TOP TELEMETRY HUD */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-20 sm:pt-24 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FAF9F6]/10 pb-3">
          {/* Left Telemetry: Location & Atmosphere */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 text-[9.5px] font-mono text-[#A6A092]">
              <span className="text-[#8C7452] font-semibold">ALTAMIRA · CARACAS</span>
              <span>·</span>
              <span>LÍMITE EL ÁVILA</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">2700K WARM ARCHITECTURAL LIGHT</span>
            </div>
          </div>

          {/* Right Status */}
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center space-x-1.5 bg-[#171511]/90 border border-[#8C7452]/40 rounded-full px-3 py-1 text-[9.5px] font-meta text-[#FAF8F5]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[#8C7452] font-bold">PREVENTA PRIVADA ACTIVA</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN HERO GRID: HEADLINE + SPECS + LEAD MAGNET */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Big Display Headline & Pitch */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#8C7452]/15 border border-[#8C7452]/30 px-3.5 py-1 rounded-full text-[#EFEBE0] font-meta text-[9px] sm:text-[10px] tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-[#8C7452]" />
              <span>Preventa Exclusiva · 8 Apartamentos de Lujo en Altamira, Caracas</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl xl:text-7xl text-[#FAF8F5] tracking-tight leading-[1.02]">
              <span className="text-[#8C7452]">.</span>El último cuadro <br className="hidden sm:inline" />
              antes del Ávila.
            </h1>

            <p className="font-serif italic text-base sm:text-xl lg:text-2xl text-[#C9C4B5] max-w-2xl leading-relaxed">
              Ocho exclusivas residencias de autor concebidas como una sola obra de arte arquitectónica en el límite natural con el Parque Nacional El Ávila.
            </p>

            {/* ARCHITECTURAL HIGHLIGHTS BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-[#14120E]/90 border border-[#8C7452]/30 rounded-xl p-2.5">
                <span className="text-[8px] font-mono text-[#8C7452] uppercase block">Materialidad</span>
                <span className="text-xs font-display text-[#FAF8F5] font-semibold">Travertino Romano</span>
              </div>
              <div className="bg-[#14120E]/90 border border-[#8C7452]/30 rounded-xl p-2.5">
                <span className="text-[8px] font-mono text-[#8C7452] uppercase block">Densidad</span>
                <span className="text-xs font-display text-[#FAF8F5] font-semibold">8 Residencias</span>
              </div>
              <div className="bg-[#14120E]/90 border border-[#8C7452]/30 rounded-xl p-2.5">
                <span className="text-[8px] font-mono text-[#8C7452] uppercase block">Orientación</span>
                <span className="text-xs font-display text-[#FAF8F5] font-semibold">Frente al Ávila</span>
              </div>
              <div className="bg-[#14120E]/90 border border-[#8C7452]/30 rounded-xl p-2.5">
                <span className="text-[8px] font-mono text-[#8C7452] uppercase block">Autonomía</span>
                <span className="text-xs font-display text-[#FAF8F5] font-semibold">100% Crítica</span>
              </div>
            </div>

            {/* UNIFIED LEAD MAGNET CTA ENGINE */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Primary Glowing Unlock CTA */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(140,116,82,0.45)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={onOpen3DOrGate}
                className="group relative font-meta text-[11px] sm:text-xs px-8 py-4 bg-[#8C7452] hover:bg-[#A38760] text-[#0C0B0A] font-bold tracking-wider rounded-full flex items-center justify-center space-x-3 cursor-pointer shadow-[0_8px_30px_rgba(140,116,82,0.35)] transition-all"
              >
                {isAccredited ? (
                  <>
                    <Unlock className="w-4 h-4 text-[#0C0B0A]" />
                    <span>EXPLORAR EDIFICIO 3D Y PRECIOS</span>
                    <span className="font-mono text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#0C0B0A]" />
                    <span>DESBLOQUEAR VISOR 3D Y PRECIOS</span>
                    <span className="font-mono text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </motion.button>

              {/* Secondary Planos Button */}
              <button
                onClick={onExploreUnits}
                className="font-meta text-[10.5px] sm:text-[11px] px-6 py-4 bg-[#14120E]/90 hover:bg-[#2A241C] border border-[#FAF9F6]/15 hover:border-[#8C7452]/60 text-[#FAF8F5] tracking-wider rounded-full flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#8C7452]" />
                <span>Ver Planos y Distribución por Pisos</span>
              </button>
            </div>

            {/* Live Inventory Status Pill */}
            <div className="flex items-center space-x-3 pt-1 text-[10px] sm:text-[11px] font-meta text-[#A6A092]">
              <span className="flex items-center space-x-1.5 text-[#8C7452] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C7452] animate-ping"></span>
                <span>{availableCount} Disponibles</span>
              </span>
              <span>·</span>
              <span>{unitsReservedOrCommitted} Comprometidas</span>
              <span>·</span>
              <span>Entrega Estimada {BRAND_INFO.delivery}</span>
            </div>
          </div>

          {/* Right Column: Exclusive Technical Preview Glass Card */}
          <div className="lg:col-span-5 xl:col-span-4 bg-[#11100D]/90 backdrop-blur-xl rounded-3xl border border-[#8C7452]/35 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5">
            <div className="flex justify-between items-start border-b border-[#FAF9F6]/10 pb-4">
              <div>
                <span className="font-meta text-[8.5px] text-[#8C7452] uppercase tracking-[0.2em] block">
                  CONTENIDO EXCLUSIVO
                </span>
                <span className="font-display text-xl text-[#FAF8F5]">
                  Dossier & Valuaciones
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#8C7452]/20 border border-[#8C7452]/40 flex items-center justify-center">
                <CaroniIsotype size={20} color="#8C7452" />
              </div>
            </div>

            {/* Spec items list */}
            <div className="space-y-2.5 font-serif text-xs">
              <div className="flex justify-between py-1 border-b border-[#FAF9F6]/5">
                <span className="text-[#A6A092]">Visor 3D Interactivo:</span>
                <span className="font-meta text-[10px] text-[#8C7452] font-semibold flex items-center space-x-1">
                  {isAccredited ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{isAccredited ? 'Desbloqueado' : 'Requiere Registro'}</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#FAF9F6]/5">
                <span className="text-[#A6A092]">Lista de Precios por m²:</span>
                <span className="font-mono text-[#FAF8F5] font-semibold">
                  {isAccredited ? '$2.950 – $3.600 USD' : '•••••••• (Bloqueado)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#FAF9F6]/5">
                <span className="text-[#A6A092]">Título de Propiedad:</span>
                <span className="font-semibold text-[#FAF8F5]">{BRAND_INFO.regime} (Registrable)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#A6A092]">Superficie Construida:</span>
                <span className="font-mono font-semibold text-[#FAF8F5]">{totalMetros.toLocaleString('es-VE')} m²</span>
              </div>
            </div>

            {/* Direct 3D Visualizer Launcher */}
            <div className="pt-2">
              <button
                onClick={onOpen3DOrGate}
                className="w-full bg-[#1C1813] hover:bg-[#8C7452] text-[#EFEBE0] hover:text-[#0C0B0A] border border-[#8C7452]/50 font-meta text-[10px] uppercase tracking-widest py-3.5 px-4 rounded-full transition-all flex items-center justify-center space-x-2 cursor-pointer font-bold shadow-md"
              >
                {isAccredited ? (
                  <span>ABRIR MAQUETA 3D AHORA</span>
                ) : (
                  <span>DESBLOQUEAR ACCESO INMEDIATO</span>
                )}
                <span>→</span>
              </button>
            </div>

            <div className="text-center font-meta text-[8.5px] text-[#8C8678] tracking-widest">
              AÑIL ARQUITECTURA · ALTAMIRA · MMXXVIII
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM PILLARS BAR (Dark Luxury Finish) */}
      <div className="relative z-10 w-full border-t border-[#FAF9F6]/10 bg-[#070706]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="border-r border-[#FAF9F6]/10 pr-2">
            <span className="font-meta text-[8px] text-[#8C7452] uppercase tracking-wider block">01 · ESTRUCTURA</span>
            <div className="font-display text-xs sm:text-sm text-[#FAF8F5] mt-0.5">Propiedad Horizontal</div>
            <div className="text-[9px] text-[#8C8678] truncate">Documento registrado directo</div>
          </div>
          <div className="border-r border-[#FAF9F6]/10 pr-2">
            <span className="font-meta text-[8px] text-[#8C7452] uppercase tracking-wider block">02 · AUTONOMÍA</span>
            <div className="font-display text-xs sm:text-sm text-[#FAF8F5] mt-0.5">100% Respaldo Crítico</div>
            <div className="text-[9px] text-[#8C8678] truncate">Planta total + pozo continuo</div>
          </div>
          <div className="border-r border-[#FAF9F6]/10 pr-2">
            <span className="font-meta text-[8px] text-[#8C7452] uppercase tracking-wider block">03 · MODELO</span>
            <div className="font-display text-xs sm:text-sm text-[#FAF8F5] mt-0.5">7 Etapas de Construcción</div>
            <div className="text-[9px] text-[#8C8678] truncate">Custodia fiduciaria (Escrow)</div>
          </div>
          <div>
            <span className="font-meta text-[8px] text-[#8C7452] uppercase tracking-wider block">04 · UBICACIÓN</span>
            <div className="font-display text-xs sm:text-sm text-[#FAF8F5] mt-0.5">Altamira Norte</div>
            <div className="text-[9px] text-[#8C8678] truncate">Límite Parque Waraira Repano</div>
          </div>
        </div>
      </div>
    </section>
  );
};
