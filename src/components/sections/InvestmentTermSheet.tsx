import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UNITS_DATA, MILESTONES_DATA, BRAND_INFO } from '../../data/brandData';
import { UnitData, MilestoneData } from '../../types/brand';
import { CaroniIsotype, CaroniSeal } from '../ui/ArchitecturalDrawings';
import { useConfidentiality } from '../../context/ConfidentialityContext';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { ShieldCheck, FileCheck2, ArrowRight, Building, Sparkles } from 'lucide-react';

interface InvestmentTermSheetProps {
  selectedUnit: UnitData;
  onSelectUnit: (unit: UnitData) => void;
}

export const InvestmentTermSheet: React.FC<InvestmentTermSheetProps> = ({
  selectedUnit,
  onSelectUnit,
}) => {
  const { isAccredited, openAuthModal, credentials } = useConfidentiality();
  const [docTab, setDocTab] = useState<'loi' | 'valuacion' | 'recibo'>('loi');
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData>(MILESTONES_DATA[1]);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(8); // 8% per manual

  // Investment Model Parameters (Institucional)
  const defaultPricePerM2 = selectedUnit.typology === 'Mirador' ? 3600 : selectedUnit.typology === 'Jardín' ? 2950 : 3300;
  const [pricePerM2, setPricePerM2] = useState<number>(defaultPricePerM2);

  const totalValueUsd = Math.round(selectedUnit.totalArea * pricePerM2);
  const reserveDepositUsd = Math.round(totalValueUsd * 0.10); // 10% de señal de reserva

  // Editable LOI Investor Fields
  const [buyerName, setBuyerName] = useState(() => credentials?.holderName || 'Inversiones & Patrimonio Caracas, C.A.');
  const [buyerId, setBuyerId] = useState('J-40982314-8');
  const [buyerRep, setBuyerRep] = useState(() => credentials?.holderName || 'Dr. Carlos Mendoza Arria');
  const [buyerEmail, setBuyerEmail] = useState('presidencia@patrimoniocaracas.com');
  const [validityDays, setValidityDays] = useState(15);

  return (
    <section id="inversion" className="w-full bg-[#EFEBE0] border-b border-[#1B1813] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1B1813] pb-4 gap-4">
          <div>
            <div className="font-meta text-[10px] sm:text-[11px] text-[#8C8678] tracking-[0.24em] mb-1">
              03 · CONDICIONES COMERCIALES & PROCESO DE RESERVA
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1B1813]">
              <span className="text-[#8C7452]">.</span>{isAccredited ? 'Generador de Acuerdo de Reserva (LOI).' : 'Estructura de Compra y Garantía Fiduciaria.'}
            </h2>
            <p className="font-serif italic text-xs sm:text-sm text-[#8C8678] mt-0.5">
              {isAccredited
                ? 'Emisión institucional de Carta de Intención, Certificado de Valuación y Recibo Fiduciario.'
                : 'Proceso de adquisición transparente bajo régimen de Propiedad Horizontal y cuenta custodia garantizada.'}
            </p>
          </div>

          {/* Top Actions / Tabs */}
          {isAccredited ? (
            <div className="flex border border-[#1B1813] bg-[#FAF9F6] p-0.5 self-stretch sm:self-auto">
              {[
                { id: 'loi', label: '1. ACUERDO DE RESERVA' },
                { id: 'valuacion', label: '2. CERTIFICADO VALUACIÓN' },
                { id: 'recibo', label: '3. RECIBO FIDUCIARIO' },
              ].map((t) => {
                const isActive = docTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDocTab(t.id as any)}
                    className={`relative font-meta text-[9.5px] sm:text-[10px] px-3.5 py-1.5 transition-colors z-10 ${
                      isActive
                        ? 'text-[#EFEBE0]'
                        : 'text-[#1B1813] hover:text-[#8C7452]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeDocTab"
                        className="absolute inset-0 bg-[#1B1813] -z-10 shadow-xs"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {t.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => openAuthModal('inversion')}
              className="font-meta text-[10px] px-5 py-2.5 rounded-full bg-[#1B1813] text-[#EFEBE0] hover:bg-[#8C7452] transition-colors flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <span>SOLICITAR ASESORÍA PRIVADA</span>
              <span>→</span>
            </motion.button>
          )}
        </div>

        {/* Public State vs. Accredited Private State */}
        {!isAccredited ? (
          /* STATE 1: Elegant Public Protocol Presentation */
          <div className="bg-white border border-[#1B1813] p-8 sm:p-12 shadow-xs space-y-8">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="w-12 h-12 bg-[#FAF9F6] border border-[#C9C4B5] flex items-center justify-center mx-auto text-[#8C7452]">
                <Building className="w-5 h-5 text-[#8C7452]" />
              </div>
              <div className="font-meta text-xs text-[#8C7452] tracking-[0.24em] uppercase">
                AÑIL ARQUITECTURA · ATENCIÓN PATRIMONIAL PRIVADA
              </div>
              <h3 className="font-display text-2xl sm:text-3xl text-[#1B1813]">
                .Proceso de Compra Seguro y Transparente.
              </h3>
              <p className="font-serif text-sm text-[#8C8678] leading-relaxed">
                La adquisición de las 8 residencias de Residencias Caroní se gestiona de forma directa con Añil Arquitectura, mediante un esquema fiduciario en cuenta custodia con pagos vinculados al avance físico real de la obra.
              </p>
            </div>

            {/* 3 Pillars of the Financial Model */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4 border-t border-[#C9C4B5]">
              <div className="p-5 bg-[#FAF9F6] border border-[#C9C4B5] space-y-2">
                <span className="font-meta text-[10px] text-[#8C7452] font-semibold">01 · PAGOS PROTEGIDOS</span>
                <h4 className="font-display text-base text-[#1B1813]">Cuenta Custodia (Escrow)</h4>
                <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
                  Los depósitos de reserva y cuotas se custodian en una cuenta bancaria fiduciaria hasta la validación de cada etapa.
                </p>
              </div>

              <div className="p-5 bg-[#FAF9F6] border border-[#C9C4B5] space-y-2">
                <span className="font-meta text-[10px] text-[#8C7452] font-semibold">02 · PLAN EN 7 ETAPAS</span>
                <h4 className="font-display text-base text-[#1B1813]">Pagos por Avance de Obra</h4>
                <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
                  Cuotas programadas según el progreso certificado de la construcción (fundaciones, estructura, cerramientos y acabados).
                </p>
              </div>

              <div className="p-5 bg-[#FAF9F6] border border-[#C9C4B5] space-y-2">
                <span className="font-meta text-[10px] text-[#8C7452] font-semibold">03 · RESERVA FORMAL</span>
                <h4 className="font-display text-base text-[#1B1813]">Acuerdo y Título Registrado</h4>
                <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
                  Carta de Intención vinculante con 10% de señal de reserva, 15 días de revisión legal y adjudicación garantizada.
                </p>
              </div>
            </div>

            {/* Public Inquiry & Discrete Protocol Action */}
            <div className="max-w-2xl mx-auto bg-[#FAF9F6] border border-[#C9C4B5] p-6 sm:p-8 text-center space-y-4">
              <span className="font-meta text-[10px] text-[#8C7452] tracking-widest uppercase block">
                ASESORÍA PRIVADA
              </span>
              <h4 className="font-serif text-lg sm:text-xl text-[#1B1813]">
                ¿Desea coordinar una presentación privada del proyecto?
              </h4>
              <p className="font-serif text-xs text-[#8C8678] max-w-lg mx-auto leading-relaxed">
                Coordinamos presentaciones confidenciales con los arquitectos directores para presentar el expediente de obra, especificaciones de mármoles y planes de pago personalizados.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => openAuthModal('inversion')}
                  className="rounded-full bg-[#1B1813] text-[#EFEBE0] hover:bg-[#8C7452] px-6 py-3 font-meta text-[11px] uppercase tracking-widest transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Solicitar Reunión Privada
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => openAuthModal('inversion')}
                  className="rounded-full bg-white text-[#1B1813] border border-[#1B1813]/10 hover:bg-[#FAF9F6] px-5 py-3 font-meta text-[10.5px] uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Ingresar Código de Invitación
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          /* STATE 2: Full Accredited Financial Workstation & LOI Generator */
          <>
            {/* Top Financial Dashboard Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#1B1813] p-5">
                <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">VALOR ESTIMADO TOTAL</span>
                <div className="font-display text-2xl sm:text-3xl text-[#1B1813] my-1 font-semibold">
                  <AnimatedCounter prefix="USD " value={totalValueUsd} />
                </div>
                <span className="font-meta text-[9.5px] text-[#8C7452]">
                  {selectedUnit.name} · {selectedUnit.totalArea.toLocaleString('es-VE')} m²
                </span>
              </div>

              <div className="bg-white border border-[#C9C4B5] p-5">
                <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">SEÑAL DE RESERVA (10%)</span>
                <div className="font-display text-2xl sm:text-3xl text-[#1B1813] my-1 font-semibold">
                  <AnimatedCounter prefix="USD " value={reserveDepositUsd} />
                </div>
                <span className="font-meta text-[9.5px] text-[#1B1813]">CUSTODIA ESCROW VINCULANTE</span>
              </div>

              <div className="bg-white border border-[#C9C4B5] p-5">
                <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">ESTRUCTURA DE DESEMBOLSO</span>
                <div className="font-display text-2xl sm:text-3xl text-[#8C7452] my-1">
                  7 Hitos
                </div>
                <span className="font-meta text-[9.5px] text-[#8C8678]">CONTRA VALUACIÓN CERTIFICADA</span>
              </div>

              <div className="bg-white border border-[#C9C4B5] p-5">
                <span className="font-meta text-[9.5px] text-[#8C8678] block tracking-wider">TIEMPO PARA FIRMA LEGAL</span>
                <div className="font-display text-2xl sm:text-3xl text-[#1B1813] my-1">
                  <AnimatedCounter suffix=" Días" value={validityDays} />
                </div>
                <span className="font-meta text-[9.5px] text-[#8C8678]">PERÍODO DE DEBIDA DILIGENCIA</span>
              </div>
            </div>

            {/* Main Workstation: Left Parameters + Right Document Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Panel: Term Sheet Controls & Form */}
              <div className="lg:col-span-4 bg-white border border-[#1B1813] p-5 sm:p-6 space-y-5">
                <div className="border-b border-[#1B1813] pb-2">
                  <span className="font-meta text-[9px] text-[#8C7452] block font-semibold">
                    PARÁMETROS DE LA OPERACIÓN
                  </span>
                  <h3 className="font-display text-lg text-[#1B1813]">Configuración de Emisión</h3>
                </div>

                {/* Residence Selector */}
                <div className="space-y-1">
                  <label className="font-meta text-[9px] text-[#8C8678] block">RESIDENCIA OBJETO</label>
                  <select
                    value={selectedUnit.id}
                    onChange={(e) => {
                      const u = UNITS_DATA.find((item) => item.id === e.target.value);
                      if (u) {
                        onSelectUnit(u);
                        const newPrice = u.typology === 'Mirador' ? 3600 : u.typology === 'Jardín' ? 2950 : 3300;
                        setPricePerM2(newPrice);
                      }
                    }}
                    className="w-full bg-[#FAF9F6] border border-[#C9C4B5] p-2 font-display text-sm text-[#1B1813] focus:outline-hidden"
                  >
                    {UNITS_DATA.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.totalArea.toLocaleString('es-VE')} m²)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price per m2 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-meta text-[9px] text-[#8C8678]">VALOR REF. POR M² (USD)</label>
                    <span className="font-mono text-xs font-bold text-[#8C7452]">USD {pricePerM2} / m²</span>
                  </div>
                  <input
                    type="range"
                    min="2700"
                    max="4500"
                    step="50"
                    value={pricePerM2}
                    onChange={(e) => setPricePerM2(Number(e.target.value))}
                    className="w-full accent-[#8C7452] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#8C8678]">
                    <span>USD 2.700 (PB)</span>
                    <span>USD 3.600 (Mirador)</span>
                    <span>USD 4.500 (Máx)</span>
                  </div>
                </div>

                {/* Buyer & Representative */}
                <div className="space-y-3 pt-2 border-t border-[#C9C4B5]">
                  <div className="font-meta text-[9px] text-[#8C7452] uppercase">DATOS DEL COMPRADOR ACREDITADO</div>
                  <div>
                    <label className="font-meta text-[9px] text-[#8C8678] block">NOMBRE O RAZÓN SOCIAL</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#C9C4B5] px-2.5 py-1.5 font-serif text-xs text-[#1B1813]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-meta text-[9px] text-[#8C8678] block">RIF / CI</label>
                      <input
                        type="text"
                        value={buyerId}
                        onChange={(e) => setBuyerId(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#C9C4B5] px-2.5 py-1.5 font-serif text-xs text-[#1B1813]"
                      />
                    </div>
                    <div>
                      <label className="font-meta text-[9px] text-[#8C8678] block">VIGENCIA DE RESERVA (DÍAS)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={validityDays}
                        onChange={(e) => setValidityDays(Number(e.target.value))}
                        className="w-full bg-[#FAF9F6] border border-[#C9C4B5] px-2.5 py-1.5 font-serif text-xs text-[#1B1813]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-meta text-[9px] text-[#8C8678] block">REPRESENTANTE LEGAL</label>
                    <input
                      type="text"
                      value={buyerRep}
                      onChange={(e) => setBuyerRep(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#C9C4B5] px-2.5 py-1.5 font-serif text-xs text-[#1B1813]"
                    />
                  </div>
                </div>

                {/* Milestone Inspection for Valuations */}
                <div className="space-y-2 pt-2 border-t border-[#C9C4B5]">
                  <label className="font-meta text-[9px] text-[#8C7452] block uppercase">
                    SELECCIONAR HITO DE VALUACIÓN PARA CERTIFICACIÓN
                  </label>
                  <select
                    value={selectedMilestone.id}
                    onChange={(e) => {
                      const m = MILESTONES_DATA.find((item) => item.id === Number(e.target.value));
                      if (m) setSelectedMilestone(m);
                    }}
                    className="w-full bg-[#FAF9F6] border border-[#C9C4B5] p-2 font-serif text-xs text-[#1B1813]"
                  >
                    {MILESTONES_DATA.map((m) => (
                      <option key={m.id} value={m.id}>
                        Hito {m.id} · {m.name} ({m.percentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#1B1813]/10 space-y-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => window.print()}
                    className="w-full rounded-full bg-[#1B1813] text-[#EFEBE0] hover:bg-[#8C7452] transition-all py-3 font-meta text-[10px] tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <span>EXPORTAR DOCUMENTO OFICIAL (PDF)</span>
                  </motion.button>
                </div>
              </div>

              {/* Right Panel: Official Document Canvas (A4 Sheet Simulation) */}
              <div className="lg:col-span-8 bg-white border border-[#1B1813] p-4 sm:p-8 md:p-12 shadow-md relative min-h-[600px] sm:min-h-[750px] flex flex-col justify-between overflow-hidden">
                {/* Watermark Logo in center */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                  style={{ opacity: watermarkOpacity / 100 }}
                >
                  <CaroniSeal size={320} color="#8C7452" />
                </div>

                {/* Document Header */}
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start border-b border-[#1B1813] pb-4">
                    <div>
                      <div className="font-meta text-[9px] text-[#8C8678] tracking-[0.24em] uppercase">
                        AÑIL ARQUITECTURA · MEMORIA INSTITUCIONAL
                      </div>
                      <h2 className="font-display text-2xl text-[#1B1813] mt-0.5">
                        RESIDENCIAS CARONÍ
                      </h2>
                      <div className="font-serif italic text-xs text-[#8C8678]">
                        Transversal 8, Altamira, Chacao, Caracas
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <CaroniIsotype size={28} color="#1B1813" className="ml-auto" />
                      <div className="font-mono text-[9px] text-[#8C7452] font-semibold">
                        REF: LOI-{selectedUnit.id.toUpperCase()}-2028
                      </div>
                      <div className="font-meta text-[8.5px] text-[#8C8678]">
                        FECHA: 20 . VIII . 2026
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENT VIEW 1: LOI (Letter of Intent) */}
                  {docTab === 'loi' && (
                    <div className="space-y-5 font-serif text-xs text-[#1B1813] leading-relaxed">
                      <div className="text-center py-2 border-y border-[#C9C4B5]">
                        <span className="font-meta text-[10px] text-[#8C7452] tracking-widest uppercase font-semibold">
                          ACUERDO DE RESERVA & CARTA DE INTENCIÓN (LOI)
                        </span>
                      </div>

                      <p>
                        Por medio del presente documento, <strong>{buyerName}</strong>, con documento de identidad / RIF N° <strong>{buyerId}</strong>, representada por <strong>{buyerRep}</strong>, manifiesta formalmente su intención de adquirir la residencia denominada <strong>{selectedUnit.name}</strong> dentro del proyecto <em>Residencias Caroní</em>, bajo el régimen de Propiedad Horizontal registrado.
                      </p>

                      {/* Technical & Commercial Table */}
                      <div className="bg-[#FAF9F6] border border-[#1B1813] p-4 my-3">
                        <table className="w-full text-left font-serif text-xs">
                          <tbody className="divide-y divide-[#C9C4B5]">
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Unidad Objeto:</td>
                              <td className="py-1.5 font-semibold text-right">{selectedUnit.name} (Nivel {selectedUnit.level})</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Superficie Total Contractual:</td>
                              <td className="py-1.5 font-mono text-right font-semibold">{selectedUnit.totalArea.toLocaleString('es-VE')} m²</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Asignación de Estacionamiento:</td>
                              <td className="py-1.5 text-right">{selectedUnit.parkingSpots} puestos privados en Sótano</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Valor Referencial por m²:</td>
                              <td className="py-1.5 font-mono text-right">USD {pricePerM2.toLocaleString('es-VE')}</td>
                            </tr>
                            <tr className="border-t-2 border-[#1B1813] font-bold text-sm">
                              <td className="pt-2 text-[#1B1813]">MONTO TOTAL ESTIMADO:</td>
                              <td className="pt-2 font-mono text-right text-[#8C7452]">USD {totalValueUsd.toLocaleString('es-VE')}</td>
                            </tr>
                            <tr className="font-semibold text-xs">
                              <td className="py-1 text-[#8C7452]">SEÑAL DE RESERVA EN ESCROW (10%):</td>
                              <td className="py-1 font-mono text-right text-[#8C7452]">USD {reserveDepositUsd.toLocaleString('es-VE')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <p>
                        <strong>Condiciones Fiduciarias:</strong> La señal de reserva equivalente al diez por ciento (10%) será depositada en la cuenta de custodia fiduciaria en depósito de garantía (Escrow Account), vinculada al avance de obra conforme al cronograma de 7 hitos físicos certificados por la inspección de Añil Arquitectura.
                      </p>

                      <p>
                        <strong>Período de Debida Diligencia:</strong> Esta Carta de Intención confiere un período de exclusividad de <strong>{validityDays} días continuos</strong> a partir de su firma para la revisión del borrador del Documento de Condominio y suscripción del Contrato de Venta Definitivo.
                      </p>
                    </div>
                  )}

                  {/* DOCUMENT VIEW 2: Valuación Técnica */}
                  {docTab === 'valuacion' && (
                    <div className="space-y-5 font-serif text-xs text-[#1B1813] leading-relaxed">
                      <div className="text-center py-2 border-y border-[#C9C4B5]">
                        <span className="font-meta text-[10px] text-[#8C7452] tracking-widest uppercase font-semibold">
                          CERTIFICADO TÉCNICO DE VALUACIÓN DE OBRA
                        </span>
                      </div>

                      <p>
                        Añil Arquitectura certifica que al hito <strong>Hito {selectedMilestone.id}: {selectedMilestone.name}</strong>, el desarrollo constructivo de <em>Residencias Caroní</em> presenta un avance físico ponderado del <strong>{selectedMilestone.percentage}%</strong>.
                      </p>

                      <div className="bg-[#FAF9F6] border border-[#1B1813] p-4 my-3">
                        <table className="w-full text-left font-serif text-xs">
                          <tbody className="divide-y divide-[#C9C4B5]">
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Hito de Certificación:</td>
                              <td className="py-1.5 font-semibold text-right">Hito {selectedMilestone.id} · {selectedMilestone.name}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Fecha de Inspección:</td>
                              <td className="py-1.5 text-right font-mono">{selectedMilestone.targetDate}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Porcentaje Acumulado de Obra:</td>
                              <td className="py-1.5 text-right font-mono font-bold text-[#8C7452]">{selectedMilestone.percentage}%</td>
                            </tr>
                            <tr className="border-t-2 border-[#1B1813] font-bold">
                              <td className="pt-2 text-[#1B1813]">VALORACIÓN CERTIFICADA ACUMULADA:</td>
                              <td className="pt-2 font-mono text-right text-[#1B1813]">USD {selectedMilestone.certifiedValueUsd.toLocaleString('es-VE')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <p>
                        <strong>Dictamen de Inspección:</strong> {selectedMilestone.description} Todas las pruebas de laboratorio de concreto y ensayos de resistencia cumplen holgadamente la normativa COVENIN 1756-2001 para edificaciones sismorresistentes en el valle de Caracas.
                      </p>
                    </div>
                  )}

                  {/* DOCUMENT VIEW 3: Recibo Fiduciario Escrow */}
                  {docTab === 'recibo' && (
                    <div className="space-y-5 font-serif text-xs text-[#1B1813] leading-relaxed">
                      <div className="text-center py-2 border-y border-[#C9C4B5]">
                        <span className="font-meta text-[10px] text-[#8C7452] tracking-widest uppercase font-semibold">
                          COMPROBANTE DE CUSTODIA FIDUCIARIA EN ESCROW
                        </span>
                      </div>

                      <p>
                        Se hace constar la asignación de custodia fiduciaria para la reserva de la unidad <strong>{selectedUnit.name}</strong> a favor del fideicomitente <strong>{buyerName}</strong>.
                      </p>

                      <div className="bg-[#FAF9F6] border border-[#1B1813] p-4 my-3">
                        <table className="w-full text-left font-serif text-xs">
                          <tbody className="divide-y divide-[#C9C4B5]">
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Entidad Depositaria Fiduciaria:</td>
                              <td className="py-1.5 font-semibold text-right">Banco Fiduciario / Escrow Agent</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Cuenta Fiduciaria N°:</td>
                              <td className="py-1.5 font-mono text-right">0102-0892-44-0001892341</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-[#8C8678]">Titular de la Cuenta:</td>
                              <td className="py-1.5 text-right">Fideicomiso Residencias Caroní Altamira</td>
                            </tr>
                            <tr className="border-t-2 border-[#1B1813] font-bold text-sm">
                              <td className="pt-2 text-[#1B1813]">MONTO EN CUSTODIA DE RESERVA:</td>
                              <td className="pt-2 font-mono text-right text-[#8C7452]">USD {reserveDepositUsd.toLocaleString('es-VE')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <p className="text-[11px] text-[#8C8678] italic">
                        Los fondos depositados son inembargables y están legalmente afectados con exclusividad a la ejecución material de la obra según el contrato de fideicomiso matriz.
                      </p>
                    </div>
                  )}
                </div>

                {/* Formal Signature Area */}
                <div className="relative z-10 pt-8 border-t border-[#1B1813] mt-8 grid grid-cols-2 gap-8 text-center font-serif text-xs">
                  <div className="space-y-1">
                    <div className="border-b border-[#1B1813] pb-6 mb-2">
                      <span className="font-meta text-[8px] text-[#8C8678] uppercase">POR LA PROMOTORA / ARQUITECTURA</span>
                    </div>
                    <div className="font-bold text-[#1B1813]">Arq. Juan Carlos Láncara</div>
                    <div className="text-[10px] text-[#8C8678]">Añil Arquitectura · CIV N° 108.492</div>
                  </div>

                  <div className="space-y-1">
                    <div className="border-b border-[#1B1813] pb-6 mb-2">
                      <span className="font-meta text-[8px] text-[#8C8678] uppercase">POR EL COMPRADOR / INVERSIONISTA</span>
                    </div>
                    <div className="font-bold text-[#1B1813]">{buyerRep}</div>
                    <div className="text-[10px] text-[#8C8678]">{buyerName}</div>
                  </div>
                </div>

                {/* Footer Document Metadata */}
                <div className="relative z-10 pt-4 border-t border-[#C9C4B5] mt-4 flex justify-between items-center text-[8.5px] font-meta text-[#8C8678]">
                  <span>RESIDENCIAS CARONÍ · ACUERDO DE RESERVA Y COMPRA</span>
                  <span>ALTAMIRA · CARACAS · MMXXVIII</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
