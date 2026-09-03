import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Phone, Mail, MapPin, MessageSquare, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { BRAND_INFO } from '../../data/brandData';
import { CaroniIsotype, CaroniSeal } from '../ui/ArchitecturalDrawings';
import { useConfidentiality } from '../../context/ConfidentialityContext';

interface PrivateAdvisoryCTAProps {
  onOpenAdvisoryModal: () => void;
}

export const PrivateAdvisoryCTA: React.FC<PrivateAdvisoryCTAProps> = ({ onOpenAdvisoryModal }) => {
  const { isAccredited } = useConfidentiality();

  return (
    <section id="contacto" className="w-full bg-[#1B1813] text-[#EFEBE0] py-16 sm:py-20 border-t border-[#8C7452]/40 relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#FAF9F6 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Brand Message & Exclusivity Statement */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-[#8C7452] animate-pulse"></span>
              <span className="font-meta text-[10px] sm:text-[11px] tracking-[0.25em] text-[#8C7452] uppercase font-semibold">
                ATENCIÓN INSTITUCIONAL & PRIVADA
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#FAF9F6] font-normal leading-[1.15] tracking-tight">
              Inicie su proceso de adquisición o agende una presentación privada.
            </h2>

            <p className="font-sans text-xs sm:text-sm text-[#C9C4B5] leading-relaxed max-w-2xl font-light">
              La comercialización de las 8 residencias de <strong className="text-white font-medium">Residencias Caroní</strong> se gestiona de manera personalizada y directa por la dirección de <strong className="text-white font-medium">Añil Arquitectura</strong>. Le invitamos a coordinar una sesión privada para conocer la disponibilidad, planos y cronograma de entrega.
            </p>

            {/* Quick Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#FAF9F6]/5 border border-[#FAF9F6]/10 p-3 rounded-xl flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-[#8C7452] shrink-0" />
                <span className="font-meta text-[10px] text-[#C9C4B5] tracking-wider uppercase">
                  8 Residencias Exclusivas
                </span>
              </div>
              <div className="bg-[#FAF9F6]/5 border border-[#FAF9F6]/10 p-3 rounded-xl flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-[#8C7452] shrink-0" />
                <span className="font-meta text-[10px] text-[#C9C4B5] tracking-wider uppercase">
                  Altamira, Caracas
                </span>
              </div>
              <div className="bg-[#FAF9F6]/5 border border-[#FAF9F6]/10 p-3 rounded-xl flex items-center space-x-3">
                <Clock className="w-4 h-4 text-[#8C7452] shrink-0" />
                <span className="font-meta text-[10px] text-[#C9C4B5] tracking-wider uppercase">
                  Entrega {BRAND_INFO.delivery}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Advisory Action Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#24201A] border border-[#8C7452]/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-4">
                <div className="space-y-0.5">
                  <div className="font-display text-lg text-[#FAF9F6]">Dirección de Arquitectura</div>
                  <div className="font-meta text-[9px] text-[#8C8678] tracking-widest uppercase">
                    Añil Arquitectura · Altamira
                  </div>
                </div>
                <CaroniIsotype size={28} color="#8C7452" />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onOpenAdvisoryModal}
                  className="w-full bg-[#8C7452] hover:bg-[#A38965] text-[#1B1813] hover:text-[#1B1813] font-meta text-[11px] uppercase tracking-widest py-3.5 px-5 rounded-full font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Cita Privada</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href="https://wa.me/?text=Hola%2C%20quisiera%20solicitar%20informaci%C3%B3n%20privada%20y%20disponibilidad%20sobre%20Residencias%20Caron%C3%AD%20en%20Altamira."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white/5 hover:bg-white/10 text-[#FAF9F6] border border-white/10 hover:border-[#8C7452]/50 font-meta text-[10.5px] uppercase tracking-wider py-3 px-4 rounded-full transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#8C7452]" />
                  <span>Contacto Directo vía WhatsApp</span>
                </a>
              </div>

              {/* Direct Institutional Information */}
              <div className="pt-4 border-t border-[#FAF9F6]/10 space-y-2 text-[11px] font-sans text-[#8C8678]">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8C7452] shrink-0 mt-0.5" />
                  <span className="text-[#C9C4B5]">{BRAND_INFO.location}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-3.5 h-3.5 text-[#8C7452] shrink-0" />
                  <span className="text-[#C9C4B5]">contacto@anil-arquitectura.com</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="font-meta text-[8.5px] text-[#8C8678] tracking-[0.2em] uppercase">
                  Atención confidencial de lunes a sábado previa cita
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
