import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
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
import { useModalA11y } from '../../hooks/useModalA11y';
import { getDomainFallbackReply } from '../../utils/aiDomainFallback';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnit?: UnitData;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose, selectedUnit }) => {
  const { isMobile } = useResponsiveChat();
  const [isMinimized, setIsMinimized] = useState(false);

  // Panel expandido: en escritorio es una ventana flotante (no modal) y en teléfono ocupa toda la
  // pantalla (modal). Escape lo cierra; el foco se atrapa y el scroll se bloquea solo en teléfono.
  const panelRef = useModalA11y<HTMLDivElement>(isOpen && !isMinimized, onClose, {
    trap: isMobile,
    lockScroll: isMobile,
    autoFocus: false,
  });

  // Text Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAbortControllerRef = useRef<AbortController | null>(null);

  // Handle modal lifecycle
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

  // Initial welcome message (Apple-style clean greeting, short and precise)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            '¡Bienvenido a Residencias Caroní! Soy su Asesor. Estoy a su disposición para brindarle información sobre las 8 residencias de autor, cotas técnicas, acabados de alta gama, simulación financiera o coordinar una visita privada. ¿En qué puedo orientarle hoy?',
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingText]);

  // Send Text Message
  const executeSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isLoadingText) return;

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

    const assistantMessageId = (Date.now() + 1).toString();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          history: newMessages,
          // El servidor construye el contexto a partir del id de la unidad
          unitId: selectedUnit?.id,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Fallback to local domain advisor');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const sseParser = new SSEStreamParser();

      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      let done = false;
      let receivedAnyText = false;
      const appendPayloads = (payloads: string[]) => {
        for (const payload of payloads) {
          try {
            const data = JSON.parse(payload);
            if (data.text) {
              receivedAnyText = true;
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

      if (!receivedAnyText) {
        const localReply = getDomainFallbackReply(cleanText, selectedUnit?.name);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: localReply } : msg
          )
        );
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return;
      }
      const localFallbackReply = getDomainFallbackReply(cleanText, selectedUnit?.name);
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === assistantMessageId);
        if (exists) {
          return prev.map((msg) =>
            msg.id === assistantMessageId && !msg.content.trim()
              ? { ...msg, content: localFallbackReply }
              : msg
          );
        }
        return [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: localFallbackReply,
          },
        ];
      });
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
      {isOpen &&
        (isMinimized ? (
          /* Apple-style Minimized Floating Capsule */
          <motion.div
            key="minimized-advisor-pill"
            initial={{ opacity: 0, y: 15, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-[999999] pointer-events-auto bg-white/85 backdrop-blur-2xl text-[#1B1813] border border-white/80 shadow-[0_16px_40px_rgba(27,24,19,0.12),0_1px_3px_rgba(0,0,0,0.05)] rounded-full p-2 sm:px-4 sm:py-2.5 flex items-center justify-between sm:justify-start gap-3 transition-all ${
              isMobile
                ? 'bottom-[max(env(safe-area-inset-bottom),0.75rem)] inset-x-3'
                : 'bottom-5 right-5'
            }`}
          >
            <div
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
              title="Abrir Asesor"
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.04] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-[#8C7452]" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-xs sm:text-sm text-[#1B1813]">
                    Asesor
                  </span>
                  {/* Apple-style pulsing indicator dot */}
                  <span className="relative flex h-1.5 w-1.5" title="En línea">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                </div>
                <span className="font-meta text-[10px] text-[#8C8678] tracking-wider uppercase truncate max-w-[150px] sm:max-w-[200px]">
                  Residencias Caroní · Abrir
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-black/[0.08] shrink-0">
              <button
                onClick={() => setIsMinimized(false)}
                className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#5A554A] hover:text-[#1B1813] flex items-center justify-center transition-all cursor-pointer"
                title="Maximizar"
                aria-label="Maximizar Asesor"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-rose-500 hover:text-white text-[#5A554A] flex items-center justify-center transition-all cursor-pointer"
                title="Cerrar"
                aria-label="Cerrar Asesor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Apple-style Translucent White Glass Modal */
          <motion.div
            key="expanded-advisor-modal"
            ref={panelRef}
            role="dialog"
            aria-modal={isMobile ? true : undefined}
            aria-label="Asesor de Residencias Caroní"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`fixed z-[999999] pointer-events-auto flex flex-col bg-white/80 backdrop-blur-3xl shadow-[0_24px_60px_rgba(27,24,19,0.12),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all ${
              isMobile
                ? 'inset-0 w-full h-[100dvh] max-h-[100dvh] rounded-none border-none'
                : 'bottom-5 right-5 w-[420px] max-w-[calc(100vw-32px)] h-[min(590px,calc(100dvh-40px))] max-h-[90dvh] border border-white/70 rounded-3xl'
            }`}
          >
            {/* Apple Frosted Glass Header */}
            <div
              className={`bg-white/70 backdrop-blur-2xl px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-black/[0.05] sticky top-0 z-30 ${
                isMobile ? 'pt-[max(env(safe-area-inset-top),0.85rem)]' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.04] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#8C7452]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-semibold text-sm sm:text-base tracking-tight text-[#1B1813] truncate">
                      Asesor
                    </h2>
                    {/* Pure minimal online indicator dot */}
                    <span className="relative flex h-1.5 w-1.5 shrink-0" title="En línea">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                  </div>
                  <p className="font-meta text-[10px] text-[#8C8678] tracking-widest uppercase truncate">
                    Residencias Caroní · Altamira
                  </p>
                </div>
              </div>

              {/* Minimalist Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#5A554A] hover:text-[#1B1813] flex items-center justify-center transition-all cursor-pointer"
                  title="Minimizar"
                  aria-label="Minimizar Asesor"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-rose-500 hover:text-white text-[#5A554A] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Cerrar"
                  aria-label="Cerrar Asesor"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Apple-style Translucent Message Stream */}
            <div className="flex-1 min-h-0 px-4 py-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-white/30 via-[#FAF9F6]/50 to-white/60 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-sans transition-all ${
                      msg.role === 'user'
                        ? 'bg-[#1B1813] text-[#FAF9F6] rounded-2xl rounded-tr-xs shadow-[0_2px_8px_rgba(27,24,19,0.12)]'
                        : 'bg-white/95 backdrop-blur-md border border-black/[0.05] text-[#1B1813] rounded-2xl rounded-tl-xs shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoadingText && (
                <div className="flex justify-start">
                  <div className="bg-white/90 backdrop-blur-md border border-black/[0.05] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-2xs flex items-center gap-2.5">
                    <Loader2 className="w-3.5 h-3.5 text-[#8C7452] animate-spin" />
                    <span className="text-[10px] sm:text-xs text-[#8C8678] font-meta uppercase tracking-wider">
                      Escribiendo respuesta...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Apple-style Frosted Input Dock */}
            <form
              onSubmit={handleFormSubmit}
              className={`p-3.5 bg-white/70 backdrop-blur-2xl border-t border-black/[0.05] shrink-0 sticky bottom-0 z-30 ${
                isMobile ? 'pb-[max(env(safe-area-inset-bottom),0.85rem)]' : ''
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escriba su consulta sobre Residencias Caroní..."
                  className="w-full bg-white/90 border border-black/[0.08] focus:border-[#8C7452] focus:ring-2 focus:ring-[#8C7452]/10 rounded-full pl-4 pr-12 py-2.5 text-xs sm:text-sm text-[#1B1813] placeholder-[#8C8678] outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                  disabled={isLoadingText}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoadingText}
                  className="absolute right-1.5 w-8 h-8 rounded-full bg-[#1B1813] hover:bg-[#8C7452] text-white disabled:bg-black/10 disabled:text-black/30 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Enviar consulta"
                  aria-label="Enviar consulta"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        ))}
    </AnimatePresence>
  );
};
