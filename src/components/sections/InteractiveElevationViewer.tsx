import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArchitecturalElevation, CaroniIsotype } from '../ui/ArchitecturalDrawings';
import { UNITS_DATA } from '../../data/brandData';
import { UnitData } from '../../types/brand';
import { useConfidentiality } from '../../context/ConfidentialityContext';
import { LockKeyhole, Compass } from 'lucide-react';

interface InteractiveElevationViewerProps {
  selectedUnit: UnitData;
  onSelectUnit: (unit: UnitData) => void;
  onInspectUnitDetails: (unit: UnitData) => void;
  onEmitLoi: (unit: UnitData) => void;
  onOpen3DModal?: (initialMode?: 'assembled' | 'tour360') => void;
}

export const InteractiveElevationViewer: React.FC<InteractiveElevationViewerProps> = ({
  selectedUnit,
  onSelectUnit,
  onInspectUnitDetails,
  onEmitLoi,
  onOpen3DModal,
}) => {
  const { isAccredited, openAuthModal } = useConfidentiality();
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  // Structural Cotas Hierarchy
  const levels = [
    {
      cota: 'Nivel +25.5 m',
      label: 'PENTHOUSES · MIRADORES SUPERIORES',
      height: 'Piso Superior',
      levelKey: 'superior',
      units: UNITS_DATA.filter((u) => u.typology === 'Mirador'),
      desc: 'Terrazas panorámicas de 180 m² con piscina privada y vistas directas de 180° al Parque Nacional El Ávila.',
    },
    {
      cota: 'Nivel +17.0 m',
      label: 'NIVEL 3 · RESIDENCIAS 3ER PISO',
      height: 'Piso 3',
      levelKey: 'p3',
      units: UNITS_DATA.filter((u) => u.level === 'P3'),
      desc: 'Residencias de 415 m² con terrazas continuas de 92 m² sobre el entorno arbolado de Altamira.',
    },
    {
      cota: 'Nivel +12.7 m',
      label: 'NIVEL 2 · RESIDENCIAS 2DO PISO',
      height: 'Piso 2',
      levelKey: 'p2',
      units: UNITS_DATA.filter((u) => u.level === 'P2'),
      desc: 'Distribución de 3 a 4 suites con ascensor privado directo y ventilación cruzada natural.',
    },
    {
      cota: 'Planta Baja',
      label: 'PLANTA BAJA · DÚPLEX CON JARDÍN PRIVADO',
      height: 'Planta Baja',
      levelKey: 'pb',
      units: UNITS_DATA.filter((u) => u.typology === 'Jardín'),
      desc: 'Residencias dúplex de gran formato con hasta 350 m² de jardín privado y piscina.',
    },
    {
      cota: 'Subsuelo',
      label: 'SÓTANO PRIVADO Y SERVICIOS',
      height: 'Estacionamiento',
      levelKey: 'sotano',
      units: [],
      desc: '36 puestos de estacionamiento techados, maleteros, seguridad 24/7 y planta eléctrica 100%.',
    },
  ];

  const handleSelectUnitById = (unitId: string) => {
    const unit = UNITS_DATA.find((u) => u.id === unitId);
    if (unit) {
      onSelectUnit(unit);
    }
  };

  return (
    <section id="elevacion" className="w-full bg-white pt-12 sm:pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#1B1813] pb-4 gap-4">
          <div>
            <div className="font-meta text-[10px] sm:text-[11px] text-[#8C8678] tracking-[0.24em] mb-1">
              02 · RESIDENCIAS Y PLANOS DE DISTRIBUCIÓN
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1B1813]">
              <span className="text-[#8C7452]">.</span>Explorador de Pisos y Tipologías.
            </h2>
            <p className="font-serif italic text-xs sm:text-sm text-[#8C8678] mt-1">
              Seleccione un nivel en la fachada interactiva para ver los detalles, planos de distribución y metraje de cada residencia en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="font-meta text-[9px] sm:text-[10px] text-[#8C7452] border border-[#8C7452]/40 rounded-full px-3 sm:px-4 py-1.5 bg-[#FAF9F6] shrink-0 shadow-sm">
              FACHADA PRINCIPAL · 8 RESIDENCIAS EXCLUSIVAS
            </div>
          </div>
        </div>

        {/* Interactive Elevation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas: Vectorial Drawing with Hover and Active Highlighting */}
          <div className="lg:col-span-8 bg-[#FAF9F6] border border-[#C9C4B5] p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center text-[9.5px] font-meta text-[#8C8678] border-b border-[#C9C4B5] pb-2">
              <span>VISTA FRONTAL · ALTAMIRA, CARACAS</span>
              <span className="text-[#8C7452] font-semibold">
                RESIDENCIA SELECCIONADA: {selectedUnit.name.toUpperCase()} ({selectedUnit.level.toUpperCase()})
              </span>
            </div>

            <div className="relative">
              <ArchitecturalElevation
                highlightLevel={hoveredLevel || selectedUnit.level}
                selectedUnitId={selectedUnit.id}
                onSelectUnitId={handleSelectUnitById}
                showCotas={true}
                theme="crema"
              />
            </div>

            <div className="font-serif italic text-[11px] text-[#8C8678] text-center border-t border-[#C9C4B5]/60 pt-2">
              Haga clic sobre cualquier piso o nivel en el plano para consultar la residencia y sus características.
            </div>
          </div>

          {/* Right Selector: Vertical Interactive Level Navigator */}
          <div className="lg:col-span-4 space-y-3">
            <div className="font-meta text-[10px] text-[#8C8678] tracking-widest uppercase border-b border-[#1B1813] pb-1.5">
              DISTRIBUCIÓN POR NIVELES
            </div>

            <div className="bg-white rounded-2xl border border-[#1B1813]/10 overflow-hidden shadow-sm">
              {levels.map((lvl, idx) => {
                const isSelectedLevel = lvl.units.some((u) => u.id === selectedUnit.id);
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredLevel(lvl.levelKey)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    onClick={() => {
                      if (lvl.units.length > 0 && !isSelectedLevel) {
                        onSelectUnit(lvl.units[0]);
                      }
                    }}
                    className={`px-4 py-3 border-b border-[#1B1813]/5 last:border-b-0 transition-all cursor-pointer ${
                      isSelectedLevel
                        ? 'bg-[#FAF9F6] relative'
                        : 'hover:bg-[#FAF9F6]/50'
                    }`}
                  >
                    {isSelectedLevel && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8C7452]" />
                    )}
                    <div className="flex justify-between items-center">
                      <span className={`font-mono text-[11px] sm:text-xs font-bold ${isSelectedLevel ? 'text-[#8C7452]' : 'text-[#8C7452]/70'}`}>
                        {lvl.cota}
                      </span>
                      <span className="font-meta text-[9px] text-[#8C8678]">
                        {lvl.height}
                      </span>
                    </div>
                    <div className={`font-display text-sm mt-0.5 flex items-center justify-between ${isSelectedLevel ? 'text-[#1B1813] font-semibold' : 'text-[#1B1813]/80'}`}>
                      <span>{lvl.label}</span>
                      {isSelectedLevel && (
                        <span className="font-meta text-[8px] bg-[#8C7452] text-[#EFEBE0] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-sm">
                          Sel.
                        </span>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {isSelectedLevel && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="font-serif text-[11px] text-[#8C8678] mt-2 leading-snug">
                            {lvl.desc}
                          </p>
                          {/* Associated Units Quick Select */}
                          {lvl.units.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-[#C9C4B5]/60 flex gap-2 pb-1">
                              {lvl.units.map((u) => {
                                const isActive = u.id === selectedUnit.id;
                                return (
                                  <button
                                    key={u.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectUnit(u);
                                    }}
                                    className={`font-meta text-[9px] px-2.5 py-1.5 rounded-full transition-all flex-1 text-center border cursor-pointer ${
                                      isActive
                                        ? 'bg-[#1B1813] text-[#EFEBE0] border-[#1B1813] font-semibold shadow-md'
                                        : 'bg-white text-[#1B1813] border-[#1B1813]/10 hover:shadow-sm hover:bg-[#FAF9F6]'
                                    }`}
                                  >
                                    {u.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Focused Unit Highlight Strip */}
        <div className="bg-[#FAF9F6] border border-[#1B1813]/15 p-5 sm:p-6 rounded-2xl shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Unit Info */}
            <div className="space-y-1 max-w-md">
              <div className="flex items-center space-x-2">
                <span className="font-meta text-[9px] text-[#8C7452] font-semibold tracking-wider">
                  UNIDAD ACTIVA EN CORTE
                </span>
                <span className="text-[#C9C4B5]">·</span>
                <span className="font-meta text-[9px] text-[#8C8678]">
                  {selectedUnit.rooms} HABITACIONES EN SUITE
                </span>
              </div>
              <div className="font-display text-xl sm:text-2xl text-[#1B1813]">
                {selectedUnit.name} — Nivel {selectedUnit.level}
              </div>
              <div className="font-serif text-xs text-[#8C8678] line-clamp-2">
                «{selectedUnit.distinctiveAttribute}»
              </div>
            </div>

            {/* Metrics & Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#C9C4B5]/60">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <div className="font-meta text-[8.5px] text-[#8C8678] tracking-wider uppercase">Techada</div>
                  <div className="font-mono text-sm sm:text-base font-semibold text-[#1B1813]">
                    {selectedUnit.interiorArea.toLocaleString('es-VE')} m²
                  </div>
                </div>
                <div>
                  <div className="font-meta text-[8.5px] text-[#8C8678] tracking-wider uppercase">Abierta</div>
                  <div className="font-mono text-sm sm:text-base font-semibold text-[#1B1813]">
                    {(selectedUnit.terraceArea + (selectedUnit.gardenArea || 0)).toLocaleString('es-VE')} m²
                  </div>
                </div>
                <div>
                  <div className="font-meta text-[8.5px] text-[#8C7452] tracking-wider uppercase">Total</div>
                  <div className="font-mono text-sm sm:text-base font-bold text-[#8C7452]">
                    {selectedUnit.totalArea.toLocaleString('es-VE')} m²
                  </div>
                </div>
                <div>
                  <div className="font-meta text-[8.5px] text-[#8C8678] tracking-wider uppercase">Estacionamiento</div>
                  <div className="font-mono text-sm sm:text-base font-semibold text-[#1B1813]">
                    {selectedUnit.parkingSpots} Puestos
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onOpen3DModal?.('tour360')}
                  className="font-meta text-[10px] sm:text-[11px] px-5 py-3 bg-[#8C7452] text-[#FAF9F6] hover:bg-[#735D3F] hover:shadow-md transition-all rounded-full font-medium flex items-center justify-center space-x-2 cursor-pointer shrink-0 uppercase tracking-wider shadow-sm"
                  title="Recorrer interiores en 360° panorámico"
                >
                  <Compass className="w-3.5 h-3.5 text-[#F5C780] animate-spin" style={{ animationDuration: '8s' }} />
                  <span>Tour 360° Interiores</span>
                </button>

                <button
                  onClick={() => onOpen3DModal?.('assembled')}
                  className="font-meta text-[10px] sm:text-[11px] px-5 py-3 bg-[#1B1813] text-[#EFEBE0] hover:bg-[#2A261E] hover:shadow-md transition-all rounded-full font-medium flex items-center justify-center space-x-2 cursor-pointer shrink-0 uppercase tracking-wider"
                >
                  <span className="text-[#8C7452] animate-pulse">●</span>
                  <span>Maqueta 3D</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};
