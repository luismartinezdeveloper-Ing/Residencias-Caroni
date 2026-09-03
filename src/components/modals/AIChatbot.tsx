import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Radio,
  MessageSquare,
  Volume2,
  VolumeX,
  Headphones,
  Settings2,
  User,
  Bot,
  Minus,
  Maximize2,
  ChevronUp,
} from 'lucide-react';
import { UnitData } from '../../types/brand';
import { LiveAudioClient } from '../../utils/liveAudioClient';
import { useResponsiveChat } from '../../hooks/useResponsiveChat';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnit: UnitData;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type Mode = 'live' | 'text';
type VoiceProfile = 'Aoede' | 'Zephyr' | 'Kore' | 'Fenrir' | 'Puck';

const VOICE_OPTIONS: { id: VoiceProfile; label: string; desc: string; tone: string }[] = [
  { id: 'Aoede', label: 'Aoede', desc: 'Femenina · Cálida & Sofisticada', tone: 'Recomendada' },
  { id: 'Zephyr', label: 'Zephyr', desc: 'Masculino · Distinguido & Sobrio', tone: 'Clásica' },
  { id: 'Kore', label: 'Kore', desc: 'Femenina · Serena & Precisa', tone: 'Ejecutiva' },
  { id: 'Fenrir', label: 'Fenrir', desc: 'Masculino · Firme & Profundo', tone: 'Autoridad' },
  { id: 'Puck', label: 'Puck', desc: 'Masculino · Dinámico & Cercano', tone: 'Casual' },
];

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose, selectedUnit }) => {
  const { isMobile, isTablet, isLandscape, isShortScreen, keyboardOpen } = useResponsiveChat();

  // Mode selection: 'live' for real-time voice, 'text' for classic chat
  const [activeMode, setActiveMode] = useState<Mode>('live');
  const [isMinimized, setIsMinimized] = useState(false);

  // Live Voice State
  const [liveStatus, setLiveStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'
  >('disconnected');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioSource, setAudioSource] = useState<'user' | 'ai'>('user');
  const [userLiveTranscript, setUserLiveTranscript] = useState('');
  const [modelLiveTranscript, setModelLiveTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>('Aoede');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Text Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);

  const liveClientRef = useRef<LiveAudioClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Format unit context for the AI
  const getUnitContext = () => {
    return `
      Residencias Caroní · Altamira, Caracas
      Unidad: ${selectedUnit.name}
      Nivel: ${selectedUnit.level}
      Tipo: ${selectedUnit.typology}
      Área Total: ${selectedUnit.totalArea} m²
      Área Interior: ${selectedUnit.interiorArea} m²
      Terraza: ${selectedUnit.terraceArea} m²
      Habitaciones: ${selectedUnit.rooms} (todas en suite)
      Puestos de Estacionamiento: ${selectedUnit.parkingSpots}
      Maleteros: ${selectedUnit.storageUnits}
      Precio Referencial: USD ${(
        selectedUnit.totalArea *
        (selectedUnit.typology === 'Mirador'
          ? 3600
          : selectedUnit.typology === 'Jardín'
          ? 2950
          : 3300)
      ).toLocaleString('en-US')}
      Distribución: ${selectedUnit.roomList.join(', ')}
      Atributo Distintivo: "${selectedUnit.distinctiveAttribute}"
    `;
  };

  // Initialize Live Audio Client instance
  useEffect(() => {
    const client = new LiveAudioClient({
      onStatusChange: (status) => {
        setLiveStatus(status);
        if (status === 'connected') {
          setErrorMessage(null);
        }
      },
      onUserTranscription: (text) => {
        setUserLiveTranscript((prev) => (prev ? `${prev} ${text}` : text));
      },
      onModelTranscription: (text) => {
        setModelLiveTranscript((prev) => (prev ? `${prev} ${text}` : text));
      },
      onAudioLevel: (level, source) => {
        setAudioLevel(level);
        setAudioSource(source);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
    });

    liveClientRef.current = client;

    return () => {
      client.disconnect();
      liveClientRef.current = null;
    };
  }, []);

  // Handle modal close / open
  useEffect(() => {
    if (!isOpen) {
      if (liveClientRef.current) {
        liveClientRef.current.disconnect();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setLiveStatus('disconnected');
      setUserLiveTranscript('');
      setModelLiveTranscript('');
      setErrorMessage(null);
      setIsMinimized(false);
    } else {
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Initial welcome message for text mode
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `¡Bienvenido! Soy tu Asesor IA de Residencias Caroní. Estoy analizando la ${selectedUnit.name} (${selectedUnit.totalArea} m² en ${selectedUnit.level}). ¿Deseas consultar sobre el precio, acabados, vistas o planes de pago?`,
        },
      ]);
    }
  }, [isOpen, selectedUnit, messages.length]);

  // Scroll chat messages
  useEffect(() => {
    if (activeMode === 'text') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeMode]);

  // Start Live Voice Call
  const handleStartLiveCall = async () => {
    setErrorMessage(null);
    setUserLiveTranscript('');
    setModelLiveTranscript('');
    if (liveClientRef.current) {
      await liveClientRef.current.connect(getUnitContext(), selectedVoice);
    }
  };

  // End Live Voice Call
  const handleEndLiveCall = () => {
    if (liveClientRef.current) {
      liveClientRef.current.disconnect();
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (liveClientRef.current) {
      const muted = liveClientRef.current.toggleMute();
      setIsMicMuted(muted);
    }
  };

  // Send Text Message
  const handleSendTextMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoadingText) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoadingText(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newMessages,
          context: getUnitContext(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Error al conectar con el servidor.');
      }
      if (!response.body) throw new Error('No stream available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      let done = false;
      let fullText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  fullText += data.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + data.text }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // ignore parse chunk error
              }
            }
          }
        }
      }

      if (isTtsEnabled && fullText.trim() && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fullText.trim());
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const friendlyMsg = err?.message && !err.message.includes('object') 
        ? err.message 
        : 'Disculpa, no pude procesar la consulta en este instante. Intenta nuevamente.';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: friendlyMsg,
        },
      ]);
    } finally {
      setIsLoadingText(false);
    }
  };

  const isLiveActive =
    liveStatus === 'connected' || liveStatus === 'speaking' || liveStatus === 'listening';

  return (
    <AnimatePresence>
      {isOpen && (
        isMinimized ? (
          /* Minimized Compact Floating Capsule */
          <motion.div
            key="minimized-advisor-pill"
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-[999999] pointer-events-auto bg-[#1B1813] text-[#FAF9F6] border border-[#8C7452]/70 shadow-[0_10px_35px_rgba(0,0,0,0.7)] rounded-2xl p-2 sm:px-3.5 sm:py-2 flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 transition-all ${
              isMobile
                ? 'bottom-[max(env(safe-area-inset-bottom),0.75rem)] inset-x-3'
                : 'bottom-4 right-4'
            }`}
          >
            <div
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity min-w-0"
              title="Expandir Asesor IA"
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#8C7452] flex items-center justify-center shadow-inner">
                  {isLiveActive ? (
                    <Radio className="w-3.5 h-3.5 text-[#FAF9F6] animate-pulse" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#FAF9F6]" />
                  )}
                </div>
                {isLiveActive && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-semibold text-xs text-[#EFEBE0]">
                    Asesor IA
                  </span>
                  {isLiveActive ? (
                    <span className="font-mono text-[8px] bg-rose-500/30 text-rose-300 border border-rose-500/50 px-1.5 py-0.5 rounded text-center font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      REC · EN LLAMADA
                    </span>
                  ) : (
                    <span className="font-mono text-[8px] bg-[#8C7452]/40 text-[#EFEBE0] px-1.5 py-0.5 rounded text-center font-bold">
                      {activeMode === 'live' ? 'MODO VOZ' : 'MODO CHAT'}
                    </span>
                  )}
                </div>
                <span className="font-meta text-[8.5px] text-[#A6A092] tracking-wider uppercase truncate max-w-[130px] sm:max-w-[180px]">
                  {selectedUnit.name} · Tocar para abrir
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-[#FAF9F6]/20 shrink-0">
              {isLiveActive && (
                <button
                  onClick={handleEndLiveCall}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-lg font-meta text-[9px] uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Finalizar Llamada"
                  aria-label="Finalizar Llamada"
                >
                  <PhoneOff className="w-3 h-3" />
                  <span className="hidden sm:inline">Colgar</span>
                </button>
              )}
              <button
                onClick={() => setIsMinimized(false)}
                className="bg-white/10 text-[#EFEBE0] hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Maximizar Asesor"
                aria-label="Maximizar Asesor"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Cerrar Asesor"
                aria-label="Cerrar Asesor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Full Expanded Chat / Voice Window - Always fully visible and responsive */
          <motion.div
            key="expanded-advisor-modal"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`fixed z-[999999] pointer-events-auto flex flex-col bg-[#FAF9F6] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all ${
              isMobile
                ? 'inset-0 w-full h-[100dvh] max-h-[100dvh] rounded-none border-none'
                : 'bottom-4 right-4 w-[420px] max-w-[calc(100vw-32px)] h-[min(540px,calc(100dvh-32px))] max-h-[90dvh] border-2 border-[#8C7452] rounded-3xl'
            }`}
          >
            {/* Institutional Top Header - Sticky so controls never leave viewport */}
            <div
              className={`bg-[#1B1813] text-[#FAF9F6] px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between shrink-0 border-b border-[#8C7452]/40 shadow-md sticky top-0 z-30 ${
                isMobile ? 'pt-[max(env(safe-area-inset-top),0.75rem)]' : ''
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8C7452] flex items-center justify-center shadow-inner">
                    {isLiveActive ? (
                      <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FAF9F6] animate-pulse" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FAF9F6]" />
                    )}
                  </div>
                  {isLiveActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-semibold text-xs sm:text-sm tracking-wide text-[#EFEBE0] truncate">
                      Asesor IA · Añil
                    </h3>
                    {isLiveActive && (
                      <span className="hidden sm:flex items-center gap-1 font-mono text-[8px] bg-rose-500/30 text-rose-300 border border-rose-500/50 px-1.5 py-0.2 rounded font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        REC
                      </span>
                    )}
                  </div>
                  <p className="font-meta text-[8px] sm:text-[9px] text-[#C9C4B5] tracking-wider uppercase opacity-90 truncate max-w-[100px] sm:max-w-[140px]">
                    {selectedUnit.name} · {selectedUnit.level}
                  </p>
                </div>
              </div>

              {/* Header Right Actions: Mode Tabs + Minimize + Close */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* Mode Switcher Tabs */}
                <div className="flex items-center bg-[#2A241C] p-0.5 rounded-xl border border-[#8C7452]/50">
                  <button
                    onClick={() => {
                      setActiveMode('live');
                      setShowVoiceSettings(false);
                    }}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg font-meta text-[8.5px] sm:text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      activeMode === 'live'
                        ? 'bg-[#8C7452] text-white shadow-sm font-bold'
                        : 'text-[#C9C4B5] hover:text-white'
                    }`}
                    title="Modo Voz en Tiempo Real"
                  >
                    <Headphones className="w-3 h-3" />
                    <span>Voz</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMode('text');
                      setShowVoiceSettings(false);
                    }}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg font-meta text-[8.5px] sm:text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      activeMode === 'text'
                        ? 'bg-[#8C7452] text-white shadow-sm font-bold'
                        : 'text-[#C9C4B5] hover:text-white'
                    }`}
                    title="Modo Chat de Texto"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </button>
                </div>

                {/* Minimize Button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="bg-white/10 hover:bg-white/20 text-[#FAF9F6] min-w-[32px] min-h-[32px] p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  title="Minimizar Asesor"
                  aria-label="Minimizar Asesor"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* High-Visibility Close Button */}
                <button
                  onClick={onClose}
                  className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white min-w-[34px] min-h-[34px] sm:min-w-[32px] sm:min-h-[32px] p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer shadow-md flex items-center justify-center"
                  title="Cerrar Asesor"
                  aria-label="Cerrar Asesor"
                >
                  <X className="w-4 h-4 font-bold" />
                </button>
              </div>
            </div>

            {/* ===================== MODE 1: LIVE VOICE (Gemini Live API) ===================== */}
            {activeMode === 'live' && (
              <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#F4F1EA] to-[#EBE6DC]">
                {/* Top Status Bar with Visual Recording Indicator & Settings */}
                <div className="px-3.5 py-1.5 sm:py-2 bg-white/85 border-b border-[#8C7452]/20 flex items-center justify-between shrink-0 shadow-xs">
                  <div className="flex items-center gap-2">
                    {isLiveActive ? (
                      /* Live Recording Badge with Pulse Animation */
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                        </span>
                        <span className="font-meta text-[8.5px] sm:text-[9px] uppercase tracking-wider text-rose-900 font-bold">
                          {isMicMuted
                            ? 'Micrófono en Pausa'
                            : audioSource === 'ai'
                            ? 'Asesor Hablando...'
                            : 'Grabando Voz en Vivo'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            liveStatus === 'connecting'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-neutral-400'
                          }`}
                        />
                        <span className="font-meta text-[8.5px] sm:text-[9px] uppercase tracking-wider text-[#1B1813] font-semibold truncate max-w-[150px]">
                          {liveStatus === 'connecting'
                            ? 'Conectando sesión...'
                            : 'Listo para hablar'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className="flex items-center gap-1 font-meta text-[8.5px] sm:text-[9px] text-[#8C7452] hover:text-[#1B1813] tracking-wider uppercase border border-[#8C7452]/30 px-2 py-0.5 rounded-full hover:bg-[#8C7452]/10 transition-colors shrink-0"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Voz: {selectedVoice}</span>
                  </button>
                </div>

                {/* Voice Settings Dropdown */}
                <AnimatePresence>
                  {showVoiceSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white/95 border-b border-[#8C7452]/30 p-3 shadow-md z-20 overflow-hidden shrink-0"
                    >
                      <div className="text-[9.5px] font-meta text-[#8C8678] uppercase tracking-wider mb-2 font-semibold">
                        Selecciona el Estilo de Voz:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto">
                        {VOICE_OPTIONS.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setSelectedVoice(v.id);
                              setShowVoiceSettings(false);
                              if (isLiveActive) {
                                handleStartLiveCall();
                              }
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                              selectedVoice === v.id
                                ? 'border-[#8C7452] bg-[#8C7452]/15 text-[#1B1813] font-semibold'
                                : 'border-[#8C7452]/20 hover:border-[#8C7452]/50 bg-white/50 text-[#1B1813]'
                            }`}
                          >
                            <div>
                              <span className="font-display font-medium">{v.label}</span>
                              <span className="text-[10px] text-[#8C8678] block font-serif">
                                {v.desc}
                              </span>
                            </div>
                            <span className="font-meta text-[8px] uppercase tracking-widest text-[#8C7452] border border-[#8C7452]/40 px-1.5 py-0.5 rounded font-bold">
                              {v.tone}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Visualizer Area */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-4 text-center relative overflow-y-auto">
                  {/* Visualizer Glowing Orb */}
                  <div className="relative flex items-center justify-center my-auto py-1">
                    {/* Outer Harmonic Ripple Ring */}
                    <motion.div
                      animate={{
                        scale: isLiveActive ? 1 + audioLevel * 0.9 : 1,
                        opacity: isLiveActive ? 0.35 + audioLevel * 0.5 : 0.15,
                      }}
                      transition={{ duration: 0.08, ease: 'linear' }}
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 ${
                        audioSource === 'ai'
                          ? 'border-[#8C7452] bg-[#8C7452]/20'
                          : isLiveActive
                          ? 'border-rose-500 bg-rose-500/20'
                          : 'border-neutral-300 bg-neutral-200/20'
                      } flex items-center justify-center blur-sm absolute`}
                    />

                    {/* Mid Core Circle with Recording Pulse */}
                    <motion.div
                      animate={{
                        scale: isLiveActive ? 1 + audioLevel * 0.5 : 1,
                      }}
                      transition={{ duration: 0.08, ease: 'linear' }}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${
                        isLiveActive
                          ? 'bg-gradient-to-br from-[#1B1813] via-[#2A1815] to-[#3D2520] border-2 border-rose-500/60'
                          : 'bg-gradient-to-br from-[#1B1813] to-[#3D3528] border border-[#8C7452]/50'
                      } text-white flex flex-col items-center justify-center shadow-xl relative z-10`}
                    >
                      {liveStatus === 'connecting' ? (
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#8C7452] animate-spin" />
                      ) : isLiveActive ? (
                        audioSource === 'ai' ? (
                          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-[#FAF9F6] animate-pulse" />
                        ) : (
                          <User className="w-6 h-6 sm:w-7 sm:h-7 text-rose-300 animate-pulse" />
                        )
                      ) : (
                        <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-[#C9C4B5]" />
                      )}

                      {/* Active dynamic waveform bars (Audio Recording Equalizer) */}
                      {isLiveActive && (
                        <div className="flex items-center gap-1 mt-1 h-2.5">
                          {[0.4, 0.9, 1.4, 0.8, 0.5].map((factor, i) => (
                            <motion.span
                              key={i}
                              animate={{
                                height: Math.max(2.5, audioLevel * 16 * factor),
                              }}
                              transition={{ duration: 0.06 }}
                              className={`w-0.5 sm:w-1 rounded-full ${
                                audioSource === 'ai' ? 'bg-[#8C7452]' : 'bg-rose-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Status Guidance & Quick Switch to Text */}
                  {!isLiveActive ? (
                    <div className="max-w-[280px] my-auto space-y-2">
                      <h4 className="font-display font-medium text-xs sm:text-sm text-[#1B1813]">
                        Conversación por Voz en Vivo
                      </h4>
                      <p className="font-serif text-[11px] sm:text-xs text-[#8C8678] leading-relaxed">
                        Habla en tiempo real con el Asesor IA sobre precios, arquitectura y amenidades de {selectedUnit.name}.
                      </p>
                      {/* Direct button to switch to Text Mode */}
                      <button
                        onClick={() => setActiveMode('text')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#8C7452]/50 hover:bg-[#8C7452]/10 text-[#1B1813] rounded-full font-meta text-[10px] uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-[#8C7452]" />
                        <span>Prefiero escribir en el Chat</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-[340px] bg-white/70 backdrop-blur-md rounded-xl p-2.5 border border-[#8C7452]/30 shadow-sm text-left my-auto">
                      <div className="font-meta text-[7.5px] sm:text-[8px] text-[#8C8678] tracking-widest uppercase mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-rose-700 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                          Grabación y Transcripción en Vivo
                        </span>
                        {liveStatus === 'speaking' && (
                          <span className="text-[#8C7452] font-bold">· Hablando</span>
                        )}
                      </div>
                      <p className="font-serif text-[11px] sm:text-xs text-[#1B1813] min-h-[36px] max-h-[56px] overflow-y-auto leading-relaxed">
                        {modelLiveTranscript ||
                          userLiveTranscript ||
                          (isMicMuted
                            ? 'Micrófono en pausa...'
                            : 'Escuchando tu voz... pregunta lo que desees')}
                      </p>
                    </div>
                  )}

                  {/* Error Banner */}
                  {errorMessage && (
                    <div className="mt-2 p-1.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 text-[11px] font-serif max-w-[280px]">
                      {errorMessage}
                    </div>
                  )}
                </div>

                {/* Bottom Call Controls Bar */}
                <div
                  className={`p-3 bg-white/90 border-t border-[#8C7452]/20 flex items-center justify-center gap-2.5 shrink-0 shadow-xs sticky bottom-0 z-30 ${
                    isMobile ? 'pb-[max(env(safe-area-inset-bottom),0.85rem)]' : ''
                  }`}
                >
                  {!isLiveActive ? (
                    <button
                      onClick={handleStartLiveCall}
                      disabled={liveStatus === 'connecting'}
                      className="w-full max-w-[260px] py-2.5 sm:py-3 bg-[#1B1813] hover:bg-[#8C7452] text-[#FAF9F6] font-meta text-[10px] sm:text-xs uppercase tracking-widest font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {liveStatus === 'connecting' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Conectando...</span>
                        </>
                      ) : (
                        <>
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Iniciar Llamada de Voz</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5 w-full justify-center">
                      {/* Mute Button */}
                      <button
                        onClick={handleToggleMute}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95 ${
                          isMicMuted
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-white border border-[#C9C4B5] text-[#1B1813] hover:bg-neutral-100'
                        }`}
                        title={isMicMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
                        aria-label={isMicMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
                      >
                        {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {/* Switch to Chat Button */}
                      <button
                        onClick={() => setActiveMode('text')}
                        className="px-3.5 h-10 rounded-full bg-white border border-[#8C7452]/60 hover:bg-[#8C7452]/10 text-[#1B1813] font-meta text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Cambiar a Chat de Texto"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#8C7452]" />
                        <span>Escribir</span>
                      </button>

                      {/* Prominent High-Visibility "Finalizar Llamada" Button */}
                      <button
                        onClick={handleEndLiveCall}
                        className="px-4 sm:px-5 h-10 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-meta text-[10.5px] sm:text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(225,29,72,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95"
                        title="Finalizar Llamada de Voz"
                        aria-label="Finalizar Llamada de Voz"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>Finalizar Llamada</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================== MODE 2: TEXT CHAT WITH OPTIONAL TTS ===================== */}
            {activeMode === 'text' && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent">
                {/* Active Call Alert Banner in Chat Mode */}
                {isLiveActive && (
                  <div className="bg-rose-50 border-b border-rose-200 px-3 py-2 flex items-center justify-between gap-2 shadow-xs shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-[10.5px] font-meta uppercase tracking-wider font-bold text-rose-900 truncate flex items-center gap-1">
                          <span>Llamada de voz activa</span>
                          <span className="text-[8px] bg-rose-200 text-rose-800 px-1 py-0.2 rounded font-mono">REC</span>
                        </p>
                        <p className="text-[9px] font-serif text-rose-700 truncate">
                          {isMicMuted ? 'Micrófono en pausa' : 'Grabando y escuchando audio...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setActiveMode('live')}
                        className="px-2.5 py-1 bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 font-meta text-[9px] uppercase tracking-wider font-bold rounded-lg transition-colors cursor-pointer"
                        title="Ver Pantalla de Voz"
                      >
                        Ver Voz
                      </button>
                      <button
                        onClick={handleEndLiveCall}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-meta text-[9.5px] uppercase tracking-wider font-bold rounded-lg shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
                        title="Finalizar Llamada de Voz"
                      >
                        <PhoneOff className="w-3 h-3" />
                        <span>Finalizar Llamada</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Text Mode Subheader with TTS toggle + Quick Voice Switch */}
                <div className="px-3.5 py-1.5 sm:py-2 bg-white/80 border-b border-[#8C7452]/20 flex items-center justify-between text-xs shrink-0">
                  <button
                    onClick={() => setActiveMode('live')}
                    className="flex items-center gap-1 font-meta text-[8.5px] sm:text-[9px] uppercase tracking-wider text-[#8C7452] hover:text-[#1B1813] font-bold cursor-pointer"
                    title="Pasar a Modo Llamada de Voz"
                  >
                    <Headphones className="w-3 h-3" />
                    <span>Pasar a Voz</span>
                  </button>

                  <button
                    onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                    className={`flex items-center gap-1 font-meta text-[8.5px] sm:text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                      isTtsEnabled
                        ? 'border-[#8C7452] bg-[#8C7452]/15 text-[#8C7452] font-semibold'
                        : 'border-[#C9C4B5] text-[#8C8678] hover:text-[#1B1813]'
                    }`}
                    title={isTtsEnabled ? 'Desactivar audio de respuesta' : 'Activar lectura en voz alta'}
                  >
                    {isTtsEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    <span>Audio {isTtsEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Message List */}
                <div className="flex-1 min-h-0 px-3 py-3 overflow-y-auto space-y-2.5 scrollbar-thin">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-sm text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#1B1813] text-[#FAF9F6] rounded-br-none border border-[#8C7452]/40'
                            : 'bg-white/90 backdrop-blur-md border border-[#8C7452]/30 text-[#1B1813] rounded-bl-none font-serif shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoadingText && (
                    <div className="flex justify-start">
                      <div className="bg-white/90 backdrop-blur-md border border-[#8C7452]/30 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 text-[#8C7452] animate-spin" />
                        <span className="text-[10px] sm:text-xs text-[#8C8678] font-meta uppercase tracking-wider">
                          Analizando consulta...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Field */}
                <form
                  onSubmit={handleSendTextMessage}
                  className={`p-2.5 sm:p-3 bg-white/90 border-t border-[#8C7452]/20 shrink-0 shadow-xs sticky bottom-0 z-30 ${
                    isMobile ? 'pb-[max(env(safe-area-inset-bottom),0.85rem)]' : ''
                  }`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Escribe tu pregunta aquí (precios, metraje, acabados)..."
                      className="w-full bg-white border border-[#8C7452]/50 focus:border-[#8C7452] focus:ring-1 focus:ring-[#8C7452]/30 rounded-xl pl-3 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1B1813] placeholder-[#8C8678] outline-none transition-all shadow-inner"
                      disabled={isLoadingText}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoadingText}
                      className="absolute right-1 p-1.5 sm:p-2 bg-[#1B1813] text-[#FAF9F6] hover:bg-[#8C7452] disabled:bg-[#C9C4B5] disabled:text-[#8C8678] rounded-lg transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};
