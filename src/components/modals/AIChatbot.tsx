import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  MessageSquare,
  Minus,
  Maximize2,
} from 'lucide-react';
import { UnitData } from '../../types/brand';
import { useResponsiveChat } from '../../hooks/useResponsiveChat';
import { SSEStreamParser } from '../../utils/sseParser';
import {
  calculateInvestmentTotals,
  getDefaultPricePerM2,
  formatUsdCurrency,
} from '../../utils/financialCalculations';

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

const QUICK_PROMPTS = [
  '¿Cuál es el precio y plan de pago?',
  '¿Cuáles son los acabados de autor?',
  'Ver metraje y distribución espacial',
  '¿Cómo coordino una visita privada?',
];

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose, selectedUnit }) => {
  const { isMobile } = useResponsiveChat();
  const [isMinimized, setIsMinimized] = useState(false);

  // Text Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAbortControllerRef = useRef<AbortController | null>(null);

  // Format unit context for the AI using official financial calculations
  const getUnitContext = () => {
    const defaultPrice = getDefaultPricePerM2(selectedUnit.typology);
    const totals = calculateInvestmentTotals(selectedUnit.totalArea, defaultPrice);

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
      Precio Referencial: ${formatUsdCurrency(totals.totalValueUsd)} (a $${totals.pricePerM2}/m²)
      Señal de Reserva en Escrow (10%): ${formatUsdCurrency(totals.reserveDepositUsd)}
      Distribución: ${selectedUnit.roomList.join(', ')}
      Atributo Distintivo: "${selectedUnit.distinctiveAttribute}"
    `;
  };

  // Handle modal close / open lifecycle
  useEffect(() => {
    if (!isOpen) {
      if (chatAbortControllerRef.current) {
        chatAbortControllerRef.current.abort();
      }
      setIsMinimized(false);
    } else {
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `¡Bienvenido a Residencias Caroní! Soy tu Asesor Virtual. Estoy analizando la ${selectedUnit.name} (${selectedUnit.totalArea} m² en ${selectedUnit.level}). ¿En qué puedo asistirte hoy sobre precios, acabados de autor, arquitectura o agenda de visita privada?`,
        },
      ]);
    }
  }, [isOpen, selectedUnit, messages.length]);

  // Auto-scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingText]);

  // Send Text Message
  const executeSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isLoadingText) return;

    // Cancel any ongoing fetch request
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    chatAbortControllerRef.current = abortController;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: cleanText,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoadingText(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          history: newMessages,
          context: getUnitContext(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Error al conectar con el asistente.');
      }
      if (!response.body) throw new Error('No stream available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const sseParser = new SSEStreamParser();

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      let done = false;
      const appendPayloads = (payloads: string[]) => {
        for (const payload of payloads) {
          try {
            const data = JSON.parse(payload);
            if (data.text) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + data.text }
                    : msg
                )
              );
            }
          } catch {
            // ignore partial json
          }
        }
      };

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const payloads = sseParser.feed(chunkStr);
          appendPayloads(payloads);
        }
      }

      // Flush remaining SSE buffer
      const finalPayloads = sseParser.flush();
      appendPayloads(finalPayloads);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return;
      }
      console.error('Chat error:', err);
      const friendlyMsg =
        err?.message && !err.message.includes('object')
          ? err.message
          : 'Disculpa, no pude procesar la consulta en este instante. Por favor intenta nuevamente.';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: friendlyMsg,
        },
      ]);
    } finally {
      if (chatAbortControllerRef.current === abortController) {
        chatAbortControllerRef.current = null;
      }
      setIsLoadingText(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSendMessage(inputValue);
  };

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
            className={`fixed z-[999999] pointer-events-auto bg-[#1B1813] text-[#FAF9F6] border border-[#C9A86A]/40 shadow-[0_12px_36px_rgba(27,24,19,0.5)] rounded-2xl p-2 sm:px-3.5 sm:py-2 flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 transition-all ${
              isMobile
                ? 'bottom-[max(env(safe-area-inset-bottom),0.75rem)] inset-x-3'
                : 'bottom-5 right-5'
            }`}
          >
            <div
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity min-w-0"
              title="Expandir Asistente Virtual"
            >
              <div className="w-7 h-7 rounded-full bg-[#8C7452] flex items-center justify-center shadow-inner shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-[#FAF9F6]" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-semibold text-xs text-[#FAF9F6]">
                    Asistente Virtual
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="font-meta text-[8.5px] text-[#C9C4B5] tracking-wider uppercase truncate max-w-[140px] sm:max-w-[180px]">
                  {selectedUnit.name} · Tocar para abrir
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-white/10 shrink-0">
              <button
                onClick={() => setIsMinimized(false)}
                className="bg-white/10 text-[#FAF9F6] hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Maximizar Asistente"
                aria-label="Maximizar Asistente"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="bg-white/10 text-[#FAF9F6] hover:bg-rose-600 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Cerrar Asistente"
                aria-label="Cerrar Asistente"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Full Expanded Luxury Chat Assistant Modal */
          <motion.div
            key="expanded-advisor-modal"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`fixed z-[999999] pointer-events-auto flex flex-col bg-[#FAF9F6] backdrop-blur-2xl shadow-[0_25px_60px_rgba(27,24,19,0.35)] overflow-hidden transition-all ${
              isMobile
                ? 'inset-0 w-full h-[100dvh] max-h-[100dvh] rounded-none border-none'
                : 'bottom-5 right-5 w-[420px] max-w-[calc(100vw-32px)] h-[min(570px,calc(100dvh-40px))] max-h-[90dvh] border border-[#8C7452]/40 rounded-3xl'
            }`}
          >
            {/* Institutional Top Header */}
            <div
              className={`bg-[#1B1813] text-[#FAF9F6] px-4 py-3 flex items-center justify-between shrink-0 border-b border-[#8C7452]/40 shadow-sm sticky top-0 z-30 ${
                isMobile ? 'pt-[max(env(safe-area-inset-top),0.75rem)]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8C7452] to-[#6E5A3E] flex items-center justify-center shadow-inner shrink-0 border border-[#C9A86A]/40">
                  <MessageSquare className="w-4 h-4 text-[#FAF9F6]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-semibold text-xs sm:text-sm tracking-wide text-[#FAF9F6] truncate">
                      Asistente Virtual
                    </h3>
                    <span className="flex items-center gap-1 font-mono text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      EN LÍNEA
                    </span>
                  </div>
                  <p className="font-meta text-[8.5px] sm:text-[9px] text-[#C9C4B5] tracking-wider uppercase opacity-90 truncate">
                    {selectedUnit.name} · {selectedUnit.level}
                  </p>
                </div>
              </div>

              {/* Header Right Actions: Minimize + Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="bg-white/10 hover:bg-white/20 text-[#FAF9F6] min-w-[34px] min-h-[34px] p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  title="Minimizar Asistente"
                  aria-label="Minimizar Asistente"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="bg-white/10 hover:bg-rose-600 hover:text-white text-[#FAF9F6] min-w-[34px] min-h-[34px] p-1.5 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center"
                  title="Cerrar Asistente"
                  aria-label="Cerrar Asistente"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 min-h-0 px-3.5 py-3.5 overflow-y-auto space-y-3 bg-[#FAF8F5]/80 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs sm:text-[13px] whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1B1813] text-[#FAF9F6] rounded-br-none border border-[#C9A86A]/30 font-sans'
                        : 'bg-white/95 backdrop-blur-md border border-[#8C7452]/25 text-[#1B1813] rounded-bl-none font-serif shadow-[0_2px_12px_rgba(27,24,19,0.04)]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoadingText && (
                <div className="flex justify-start">
                  <div className="bg-white/95 backdrop-blur-md border border-[#8C7452]/25 rounded-2xl rounded-bl-none px-3.5 py-2.5 shadow-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-[#8C7452] animate-spin" />
                    <span className="text-[10px] sm:text-xs text-[#8C8678] font-meta uppercase tracking-wider">
                      Consultando información...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Inquiry Prompts Chips */}
            <div className="px-3 py-2 bg-[#F4F1EA]/80 border-t border-[#8C7452]/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[8px] font-mono text-[#8C7452] uppercase font-bold shrink-0 flex items-center gap-1 pl-1">
                <Sparkles className="w-2.5 h-2.5" />
                SUGERENCIAS:
              </span>
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => executeSendMessage(prompt)}
                  disabled={isLoadingText}
                  className="font-meta text-[9px] uppercase tracking-wider whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-[#8C7452] text-[#5A554A] hover:text-white border border-[#8C7452]/30 shadow-2xs transition-all cursor-pointer shrink-0 disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <form
              onSubmit={handleFormSubmit}
              className={`p-3 bg-white border-t border-[#8C7452]/20 shrink-0 shadow-sm sticky bottom-0 z-30 ${
                isMobile ? 'pb-[max(env(safe-area-inset-bottom),0.85rem)]' : ''
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu consulta sobre Residencias Caroní..."
                  className="w-full bg-[#FAF9F6] border border-[#8C7452]/40 focus:border-[#8C7452] focus:ring-1 focus:ring-[#8C7452]/30 rounded-xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm text-[#1B1813] placeholder-[#8C8678] outline-none transition-all shadow-inner"
                  disabled={isLoadingText}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoadingText}
                  className="absolute right-1.5 p-2 bg-[#1B1813] text-[#FAF9F6] hover:bg-[#8C7452] disabled:bg-[#C9C4B5]/60 disabled:text-[#8C8678] rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Enviar mensaje"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};
