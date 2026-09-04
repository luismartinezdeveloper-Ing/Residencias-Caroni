import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { CaroniIsotype } from '../ui/ArchitecturalDrawings';
import {
  Play,
  Pause,
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX,
  FileDown,
  RefreshCw,
  Film,
} from 'lucide-react';

/**
 * 3 TOMAS CINEMÁTICAS PURAS Y SUS METADATOS TÉCNICOS
 */
const CINEMATIC_VIDEOS = [
  {
    id: 1,
    src: '/videos/Camera_rotating_around_building.mp4',
    name: 'Órbita Volumétrica',
    cotaTag: 'COTA BASE: +920.00 M.S.N.M. · VISTA NORTE EL ÁVILA',
    aspectTag: 'IMPLANTACIÓN MONOLÍTICA · 8VA TRANSVERSAL',
  },
  {
    id: 2,
    src: '/videos/Building_transforms_into_luxury.mp4',
    name: 'Materia & Construcción',
    cotaTag: 'SISTEMA ESTRUCTURAL: CONCRETO LIMPIO & MÁRMOL',
    aspectTag: 'ESTRATOS EN 4 NIVELES · PROPORCIÓN ÁUREA',
  },
  {
    id: 3,
    src: '/videos/vFirst_person_wide_angle_archi.mp4',
    name: 'Recorrido Interior',
    cotaTag: 'ALTURA LIBRE: 3.20 M · PENTHOUSES HASTA 450 M²',
    aspectTag: 'LUZ NATURAL CENITAL · PRIVACIDAD ABSOLUTA',
  },
];

const IDLE_DELAY_MS = 4000; // 4 seconds of scroll inactivity before autoplay starts
const AUTOPLAY_SHOT_DURATION_MS = 6500; // 6.5s per shot in autoplay loop

interface CinematicScrollNarrativeProps {
  onOpen3DModal?: () => void;
  onExploreElevation?: () => void;
  onRequestDossier?: () => void;
}

export const CinematicScrollNarrative: React.FC<CinematicScrollNarrativeProps> = ({
  onOpen3DModal,
  onExploreElevation,
  onRequestDossier,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];

  // Active shot index (0, 1, 2)
  const [activeShot, setActiveShot] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Flow State: 'scroll' (user driving) vs 'auto' (idle reel active)
  const [flowMode, setFlowMode] = useState<'scroll' | 'auto'>('auto');
  const [autoplayProgress, setAutoplayProgress] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Inactivity tracking refs
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimationRef = useRef<number | null>(null);

  // 360vh total scroll space for manual exploration
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Manual Scroll Opacities: Clean Dip-to-Black Transitions (Never overlap two semi-transparent videos)
  // Shot 1: [0 -> 0.28 fully visible, 0.28 -> 0.32 fades cleanly to black]
  const manualShot1Opacity = useTransform(scrollYProgress, [0, 0.27, 0.31, 0.35], [1, 1, 0, 0]);
  // Shot 2: [0.31 -> 0.35 fades in from black, 0.35 -> 0.61 fully visible, 0.61 -> 0.65 fades to black]
  const manualShot2Opacity = useTransform(scrollYProgress, [0.30, 0.34, 0.61, 0.65], [0, 1, 1, 0]);
  // Shot 3: [0.64 -> 0.68 fades in from black, 0.68 -> 1 fully visible]
  const manualShot3Opacity = useTransform(scrollYProgress, [0.64, 0.68, 1], [0, 1, 1]);
  const outroFadeOpacity = useTransform(scrollYProgress, [0.93, 1], [0, 1]);

  // Subtle initial hint that disappears on scroll
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Handle User Activity (Instantly returns control to Scroll Mode)
  const handleUserInteraction = useCallback(() => {
    setFlowMode('scroll');

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current);

    // Set 4s inactivity timer to re-engage auto flow
    idleTimerRef.current = setTimeout(() => {
      setFlowMode('auto');
    }, IDLE_DELAY_MS);
  }, []);

  // Sync scroll position when user manually scrolls
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      handleUserInteraction();

      if (v < 0.32) {
        setActiveShot(0);
      } else if (v < 0.66) {
        setActiveShot(1);
      } else {
        setActiveShot(2);
      }
    });

    return () => unsub();
  }, [scrollYProgress, handleUserInteraction]);

  // Listen to wheel, touch and key events
  useEffect(() => {
    const events = ['wheel', 'touchstart', 'touchmove', 'keydown'];
    const listener = () => handleUserInteraction();

    events.forEach((ev) => window.addEventListener(ev, listener, { passive: true }));

    // Start initial idle timer
    idleTimerRef.current = setTimeout(() => {
      setFlowMode('auto');
    }, IDLE_DELAY_MS);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, listener));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
      if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current);
    };
  }, [handleUserInteraction]);

  // Autoplay Reel Engine when flowMode === 'auto'
  useEffect(() => {
    if (flowMode !== 'auto') {
      setAutoplayProgress(0);
      return;
    }

    let startTime = performance.now();

    const updateProgressBar = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(100, (elapsed / AUTOPLAY_SHOT_DURATION_MS) * 100);
      setAutoplayProgress(progress);

      if (elapsed < AUTOPLAY_SHOT_DURATION_MS) {
        progressAnimationRef.current = requestAnimationFrame(updateProgressBar);
      }
    };

    progressAnimationRef.current = requestAnimationFrame(updateProgressBar);

    autoplayIntervalRef.current = setInterval(() => {
      setActiveShot((prev) => (prev + 1) % 3);
      startTime = performance.now();
      if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current);
      progressAnimationRef.current = requestAnimationFrame(updateProgressBar);
    }, AUTOPLAY_SHOT_DURATION_MS);

    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
      if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current);
    };
  }, [flowMode]);

  // Ensure all videos play
  useEffect(() => {
    videoRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.play().catch(() => {});
      }
    });
  }, [activeShot]);

  // Procedural Web Audio Ambient Soundscape
  const toggleAudioAmbient = () => {
    try {
      if (!isAudioActive) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
          masterGain.connect(ctx.destination);
          gainNodeRef.current = masterGain;

          const osc1 = ctx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(55, ctx.currentTime);

          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(82.4, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, ctx.currentTime);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(masterGain);

          osc1.start();
          osc2.start();
        } else if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0.12, audioCtxRef.current.currentTime + 1);
        }
        setIsAudioActive(true);
      } else {
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
          setTimeout(() => {
            if (audioCtxRef.current?.state === 'running') {
              audioCtxRef.current.suspend();
            }
          }, 500);
        }
        setIsAudioActive(false);
      }
    } catch (e) {
      console.warn('Web Audio notice:', e);
      setIsAudioActive(!isAudioActive);
    }
  };

  const togglePlayAll = () => {
    videoRefs.forEach((ref) => {
      if (ref.current) {
        if (ref.current.paused) {
          ref.current.play().catch(() => {});
        } else {
          ref.current.pause();
        }
      }
    });
    setIsPlaying(!isPlaying);
  };

  // Direct Jump to a specific shot
  const jumpToShot = (index: number) => {
    handleUserInteraction();
    setActiveShot(index);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
      const targets = [0.02, 0.48, 0.85];
      const targetScroll = scrollTop + rect.top + targets[index] * totalHeight;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      ref={containerRef}
      id="obra"
      className="relative h-[360vh] bg-[#070706] text-[#FAF8F5] select-none"
    >
      {/* STICKY FULLSCREEN CINEMA */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#070706] flex flex-col justify-between">
        {/* 1. CINEMA VIDEO VIEWPORT (PURE FULLSCREEN - HYBRID TRANSITION ENGINE) */}
        <div className="absolute inset-0 w-full h-full bg-[#070706] pointer-events-none">
          {CINEMATIC_VIDEOS.map((video, idx) => {
            const isShotActive = activeShot === idx;

            return (
              <motion.video
                key={video.id}
                ref={videoRefs[idx]}
                style={
                  flowMode === 'scroll'
                    ? {
                        opacity:
                          idx === 0
                            ? manualShot1Opacity
                            : idx === 1
                            ? manualShot2Opacity
                            : manualShot3Opacity,
                        zIndex: isShotActive ? 10 : 1,
                      }
                    : {
                        zIndex: isShotActive ? 10 : 1,
                      }
                }
                animate={
                  flowMode === 'auto'
                    ? {
                        opacity: isShotActive ? 1 : 0,
                      }
                    : undefined
                }
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                src={video.src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover object-center will-change-opacity"
              />
            );
          })}

          {/* Sutil viñeta perimetral de 90px solo para controles */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#070706]/75 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#070706]/75 to-transparent pointer-events-none" />
        </div>

        {/* 2. TOP MINIMALIST BRANDING & HUD CONTROLS */}
        <div className="relative z-30 max-w-7xl mx-auto px-6 w-full pt-20 sm:pt-24 flex items-center justify-between pointer-events-auto">
          {/* Brand & Location */}
          <div className="flex items-center space-x-3 text-white/90">
            <CaroniIsotype size={18} color="#C9A86A" />
            <div className="flex items-center space-x-2 text-[10px] font-mono tracking-[0.25em] text-[#C9A86A] uppercase font-semibold">
              <span>RESIDENCIAS CARONÍ</span>
              <span className="text-white/30">·</span>
              <span className="text-white/60">ALTAMIRA</span>
            </div>
          </div>

          {/* Controls: Mode Indicator + Audio + Shot Selector + Play/Pause */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Auto Reel Status Indicator / Mode Switch */}
            <button
              onClick={() => {
                if (flowMode === 'auto') {
                  setFlowMode('scroll');
                } else {
                  setFlowMode('auto');
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[9px] font-mono tracking-wider uppercase text-white/80 hover:text-white cursor-pointer"
              title="Cambiar entre modo continuo automático y control por scroll"
            >
              <RefreshCw className={`w-2.5 h-2.5 text-[#C9A86A] ${flowMode === 'auto' ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="hidden md:inline font-bold">
                {flowMode === 'auto' ? 'REEL AUTOMÁTICO' : 'CONTROL SCROLL'}
              </span>
            </button>

            {/* Ambient Soundscape Toggle */}
            <button
              onClick={toggleAudioAmbient}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[9px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                isAudioActive
                  ? 'bg-[#C9A86A] text-[#070706] border-[#C9A86A] font-bold shadow-lg'
                  : 'bg-black/40 text-white/70 border-white/10 hover:text-white hover:bg-black/60'
              }`}
              title={isAudioActive ? 'Silenciar atmósfera' : 'Activar atmósfera inmersiva'}
            >
              {isAudioActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span className="hidden sm:inline">{isAudioActive ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
            </button>

            {/* Direct 3-Scene Selector with Autoplay Progress Bar */}
            <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {[0, 1, 2].map((idx) => {
                const isActive = activeShot === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => jumpToShot(idx)}
                    className="relative cursor-pointer py-1"
                    title={`Saltar a Toma 0${idx + 1}`}
                    aria-label={`Toma 0${idx + 1}`}
                  >
                    <div
                      className={`relative overflow-hidden rounded-full transition-all ${
                        isActive
                          ? 'w-7 h-1.5 bg-white/20'
                          : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                      }`}
                    >
                      {isActive && (
                        <div
                          className="absolute inset-0 bg-[#C9A86A] transition-all"
                          style={{
                            width: flowMode === 'auto' ? `${autoplayProgress}%` : '100%',
                          }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayAll}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/80 hover:text-white p-2 rounded-full border border-white/10 transition-colors cursor-pointer"
              title={isPlaying ? 'Pausar video' : 'Reproducir video'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 3. INITIAL SCROLL HINT */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="relative z-20 flex flex-col items-center justify-center text-center pointer-events-none pb-4"
        >
          <div className="font-meta text-[10px] tracking-[0.3em] uppercase text-white/70 font-semibold mb-2">
            DESLIZA PARA NAVEGAR O ESPERA PARA REPRODUCCIÓN CONTINUA
          </div>
          <ChevronDown className="w-4 h-4 text-[#C9A86A] animate-bounce" />
        </motion.div>

        {/* 4. BOTTOM MINIMALIST FOOTER: TECHNICAL TELEMETRY & STRATEGIC CTAS */}
        <div className="relative z-30 max-w-7xl mx-auto px-6 w-full pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-auto">
          {/* Micro Blueprint Technical Crosshair */}
          <div className="flex flex-col text-[8.5px] sm:text-[9px] font-mono tracking-wider text-white/60">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A86A] animate-pulse" />
              <span className="text-white/40">TOMA 0{activeShot + 1}/03 ·</span>
              <span className="text-[#C9A86A] font-semibold">{CINEMATIC_VIDEOS[activeShot].cotaTag}</span>
            </div>
            <div className="text-white/40 pl-3.5 hidden md:block">
              {CINEMATIC_VIDEOS[activeShot].aspectTag}
            </div>
          </div>

          {/* Quick Access CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
            {onRequestDossier && (
              <button
                onClick={onRequestDossier}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[9.5px] font-meta tracking-wider uppercase rounded-full transition-all backdrop-blur-md border border-white/15 flex items-center space-x-1.5 cursor-pointer"
                title="Descargar Dossier Confidencial de Preventa"
              >
                <FileDown className="w-3 h-3 text-[#C9A86A]" />
                <span className="hidden xs:inline">DOSSIER PDF</span>
              </button>
            )}

            {onOpen3DModal && (
              <button
                onClick={onOpen3DModal}
                className="px-4 py-1.5 bg-[#8C7452]/90 hover:bg-[#8C7452] text-white text-[9.5px] font-meta tracking-wider uppercase rounded-full transition-all backdrop-blur-md border border-white/20 flex items-center space-x-1.5 cursor-pointer shadow-lg font-semibold"
              >
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>MAQUETA 3D</span>
              </button>
            )}

            {onExploreElevation && (
              <button
                onClick={onExploreElevation}
                className="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white text-[9.5px] font-meta tracking-wider uppercase rounded-full transition-all backdrop-blur-md border border-white/10 cursor-pointer"
              >
                COTAS
              </button>
            )}
          </div>
        </div>

        {/* 5. CINEMATIC OUTRO FADE TO RESIDENCIAS SECTION (Seamless transition from #070706 to #EFEBE0) */}
        <motion.div
          style={{ opacity: outroFadeOpacity }}
          className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#EFEBE0] via-[#EFEBE0]/20 to-transparent pointer-events-none z-40"
        />
      </div>
    </section>
  );
};
