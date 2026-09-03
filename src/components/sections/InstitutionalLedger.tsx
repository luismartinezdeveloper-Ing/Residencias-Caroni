import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UNITS_DATA, MILESTONES_DATA, BRAND_INFO } from '../../data/brandData';
import { UnitData, MilestoneData } from '../../types/brand';
import { useConfidentiality } from '../../context/ConfidentialityContext';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { ShieldCheck, Building, LockKeyhole } from 'lucide-react';

interface InstitutionalLedgerProps {
  onSelectUnitToEmitLoi?: (unit: UnitData) => void;
}

export const InstitutionalLedger: React.FC<InstitutionalLedgerProps> = ({
  onSelectUnitToEmitLoi,
}) => {
  const { isAccredited, openAuthModal } = useConfidentiality();
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData>(MILESTONES_DATA[1]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'comprometida' | 'en_reserva' | 'disponible'>('all');

  const totalAreaM2 = UNITS_DATA.reduce((acc, u) => acc + u.totalArea, 0);
  const committedUnits = UNITS_DATA.filter((u) => u.status === 'comprometida').length;
  const reservedUnits = UNITS_DATA.filter((u) => u.status === 'en_reserva').length;
  const availableUnits = UNITS_DATA.filter((u) => u.status === 'disponible').length;

  const filteredUnits = UNITS_DATA.filter((u) => {
    if (filterStatus === 'all') return true;
    return u.status === filterStatus;
  });

  return (
    <section id="ledger" className="w-full bg-white border-b border-[#1B1813] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1B1813] pb-4 gap-4">
          <div>
            <div className="font-meta text-[10px] sm:text-[11px] text-[#8C8678] tracking-[0.24em] mb-1">
              04 · ESTADO DEL PROYECTO & PLAN DE PAGOS
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1B1813]">
              <span className="text-[#8C7452]">.</span>Avance de Obra y Garantía Fiduciaria.
            </h2>
            <p className="font-serif italic text-xs sm:text-sm text-[#8C8678] mt-0.5">
              Auditoría de ejecución en tiempo real, cronograma de pagos en 7 etapas de construcción y títulos registrados bajo Propiedad Horizontal.
            </p>
          </div>

          <div className="font-meta text-[10px] sm:text-[11px] text-[#8C7452] border border-[#8C7452] px-3.5 py-2 bg-[#FAF9F6] shrink-0 text-center font-medium">
            ESTADO ACTUALIZADO · 2026
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#1B1813] p-5 shadow-xs">
            <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">PROTECCIÓN DE FONDOS</span>
            <div className="font-display text-2xl sm:text-3xl text-[#1B1813] my-1 font-semibold">
              Garantía 100%
            </div>
            <span className="font-meta text-[9.5px] text-[#8C7452]">CUENTA CUSTODIA (ESCROW)</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#1B1813]/5 p-5 shadow-sm">
            <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">ESTADO DE DISPONIBILIDAD</span>
            <div className="font-display text-3xl text-[#1B1813] my-1">
              <AnimatedCounter value={committedUnits + reservedUnits} /> / {UNITS_DATA.length} <span className="text-sm text-[#8C8678] font-normal">RESIDENCIAS</span>
            </div>
            <span className="font-meta text-[9.5px] text-[#1B1813]">{committedUnits} FIRMADAS · {reservedUnits} EN RESERVA · {8 - committedUnits - reservedUnits} DISPONIBLES</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#1B1813]/5 p-5 shadow-sm">
            <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">SUPERFICIE TOTAL DEL PROYECTO</span>
            <div className="font-display text-3xl text-[#1B1813] my-1">
              <AnimatedCounter value={totalAreaM2} suffix=" m²" />
            </div>
            <span className="font-meta text-[9.5px] text-[#8C8678]">TÍTULO DE PROPIEDAD REGISTRABLE</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#1B1813]/5 p-5 shadow-sm">
            <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">ENTREGA ESTIMADA</span>
            <div className="font-display text-3xl text-[#8C7452] my-1">
              {BRAND_INFO.delivery}
            </div>
            <span className="font-meta text-[9.5px] text-[#8C8678] uppercase">{MILESTONES_DATA.find(m => m.status === 'en_curso')?.name || 'EN CONSTRUCCIÓN'}</span>
          </div>
        </div>

        {/* Technical Milestone S-Curve */}
        <div className="bg-[#FAF9F6] border border-[#1B1813] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C9C4B5] pb-3 gap-2">
            <div>
              <span className="font-meta text-[10px] text-[#8C8678]">PLAN DE APORTES POR ETAPAS</span>
              <h3 className="font-display text-2xl text-[#1B1813]">
                <span className="text-[#8C7452]">.</span>Cronograma de Pagos por Avance de Obra
              </h3>
            </div>
            <div className="font-serif italic text-xs text-[#8C8678]">
              Desembolsos progresivos certificados contra el avance real de cada etapa constructiva.
            </div>
          </div>

          {/* SVG S-Curve */}
          <div className="w-full bg-white border border-[#C9C4B5] p-4 sm:p-6 overflow-x-auto">
            <svg viewBox="0 0 800 240" className="min-w-[650px] w-full h-auto select-none" fill="none">
              {/* Hairline Grid */}
              <line x1="60" y1="30" x2="760" y2="30" stroke="#C9C4B5" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="60" y1="80" x2="760" y2="80" stroke="#C9C4B5" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="60" y1="130" x2="760" y2="130" stroke="#C9C4B5" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="60" y1="180" x2="760" y2="180" stroke="#C9C4B5" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="60" y1="210" x2="760" y2="210" stroke="#1B1813" strokeWidth="1.2" />

              {/* Y Axis percentage markers */}
              <text x="50" y="34" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="end">100%</text>
              <text x="50" y="84" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="end">75%</text>
              <text x="50" y="134" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="end">50%</text>
              <text x="50" y="184" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="end">25%</text>
              <text x="50" y="214" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="end">0%</text>

              {/* S-Curve Path */}
              <path
                d="M 80 200 L 170 180 L 280 150 L 400 115 L 520 80 L 640 50 L 740 30"
                stroke="#1B1813"
                strokeWidth="1.4"
                fill="none"
              />

              {/* Interactive Nodes */}
              {[
                { x: 80, y: 200, label: 'HITO 1', pct: '15%', done: true },
                { x: 170, y: 180, label: 'HITO 2', pct: '30%', active: true },
                { x: 280, y: 150, label: 'HITO 3', pct: '50%' },
                { x: 400, y: 115, label: 'HITO 4', pct: '65%' },
                { x: 520, y: 80, label: 'HITO 5', pct: '80%' },
                { x: 640, y: 50, label: 'HITO 6', pct: '92%' },
                { x: 740, y: 30, label: 'HITO 7', pct: '100%' },
              ].map((node, i) => (
                <g key={i} className="cursor-pointer" onClick={() => setSelectedMilestone(MILESTONES_DATA[i])}>
                  <line x1={node.x} y1={node.y} x2={node.x} y2="210" stroke="#8C8678" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.active ? 5 : 3.5}
                    fill={node.active ? '#8C7452' : node.done ? '#1B1813' : '#FFFFFF'}
                    stroke={node.active ? '#8C7452' : '#1B1813'}
                    strokeWidth="1.2"
                  />
                  <text
                    x={node.x}
                    y={node.y - 10}
                    fill={node.active ? '#8C7452' : '#1B1813'}
                    fontSize="8.5"
                    fontFamily="Calibri, Inter"
                    fontWeight={node.active ? 'bold' : 'normal'}
                    letterSpacing="0.1em"
                    textAnchor="middle"
                  >
                    {node.label} ({node.pct})
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Selected Milestone Inspection */}
          <div className="bg-white border border-[#C9C4B5] p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#C9C4B5] pb-3 mb-3 gap-2">
              <div>
                <span className="font-meta text-[9px] text-[#8C7452]">DETALLE DEL HITO AUDITADO</span>
                <h4 className="font-display text-xl text-[#1B1813]">{selectedMilestone.name}</h4>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-meta text-[9px] text-[#8C8678] block">VALUACIÓN TÉCNICA ACUMULADA:</span>
                <span className="font-mono text-base font-bold text-[#1B1813]">
                  USD {selectedMilestone.certifiedValueUsd.toLocaleString('es-VE')}
                </span>
              </div>
            </div>
            <p className="font-serif text-xs text-[#1B1813] leading-relaxed">
              {selectedMilestone.description} Fecha objetivo de cierre técnico: <strong>{selectedMilestone.targetDate}</strong>.
            </p>
          </div>
        </div>

        {/* 8 Residences Portfolio Status Table */}
        <div className="bg-white border border-[#1B1813] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#1B1813] pb-3 gap-3">
            <div>
              <span className="font-meta text-[10px] text-[#8C8678]">GESTIÓN DE CARTERA</span>
              <h3 className="font-display text-2xl sm:text-3xl text-[#1B1813]">
                <span className="text-[#8C7452]">.</span>Estado de las {UNITS_DATA.length} residencias
              </h3>
            </div>

            {/* Filter switcher */}
            <div className="flex gap-1 font-meta text-[9px] border border-[#1B1813]/10 p-1 rounded-full bg-[#FAF9F6]">
              {[
                { id: 'all', label: `TODAS (8)` },
                { id: 'comprometida', label: `COMPROMETIDAS (${committedUnits})` },
                { id: 'en_reserva', label: `EN RESERVA (${reservedUnits})` },
                { id: 'disponible', label: `LIBRES (${8 - committedUnits - reservedUnits})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id as any)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    filterStatus === f.id ? 'bg-[#1B1813] text-[#EFEBE0] shadow-sm' : 'text-[#8C8678] hover:text-[#1B1813] hover:bg-[#1B1813]/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-serif text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-[#1B1813] font-meta text-[9px] text-[#8C8678]">
                  <th className="pb-2">RESIDENCIA</th>
                  <th className="pb-2">NIVEL</th>
                  <th className="pb-2 text-right">SUP. INTERIOR</th>
                  <th className="pb-2 text-right">SUP. EXTERIOR</th>
                  <th className="pb-2 text-right">TOTAL M²</th>
                  <th className="pb-2 text-center">ESTADO CONTRACTUAL</th>
                  <th className="pb-2 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9C4B5]">
                {filteredUnits.map((u) => {
                  const exteriorArea = u.terraceArea + (u.gardenArea || 0);
                  return (
                    <tr key={u.id} className="hover:bg-[#FAF9F6]">
                      <td className="py-3 font-semibold text-[#1B1813]">{u.name}</td>
                      <td className="py-3 text-[#8C8678]">{u.level}</td>
                      <td className="py-3 text-right font-mono">{u.interiorArea.toLocaleString('es-VE')} m²</td>
                      <td className="py-3 text-right font-mono">{exteriorArea.toLocaleString('es-VE')} m²</td>
                      <td className="py-3 text-right font-mono font-bold text-[#8C7452]">{u.totalArea.toLocaleString('es-VE')} m²</td>
                      <td className="py-3 text-center">
                        {u.status === 'en_reserva' ? (
                          <span className="font-meta text-[9px] text-[#8C7452] font-semibold bg-[#FAF9F6] px-2 py-0.5 border border-[#8C7452]">
                            EN RESERVA
                          </span>
                        ) : u.status === 'comprometida' ? (
                          <span className="font-meta text-[9px] text-[#1B1813] bg-[#FAF9F6] px-2 py-0.5 border border-[#C9C4B5]">
                            COMPROMETIDA
                          </span>
                        ) : (
                          <span className="font-meta text-[9px] text-[#8C8678] bg-white px-2 py-0.5 border border-[#C9C4B5]">
                            DISPONIBLE
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {onSelectUnitToEmitLoi && (
                          isAccredited ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              onClick={() => onSelectUnitToEmitLoi(u)}
                              className="font-meta text-[9px] px-2.5 py-1 rounded-full bg-[#1B1813] text-[#EFEBE0] hover:bg-[#2A261E] transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                              LOI →
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              onClick={() => openAuthModal('ledger')}
                              className="font-meta text-[8.5px] px-2.5 py-1 rounded-full border border-[#1B1813]/10 bg-white text-[#1B1813] hover:bg-[#FAF9F6] transition-all cursor-pointer flex items-center space-x-1 shadow-sm hover:shadow-md"
                            >
                              <LockKeyhole className="w-2.5 h-2.5" />
                              <span>CATÁLOGO</span>
                            </motion.button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
