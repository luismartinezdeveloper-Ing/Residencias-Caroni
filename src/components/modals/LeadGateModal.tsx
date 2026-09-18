import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, ShieldCheck, X, Sparkles, CheckCircle2, Building, Send, KeyRound, ExternalLink, Settings, Smartphone, Mail, User } from 'lucide-react';
import { useConfidentiality } from '../../context/ConfidentialityContext';
import { submitLeadToGoogleSheets } from '../../services/leadService';
import { CaroniIsotype } from '../ui/ArchitecturalDrawings';
import { BRAND_INFO, UNITS_DATA } from '../../data/brandData';

import { validateFullName, validateEmailAddress, validatePhoneNumber } from '../../utils/leadValidation';

interface LeadGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  title?: string;
  subtitle?: string;
  sourceTrigger?: string;
}

const COUNTRY_CODES = [
  { code: '+58', country: 'VE', flag: '🇻🇪', label: 'Venezuela (+58)' },
  { code: '+1', country: 'US', flag: '🇺🇸', label: 'USA / Canadá (+1)' },
  { code: '+34', country: 'ES', flag: '🇪🇸', label: 'España (+34)' },
  { code: '+57', country: 'CO', flag: '🇨🇴', label: 'Colombia (+57)' },
  { code: '+507', country: 'PA', flag: '🇵🇦', label: 'Panamá (+507)' },
  { code: '+52', country: 'MX', flag: '🇲🇽', label: 'México (+52)' },
  { code: '+54', country: 'AR', flag: '🇦🇷', label: 'Argentina (+54)' },
  { code: '+41', country: 'CH', flag: '🇨🇭', label: 'Suiza (+41)' },
  { code: '+44', country: 'GB', flag: '🇬🇧', label: 'UK (+44)' },
  { code: '+351', country: 'PT', flag: '🇵🇹', label: 'Portugal (+351)' },
];

export const LeadGateModal: React.FC<LeadGateModalProps> = ({
  isOpen,
  onClose,
  onUnlocked,
  title = 'Desbloquear Visor 3D y Precios de Preventa',
  subtitle = 'Complete el formulario para acceder de forma inmediata al modelo tridimensional interactivo, la lista de precios oficial por m² y el dossier técnico de Residencias Caroní.',
  sourceTrigger = 'Hero Funnel',
}) => {
  const { unlockWithLead, authenticate } = useConfidentiality();

  // Mode: 'register' | 'code' | 'settings'
  const [activeTab, setActiveTab] = useState<'register' | 'code' | 'settings'>('register');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+58');
  const [phone, setPhone] = useState('');
  const [interestType, setInterestType] = useState<'inversion' | 'vivienda' | 'family_office' | 'otro'>('inversion');
  const [preferredUnit, setPreferredUnit] = useState<string>('Todas / Por Definir');
  const [vipCode, setVipCode] = useState('');

  // Honeypot anti-bot (invisible para humanos)
  const [botHoneypot, setBotHoneypot] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Detección silenciosa de robots (Honeypot Trap)
    if (botHoneypot.trim()) {
      // Simular éxito sin almacenar spam ni gastar cuota de red
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          onUnlocked();
        }, 800);
      }, 500);
      return;
    }

    // 2. Validación de Nombre Completo
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      setErrorMsg(nameValidation.error || 'Por favor ingrese su nombre y apellido.');
      return;
    }

    // 3. Validación de Email y Bloqueo de Correos Desechables
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || 'Por favor ingrese una dirección de correo válida.');
      return;
    }

    // 4. Validación Estricta de Teléfono y Prefijos por País
    const phoneValidation = validatePhoneNumber(phone, countryCode);
    if (!phoneValidation.isValid) {
      setErrorMsg(phoneValidation.error || 'Por favor ingrese un número de teléfono de contacto válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedPhone = phoneValidation.sanitizedValue || phone.trim();
      const result = await submitLeadToGoogleSheets({
        fullName: nameValidation.sanitizedValue || fullName.trim(),
        email: emailValidation.sanitizedValue || email.trim().toLowerCase(),
        phone: sanitizedPhone,
        countryCode,
        interestType,
        preferredUnit,
        source: sourceTrigger,
      });

      unlockWithLead(result.lead);
      setIsSuccess(true);

      // Smooth delay so the user feels the luxury unlock experience
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
        onUnlocked();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ocurrió un inconveniente al registrar sus datos. Intente nuevamente.');
      setIsSubmitting(false);
    }
  };

  const handleVipCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!vipCode.trim()) {
      setErrorMsg('Ingrese un código de invitación válido.');
      return;
    }

    const ok = await authenticate(fullName || 'Inversor Acreditado', vipCode.trim());
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        onUnlocked();
      }, 700);
    } else {
      setErrorMsg('Código no reconocido. Puede registrar sus datos en la pestaña principal para solicitar acceso.');
    }
  };

  const handleQuickDemo = () => {
    const demoLead = {
      fullName: fullName.trim() || 'Comité de Inversión',
      email: email.trim() || 'presidencia@patrimonio.com',
      phone: '4140000000',
      countryCode: '+58',
      interestType: 'inversion' as const,
      preferredUnit: 'Residencia 03 Norte',
      source: 'Pase Rápido Demo',
    };
    submitLeadToGoogleSheets(demoLead).then((res) => {
      unlockWithLead(res.lead);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        onUnlocked();
      }, 500);
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-[#0A0908]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-[#14120E] text-[#EFEBE0] border border-[#8C7452]/40 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden max-h-[94vh] flex flex-col"
        >
          {/* Subtle Golden Ambient Glow Top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#8C7452] to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#8C8678] hover:text-[#EFEBE0] hover:bg-[#FAF9F6]/10 rounded-full transition-colors cursor-pointer z-20"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-[#FAF9F6]/10 bg-gradient-to-b from-[#1C1813] to-[#14120E] relative">
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8C7452]/20 border border-[#8C7452]/40 flex items-center justify-center">
                <CaroniIsotype size={18} color="#8C7452" />
              </div>
              <span className="font-meta text-[10px] tracking-[0.24em] text-[#8C7452] uppercase font-semibold">
                ACCESO EXCLUSIVO · LEAD GATE
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl text-[#EFEBE0] tracking-tight leading-tight">
              {title}
            </h3>

            <p className="font-serif italic text-xs sm:text-[13px] text-[#A6A092] mt-1.5 leading-relaxed">
              {subtitle}
            </p>

            {/* Switch Tabs (Registro vs Código VIP vs Google Sheets Config) */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#FAF9F6]/10 text-[10px] font-meta">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-[#8C7452] text-[#14120E] font-bold'
                      : 'text-[#8C8678] hover:text-[#EFEBE0]'
                  }`}
                >
                  Formulario Rápido
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('code'); setErrorMsg(null); }}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center space-x-1 ${
                    activeTab === 'code'
                      ? 'bg-[#8C7452] text-[#14120E] font-bold'
                      : 'text-[#8C8678] hover:text-[#EFEBE0]'
                  }`}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Código de Invitación</span>
                </button>
              </div>

              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'settings' ? 'register' : 'settings')}
                  title="Configuración de Integración (Solo DEV)"
                  className="text-[#8C8678] hover:text-[#8C7452] p-1 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Modal Body with Scroll */}
          <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-5">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#8C7452]/20 border border-[#8C7452] text-[#8C7452] flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-display text-2xl text-[#EFEBE0]">
                  ¡Acceso Desbloqueado Exitosamente!
                </h4>
                <p className="font-serif italic text-sm text-[#A6A092] max-w-md mx-auto">
                  Sus datos han sido guardados y sincronizados con Google Sheets. Inicializando el visor 3D interactivo con la lista de precios completa...
                </p>
                <div className="flex justify-center items-center space-x-2 text-[#8C7452] font-meta text-[11px] uppercase tracking-widest pt-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Cargando escena y cotizaciones...</span>
                </div>
              </motion.div>
            ) : activeTab === 'settings' ? (
              /* System Architecture Status Drawer (DEV only) */
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#8C7452] font-meta text-xs uppercase tracking-wider">
                  <Settings className="w-4 h-4" />
                  <span>Arquitectura de Captura & Sincronización</span>
                </div>
                <p className="text-xs text-[#A6A092] leading-relaxed font-sans">
                  Los prospectos se despachan a través del backend orquestador institucional (/api/leads) con buffer circular en memoria y cola Outbox local resiliente.
                </p>

                <div className="bg-[#1C1813] p-3.5 rounded-xl border border-[#FAF9F6]/10 text-[11px] text-[#8C8678] space-y-1.5 font-mono">
                  <div className="text-[#8C7452] font-bold">Estado de Orquestación:</div>
                  <div>• Backend: Express /api/leads (Activo)</div>
                  <div>• Google Sheets: Despacho seguro Server-Side</div>
                  <div>• Resiliencia: Patrón Outbox con auto-sincronización</div>
                  <div>• Memoria: Buffer circular LRU (500 registros)</div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="w-full bg-[#8C7452] text-[#14120E] font-meta font-bold text-xs py-2.5 rounded-full hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    Volver al Formulario
                  </button>
                </div>
              </div>
            ) : activeTab === 'code' ? (
              /* Invitation Code Tab */
              <form onSubmit={handleVipCodeSubmit} className="space-y-4">
                <div>
                  <label className="block font-meta text-[10px] uppercase tracking-wider text-[#A6A092] mb-1">
                    Código de Invitación VIP o Acceso Directo
                  </label>
                  <input
                    type="text"
                    value={vipCode}
                    onChange={(e) => setVipCode(e.target.value)}
                    placeholder="Ej. ANIL-2026, CARONI-VIII, LANCARA"
                    className="w-full bg-[#1C1813] border border-[#FAF9F6]/15 rounded-xl px-4 py-3 text-sm text-[#EFEBE0] font-mono uppercase tracking-widest focus:outline-hidden focus:border-[#8C7452] transition-colors"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#E57373] bg-[#E57373]/10 border-l-2 border-[#E57373] p-2.5 rounded-r">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#8C7452] text-[#14120E] hover:bg-[#FAF9F6] transition-all font-meta font-bold text-xs py-3 px-6 rounded-full flex items-center justify-center space-x-2 cursor-pointer shadow-lg active:scale-98"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Validar Código y Desbloquear</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="bg-[#1C1813] border border-[#FAF9F6]/20 text-[#A6A092] hover:text-[#EFEBE0] hover:border-[#8C7452] text-[10.5px] font-meta py-3 px-4 rounded-full transition-colors cursor-pointer"
                  >
                    Pase Demo Rápido
                  </button>
                </div>
              </form>
            ) : (
              /* Main Lead Registration Form (High Conversion) */
              <form onSubmit={handleSubmitLead} className="space-y-4">
                {/* Honeypot Trap (Anti-Bot: invisible para humanos) */}
                <div className="opacity-0 pointer-events-none absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="company_website">Website</label>
                  <input
                    id="company_website"
                    type="text"
                    name="company_website"
                    value={botHoneypot}
                    onChange={(e) => setBotHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block font-meta text-[10px] uppercase tracking-wider text-[#C9C4B5] mb-1.5 flex items-center space-x-1.5">
                    <User className="w-3 h-3 text-[#8C7452]" />
                    <span>Nombre y Apellido *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Dr. Carlos Mendoza Arria"
                    className="w-full bg-[#1C1813] border border-[#FAF9F6]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#EFEBE0] focus:outline-hidden focus:border-[#8C7452] transition-colors placeholder:text-[#8C8678]/60"
                  />
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block font-meta text-[10px] uppercase tracking-wider text-[#C9C4B5] mb-1.5 flex items-center space-x-1.5">
                      <Mail className="w-3 h-3 text-[#8C7452]" />
                      <span>Email Corporativo / Personal *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@empresa.com"
                      className="w-full bg-[#1C1813] border border-[#FAF9F6]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#EFEBE0] focus:outline-hidden focus:border-[#8C7452] transition-colors placeholder:text-[#8C8678]/60"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block font-meta text-[10px] uppercase tracking-wider text-[#C9C4B5] mb-1.5 flex items-center space-x-1.5">
                      <Smartphone className="w-3 h-3 text-[#8C7452]" />
                      <span>WhatsApp / Teléfono *</span>
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-[#1C1813] border border-[#FAF9F6]/15 rounded-xl px-2 py-2.5 text-xs text-[#EFEBE0] focus:outline-hidden focus:border-[#8C7452] cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.country} value={c.code} className="bg-[#14120E] text-[#EFEBE0]">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="414 123 4567"
                        className="flex-1 bg-[#1C1813] border border-[#FAF9F6]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#EFEBE0] focus:outline-hidden focus:border-[#8C7452] transition-colors placeholder:text-[#8C8678]/60"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile / Interest Type */}
                <div>
                  <label className="block font-meta text-[10px] uppercase tracking-wider text-[#C9C4B5] mb-1.5">
                    Perfil de Interés
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'inversion', label: '🏛️ Inversión', desc: 'Patrimonio & Renta' },
                      { id: 'vivienda', label: '🏡 Vivienda', desc: 'Residencia Propia' },
                      { id: 'family_office', label: '💼 Family Office', desc: 'Fondo o Grupo' },
                    ].map((p) => {
                      const isActive = interestType === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setInterestType(p.id as any)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#8C7452]/20 border-[#8C7452] text-[#EFEBE0]'
                              : 'bg-[#1C1813] border-[#FAF9F6]/10 text-[#8C8678] hover:border-[#FAF9F6]/30'
                          }`}
                        >
                          <div className="font-meta text-[10px] font-semibold">{p.label}</div>
                          <div className="text-[8.5px] text-[#A6A092] truncate">{p.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Typology */}
                <div>
                  <label className="block font-meta text-[10px] uppercase tracking-wider text-[#C9C4B5] mb-1.5">
                    Tipología de Preferencia (Opcional)
                  </label>
                  <select
                    value={preferredUnit}
                    onChange={(e) => setPreferredUnit(e.target.value)}
                    className="w-full bg-[#1C1813] border border-[#FAF9F6]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#EFEBE0] focus:outline-hidden focus:border-[#8C7452] cursor-pointer"
                  >
                    <option value="Todas / Por Definir">Todas las residencias (Deseo evaluar el portafolio completo)</option>
                    <option value="Jardines PB (930 - 1.030 m²)">Jardines PB — Dúplex con jardín privado (930 - 1.030 m²)</option>
                    <option value="Plantas Tipo P2 / P3 (415 m²)">Residencias Tipo P2 / P3 — Frente al Ávila (415 m²)</option>
                    <option value="Miradores P4 (780 - 810 m²)">Miradores P4 — Terrazas panorámicas y piscina (780 - 810 m²)</option>
                  </select>
                </div>

                {/* Error Box */}
                {errorMsg && (
                  <p className="text-xs text-[#E57373] bg-[#E57373]/10 border-l-2 border-[#E57373] p-2.5 rounded-r">
                    {errorMsg}
                  </p>
                )}

                {/* Submit CTA */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#8C7452] hover:bg-[#A38760] text-[#14120E] font-meta font-bold text-xs sm:text-[13px] py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(140,116,82,0.35)] cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-[#14120E]" />
                        <span>Sincronizando con Google Sheets & Desbloqueando...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 text-[#14120E]" />
                        <span>DESBLOQUEAR VISOR 3D Y PRECIOS AHORA</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[10px] font-meta text-[#8C8678] pt-1">
                    <span className="flex items-center space-x-1">
                       <ShieldCheck className="w-3.5 h-3.5 text-[#8C7452]" />
                       <span>Privacidad estricta · Sin intermediarios</span>
                    </span>
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        onClick={handleQuickDemo}
                        className="text-[#8C7452] hover:underline cursor-pointer font-mono"
                        title="Solo visible en entorno de desarrollo"
                      >
                        [DEV] Pase rápido demo
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="bg-[#0E0C0A] px-6 py-3 border-t border-[#FAF9F6]/10 flex flex-col sm:flex-row items-center justify-between text-[9px] font-meta text-[#8C8678] gap-1">
            <span>Añil Arquitectura · Fideicomiso Residencias Caroní MMXXVIII</span>
            <span className="text-[#8C7452]">Google Sheets Sync Activo</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
