import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, FileText, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { useConfidentiality } from '../../context/ConfidentialityContext';

export const ConfidentialityModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authenticate } = useConfidentiality();
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor indique su nombre o el titular para la atención privada.');
      return;
    }

    const success = authenticate(name, code, org);
    if (success) {
      setSuccessMode(true);
      setTimeout(() => {
        setSuccessMode(false);
      }, 1000);
    } else {
      setError('Código no reconocido. Pruebe con "ANIL-2026", "CARONI-VIII" o ingrese su nombre para registrar su solicitud.');
    }
  };

  const handleQuickUnlock = () => {
    authenticate('Comité de Inversión Institucional', 'ANIL-2026', 'Añil Arquitectura');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1B1813]/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#C9C4B5] shadow-2xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-[#8C8678] hover:text-[#1B1813] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-6 border-b border-[#C9C4B5] pb-4">
            <div className="w-9 h-9 bg-[#1B1813] text-[#EFEBE0] flex items-center justify-center">
              <Building className="w-4 h-4 text-[#8C7452]" />
            </div>
            <div>
              <span className="font-meta text-[10px] tracking-widest text-[#8C7452] uppercase block">
                Atención Privada & Exclusiva
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-[#1B1813] font-normal">
                .Solicitud de Información & Cita Privada
              </h3>
            </div>
          </div>

          {successMode ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#8C7452]/20 text-[#8C7452] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-serif text-lg text-[#1B1813]">Acceso concedido exitosamente</p>
              <p className="font-meta text-xs text-[#8C8678]">
                Cargando el generador de Carta de Intención de Reserva y presentación técnica...
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-[13px] text-[#8C8678] font-sans leading-relaxed mb-6">
                Para coordinar una reunión privada con la dirección de <strong className="text-[#1B1813]">Añil Arquitectura</strong> o conocer las residencias disponibles, ingrese sus datos de contacto o su código de invitación privada.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-meta text-[10.5px] uppercase tracking-wider text-[#1B1813] mb-1">
                    Nombre del Titular o Representante *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Familia Rodríguez / Dr. Carlos Mendoza"
                    className="w-full bg-[#FFFFFF] border border-[#C9C4B5] px-3.5 py-2.5 text-xs text-[#1B1813] focus:outline-hidden focus:border-[#8C7452] transition-colors rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-meta text-[10.5px] uppercase tracking-wider text-[#1B1813] mb-1">
                    Empresa o Razón Social (Opcional)
                  </label>
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Ej. Inversiones Altamira C.A."
                    className="w-full bg-[#FFFFFF] border border-[#C9C4B5] px-3.5 py-2.5 text-xs text-[#1B1813] focus:outline-hidden focus:border-[#8C7452] transition-colors rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-meta text-[10.5px] uppercase tracking-wider text-[#1B1813]">
                      Código de Invitación Privada
                    </label>
                    <span className="font-meta text-[9.5px] text-[#8C7452]">
                      (Opcional)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej. ANIL-2026 o CARONI-VIII"
                    className="w-full bg-[#FFFFFF] border border-[#C9C4B5] px-3.5 py-2.5 text-xs font-mono tracking-wider text-[#1B1813] uppercase focus:outline-hidden focus:border-[#8C7452] transition-colors rounded-lg"
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-[#8C7452] font-meta bg-[#EFEBE0] p-2.5 border-l-2 border-[#8C7452]">
                    {error}
                  </p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    className="flex-1 bg-[#1B1813] text-[#EFEBE0] hover:bg-[#8C7452] transition-colors py-2.5 px-4 font-meta text-[11px] uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer shadow-xs rounded-full"
                  >
                    <span>Ver Información y Precios Privados</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickUnlock}
                    className="bg-[#EFEBE0] text-[#1B1813] border border-[#C9C4B5] hover:border-[#8C7452] transition-colors py-2.5 px-3 font-meta text-[10px] uppercase tracking-wider cursor-pointer"
                    title="Acceso directo de demostración para comité"
                  >
                    Pase de Demostración
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-[#C9C4B5]/60 flex items-center justify-between text-[10.5px] font-meta text-[#8C8678]">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8C7452]" />
                  <span>Confidencialidad y Atención Personalizada</span>
                </span>
                <span>Altamira · Caracas</span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
