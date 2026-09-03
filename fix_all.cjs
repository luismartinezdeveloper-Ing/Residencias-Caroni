const fs = require('fs');

const fullComponent = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArchitecturalElevation, CaroniIsotype } from './ArchitecturalDrawings';
import { UNITS_DATA } from '../data/brandData';
import { UnitData } from '../types/brand';
import { useConfidentiality } from '../context/ConfidentialityContext';
import { LockKeyhole } from 'lucide-react';

interface InteractiveElevationViewerProps {
  selectedUnit: UnitData;
  onSelectUnit: (unit: UnitData) => void;
  onInspectUnitDetails: (unit: UnitData) => void;
  onEmitLoi: (unit: UnitData) => void;
  onOpen3DModal?: () => void;
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
      cota: '+25.50',
      label: 'NIVEL SUPERIOR · MIRADORES',
      height: 'Coronación',
      levelKey: 'superior',
      units: UNITS_DATA.filter((u) => u.typology === 'Mirador'),
      desc: 'Terrazas panorámicas de 180 m² a cota superior con piscina o espejo de agua y visión directa al Ávila.',
    },
    {
      cota: '+17.00',
      label: 'NIVEL P3 · RESIDENCIAS 03',
      height: 'Planta Tipo 03',
      levelKey: 'p3',
      units: UNITS_DATA.filter((u) => u.level === 'P3'),
      desc: 'Residencias en planta libre de 415 m² con terrazas continuas de 92 m² sobre el dosel de Altamira.',
    },
    {
      cota: '+12.75',
      label: 'NIVEL P2 · RESIDENCIAS 02',
      height: 'Planta Tipo 02',
      levelKey: 'p2',
      units: UNITS_DATA.filter((u) => u.level === 'P2'),
      desc: 'Configuración de 4 suites con palier privado exclusivo y ventilación cruzada norte-sur.',
    },
    {
      cota: '+4.25 / ±0.00',
      label: 'PLANTA BAJA + 1 · JARDINES',
      height: 'Dúplex PB',
      levelKey: 'pb',
      units: UNITS_DATA.filter((u) => u.typology === 'Jardín'),
      desc: 'Dúplex singulares con jardines privados de hasta 350 m² en contacto directo con el terreno natural.',
    },
    {
      cota: '-3.50',
      label: 'SÓTANO PRIVADO',
      height: 'Infraestructura',
      levelKey: 'sotano',
      units: [],
      desc: '36 puestos de estacionamiento, maleteros climatizados, garita de control 24/7 y núcleos de respaldo.',
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
              02 · INVENTARIO Y ARQUITECTURA
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1B1813]">
              <span className="text-[#8C7452]">.</span>Explorador Maestro del Edificio.
            </h2>
            <p className="font-serif italic text-xs sm:text-sm text-[#8C8678] mt-1">
              Seleccione un estrato o fachada en el plano interactivo para revelar el dossier técnico, la memoria descriptiva y los planos de la residencia correspondiente en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpen3DModal && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={onOpen3DModal}
                className="font-meta text-[9px] sm:text-[10px] text-[#1B1813] border border-[#1B1813]/20 rounded-full px-4 sm:px-4 py-1.5 bg-white hover:bg-[#FAF9F6] transition-all flex items-center space-x-1.5 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span className="text-[#8C7452]">●</span>
                <span>ESTUDIO VOLUMÉTRICO 3D</span>
              </motion.button>
            )}
            <div className="font-meta text-[9px] sm:text-[10px] text-[#8C7452] border border-[#8C7452]/40 rounded-full px-3 sm:px-4 py-1.5 bg-[#FAF9F6] shrink-0 shadow-sm">
              ESCALA 1:100 A TINTA · COTAS EN METROS
            </div>
          </div>
        </div>

        {/* Interactive Elevation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas: Vectorial Drawing with Hover and Active Highlighting */}
          <div className="lg:col-span-8 bg-[#FAF9F6] border border-[#C9C4B5] p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center text-[9.5px] font-meta text-[#8C8678] border-b border-[#C9C4B5] pb-2">
              <span>FACHADA NORTE-SUR · COTA MÁXIMA +25.50 m</span>
              <span className="text-[#8C7452] font-semibold">
                NIVEL SOMBREADO: {selectedUnit.level.toUpperCase()} ({selectedUnit.name.toUpperCase()})
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
              Haga clic directamente sobre cualquier piso o cota en el plano para sombrearlo e inspeccionar la residencia.
            </div>
          </div>

          {/* Right Selector: Vertical Interactive Level Navigator */}
          <div className="lg:col-span-4 space-y-3">
            <div className="font-meta text-[10px] text-[#8C8678] tracking-widest uppercase border-b border-[#1B1813] pb-1.5">
              ESTRATOS ARQUITECTÓNICOS (7 COTAS)
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
                    className={\`px-4 py-3 border-b border-[#1B1813]/5 last:border-b-0 transition-all cursor-pointer \${
                      isSelectedLevel
                        ? 'bg-[#FAF9F6] relative'
                        : 'hover:bg-[#FAF9F6]/50'
                    }\`}
                  >
                    {isSelectedLevel && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8C7452]" />
                    )}
                    <div className="flex justify-between items-center">
                      <span className={\`font-mono text-[11px] sm:text-xs font-bold \${isSelectedLevel ? 'text-[#8C7452]' : 'text-[#8C7452]/70'}\`}>
                        {lvl.cota}
                      </span>
                      <span className="font-meta text-[9px] text-[#8C8678]">
                        {lvl.height}
                      </span>
                    </div>
                    <div className={\`font-display text-sm mt-0.5 flex items-center justify-between \${isSelectedLevel ? 'text-[#1B1813] font-semibold' : 'text-[#1B1813]/80'}\`}>
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
                                    className={\`font-meta text-[9px] px-2.5 py-1.5 rounded-full transition-all flex-1 text-center border cursor-pointer \${
                                      isActive
                                        ? 'bg-[#1B1813] text-[#EFEBE0] border-[#1B1813] font-semibold shadow-md'
                                        : 'bg-white text-[#1B1813] border-[#1B1813]/10 hover:shadow-sm hover:bg-[#FAF9F6]'
                                    }\`}
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
        <div className="bg-[#FAF9F6] border border-[#1B1813] p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-meta text-[9px] text-[#8C7452] font-semibold tracking-wider">
                UNIDAD ACTIVA EN CORTE
              </span>
            </div>
            <div className="font-display text-xl sm:text-2xl text-[#1B1813]">
              {selectedUnit.name} — Nivel {selectedUnit.level} ({selectedUnit.totalArea.toLocaleString('es-VE')} m²)
            </div>
            <div className="font-serif text-xs text-[#8C8678]">
              {selectedUnit.distinctiveAttribute}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
`;

fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', fullComponent);
console.log('Restored entire file!');
