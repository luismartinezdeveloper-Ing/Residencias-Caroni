import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaroniIsotype } from './ArchitecturalDrawings';

interface CinematicIntroLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const CinematicIntroLoader: React.FC<CinematicIntroLoaderProps> = ({
  onComplete,
  minDurationMs = 1400,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cinematic-curtain"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: '-100%',
            transition: {
              duration: 0.85,
              ease: [0.16, 1, 0.3, 1], // Apple cubic bezier
            },
          }}
          className="fixed inset-0 z-[999999] bg-[#070706] text-[#FAF8F5] flex flex-col items-center justify-center select-none overflow-hidden"
          onClick={() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }}
        >
          {/* Subtle Golden Glow in Background */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[#8C7452]/15 blur-[120px] pointer-events-none" />

          {/* Central Monogram & Branding */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center relative z-10 px-6"
          >
            {/* Isotype with Glowing Outline */}
            <div className="relative mb-5">
              <div className="absolute -inset-2 rounded-full bg-[#C9A86A]/20 blur-md animate-pulse" />
              <div className="relative p-3 rounded-full border border-[#C9A86A]/40 bg-black/60 shadow-2xl">
                <CaroniIsotype size={36} color="#C9A86A" />
              </div>
            </div>

            {/* Project Title */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#FAF9F6] font-normal tracking-wide leading-tight mb-2">
              RESIDENCIAS CARONÍ
            </h1>

            {/* Location & Architecture Label */}
            <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-[#C9A86A] uppercase font-semibold">
              <span>ALTAMIRA, CARACAS</span>
              <span className="text-white/30">·</span>
              <span>AÑIL ARQUITECTURA</span>
            </div>

            {/* Subtle Line Progress Indicator */}
            <div className="w-32 sm:w-40 h-[1.5px] bg-white/10 rounded-full mt-6 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[#8C7452] via-[#C9A86A] to-[#FAF8F5]"
              />
            </div>
          </motion.div>

          {/* Bottom Telemetry Note */}
          <div className="absolute bottom-8 font-meta text-[8.5px] tracking-[0.3em] uppercase text-white/40">
            EXPERIENCIA CINEMÁTICA DE ULTRA-LUJO
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
