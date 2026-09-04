import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Sparkles, Volume2, HelpCircle, X, Check, Compass } from 'lucide-react';
import { VoiceFeedback, VoiceNavigationCommand } from '../../utils/voiceNavigationController';

interface VoiceControlHUDProps {
  isListening: boolean;
  isSupported: boolean;
  feedback: VoiceFeedback | null;
  lastCommand: VoiceNavigationCommand | null;
  onToggleListening: () => void;
  className?: string;
  contextMode?: 'building' | 'tour360';
}

export const VoiceControlHUD: React.FC<VoiceControlHUDProps> = ({
  isListening,
  isSupported,
  feedback,
  lastCommand,
  onToggleListening,
  className = '',
  contextMode = 'building',
}) => {
  const [showCommandsHelp, setShowCommandsHelp] = useState<boolean>(false);

  if (!isSupported) {
    return null;
  }

  const suggestedCommands = contextMode === 'tour360'
    ? [
        { label: 'Ir a la cocina', desc: 'Navega a la cocina gourmet' },
        { label: 'Ir al salón', desc: 'Regresa al gran salón social' },
        { label: 'Salir a la terraza', desc: 'Mirador panorámico al Ávila' },
        { label: 'Ir a la master suite', desc: 'Habitación principal' },
        { label: 'Hora dorada / Modo noche', desc: 'Cambia la simulación solar' },
        { label: 'Activar realidad virtual', desc: 'Lanza inmersión VR' },
        { label: 'Monolito / Despiece', desc: 'Regresa al estudio 3D' },
      ]
    : [
        { label: 'Monolito / Ensamblado', desc: 'Edificio ensamblado completo' },
        { label: 'Modo explosión / Despiece', desc: 'Despiece vertical de estratos' },
        { label: 'Tour 360 interiores', desc: 'Entrar a las residencias' },
        { label: 'Ir a la cocina / salón', desc: 'Abre el tour en esa estancia' },
        { label: 'Ver el Ávila / Norte', desc: 'Orienta la cámara hacia la montaña' },
        { label: 'Fachada Sur / Valle', desc: 'Perspectiva urbana' },
        { label: 'Hora dorada / Noche', desc: 'Simulación de luz bioclimática' },
        { label: 'Auto rotar / Parar', desc: 'Giro continuo de maqueta' },
        { label: 'Acercar / Alejar', desc: 'Control de zoom' },
      ];

  return (
    <div className={`relative ${className}`}>
      {/* Main Microphone Button & Live Speech Indicator */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={onToggleListening}
          whileTap={{ scale: 0.94 }}
          className={`relative p-2 sm:px-3 sm:py-2 rounded-full border shadow-xl flex items-center gap-2 cursor-pointer transition-all ${
            isListening
              ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-400/50 shadow-rose-950/50'
              : 'bg-[#1B1813]/90 border-[#8C7452]/50 text-[#FAF9F6] hover:bg-[#2A241C] hover:border-[#8C7452]'
          }`}
          title={isListening ? 'Desactivar control por voz' : 'Activar control por voz (comandos naturales)'}
        >
          {/* Animated Pulsing Sound Waves when listening */}
          {isListening && (
            <span className="absolute -inset-1 rounded-full border border-rose-400 animate-ping opacity-60 pointer-events-none" />
          )}

          <div className="relative">
            {isListening ? (
              <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4 text-[#F5C780]" />
            )}
          </div>

          <span className="font-meta text-[9.5px] uppercase tracking-wider font-semibold hidden md:inline">
            {isListening ? 'Escuchando...' : 'Control por Voz'}
          </span>
        </motion.button>

        {/* Quick Voice Commands Guide Trigger */}
        <button
          onClick={() => setShowCommandsHelp(true)}
          className="p-2 rounded-full bg-[#1B1813]/85 text-[#C9C4B5] border border-[#8C7452]/40 hover:text-white transition-colors cursor-pointer"
          title="Ver lista de comandos de voz disponibles"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Active Voice Feedback Pill */}
      <AnimatePresence>
        {isListening && feedback && feedback.transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 sm:left-auto sm:right-0 min-w-[220px] max-w-xs z-50 bg-[#1B1813]/95 backdrop-blur-xl border border-rose-500/40 rounded-2xl p-3 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between text-[8px] font-mono text-rose-400 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                Voz Detectada
              </span>
              <span>{Math.round(feedback.confidence * 100)}% Conf.</span>
            </div>

            <div className="font-serif text-xs text-[#FAF9F6] italic leading-snug">
              "{feedback.transcript}"
            </div>

            {/* Matched Command Badge */}
            {feedback.matchedCommand && (
              <div className="mt-2 pt-2 border-t border-[#8C7452]/30 flex items-center gap-1.5 text-[9px] font-meta text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="truncate">
                  {('label' in feedback.matchedCommand && feedback.matchedCommand.label) ||
                   ('roomName' in feedback.matchedCommand && `Ir a ${feedback.matchedCommand.roomName}`) ||
                   'Comando ejecutado'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Commands Cheat Sheet Modal */}
      <AnimatePresence>
        {showCommandsHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              className="bg-[#1B1813] text-[#FAF9F6] border border-[#8C7452] rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowCommandsHelp(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-[#C9C4B5] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8C7452] to-[#B8986B] text-[#1B1813] flex items-center justify-center shadow-lg">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#FAF9F6]">
                    Navegación 3D por Comandos de Voz
                  </h3>
                  <p className="font-meta text-[9px] text-[#F5C780] uppercase tracking-widest">
                    Habla naturalmente en español
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#C9C4B5] font-serif leading-relaxed mb-4">
                Presiona el botón de micrófono y di cualquiera de los siguientes comandos para controlar la maqueta 3D y el tour 360° con manos libres:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                {suggestedCommands.map((cmd, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#2A241C] border border-[#8C7452]/30 text-xs"
                  >
                    <span className="font-display font-medium text-[#F5C780]">
                      "{cmd.label}"
                    </span>
                    <span className="font-sans text-[10.5px] text-[#C9C4B5]">
                      {cmd.desc}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#8C7452]/30 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowCommandsHelp(false);
                    if (!isListening) onToggleListening();
                  }}
                  className="w-full bg-gradient-to-r from-[#8C7452] to-[#B8986B] text-[#1B1813] font-meta font-bold text-xs py-2.5 rounded-xl hover:brightness-110 transition-all cursor-pointer text-center uppercase tracking-wider"
                >
                  {isListening ? 'Comenzar a Hablar' : 'Activar Micrófono Ahora'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
