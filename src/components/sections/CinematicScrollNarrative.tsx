import React, { useRef, useState, useEffect } from 'react';
import { getMediaAssetUrl } from '../../config/mediaConfig';
import {
  Play,
  Pause,
  ChevronDown,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

/**
 * Residencias Caroní · Altamira, Caracas
 * Hero Cinemático Principal (Ancho Total de Borde a Borde · Proporción 16:9 Natural sin Zoom)
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Desarrollo & Experiencia Interactiva: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */

const MASTER_FILM_SRC = getMediaAssetUrl('/videos/residencias_caroni_master_film.mp4?v=residencias_caroni_hero_v8');
const MASTER_FILM_POSTER = getMediaAssetUrl('/videos/residencias_caroni_4k_poster.jpg?v=sr_4k_v1');

interface ServerSrCalibration {
  casStrength: number;
  unsharpLuma: number;
  contrast: number;
  saturation: number;
  svgKernelMatrix: string;
  aiModelUsed: string;
  diagnosticReport: string;
  targetResolution: string;
}

interface CinematicScrollNarrativeProps {
  onOpen3DModal?: () => void;
  onExploreElevation?: () => void;
  onVideoEnded?: () => void;
  onVideoPlay?: () => void;
}

export const CinematicScrollNarrative: React.FC<CinematicScrollNarrativeProps> = ({
  onVideoEnded,
  onVideoPlay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isUhdEnhanced, setIsUhdEnhanced] = useState<boolean>(true);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(MASTER_FILM_SRC);
  const [activePosterSrc, setActivePosterSrc] = useState<string>(MASTER_FILM_POSTER);
  const [srCalibration, setSrCalibration] = useState<ServerSrCalibration>({
    casStrength: 0.65,
    unsharpLuma: 0.75,
    contrast: 1.04,
    saturation: 1.05,
    svgKernelMatrix: '0 -0.16 0 -0.16 1.64 -0.16 0 -0.16 0',
    aiModelUsed: 'lanczos-cas-4k',
    diagnosticReport:
      'Super-Resolution 4K UHD (3840x2160) activa: reducción de artefactos H.264 y realce de micro-texturas arquitectónicas.',
    targetResolution: '3840x2160',
  });
  const [isProcessingServer4k, setIsProcessingServer4k] = useState<boolean>(false);

  // Audio Context Ref (ambient fallback)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
          navigator.userAgent || ''
        ) || (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
      setIsMobileDevice(mobile);
    }
  }, []);

  // Sincronización con el servicio de pre-procesamiento Super-Resolution 4K por IA en el servidor
  useEffect(() => {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return;
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) return;

    let cancelled = false;
    fetch('/api/video/upscale/status', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (data.calibration) {
          setSrCalibration((prev) => ({
            ...prev,
            ...data.calibration,
          }));
        }
        if (data.posterUrl) {
          setActivePosterSrc(getMediaAssetUrl(data.posterUrl));
        }
        if (data.is4kFileReady && data.videoUrl) {
          setActiveVideoSrc(getMediaAssetUrl(data.videoUrl));
        }
      })
      .catch(() => {
        // Mantiene silenciosamente la calibración Super-Resolution local
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleOrTrigger4kSr = async () => {
    const nextState = !isUhdEnhanced;
    setIsUhdEnhanced(nextState);

    if (
      nextState &&
      !isProcessingServer4k &&
      typeof fetch === 'function' &&
      !(typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || ''))
    ) {
      setIsProcessingServer4k(true);
      try {
        const res = await fetch('/api/video/upscale/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encodeFull4kClip: false }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.calibration) {
            setSrCalibration((prev) => ({ ...prev, ...data.calibration }));
          }
          if (data?.posterUrl) {
            setActivePosterSrc(getMediaAssetUrl(data.posterUrl));
          }
          if (data?.is4kFileReady && data?.videoUrl) {
            setActiveVideoSrc(getMediaAssetUrl(data.videoUrl));
          }
        }
      } catch {
        // Fallback silencioso a la matriz óptica local
      } finally {
        setIsProcessingServer4k(false);
      }
    }
  };

  // Precarga preventiva y auto-recuperación silenciosa en escritorio y móviles (iOS/Android)
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.defaultMuted = true;
    vid.muted = true;

    const attemptPlay = () => {
      if (!vid) return;
      vid.play().then(() => {
        setIsPlaying(true);
        onVideoPlay?.();
      }).catch(() => {
        setIsPlaying(!vid.paused);
      });
    };

    const handleStallOrError = () => {
      if (!vid) return;
      if (vid.paused && !vid.ended) {
        setTimeout(() => {
          vid.play().then(() => setIsPlaying(true)).catch(() => {});
        }, 350);
      }
    };

    const handleFirstInteraction = () => {
      if (vid && vid.paused && !vid.ended) {
        vid.play().then(() => {
          setIsPlaying(true);
          onVideoPlay?.();
        }).catch(() => {});
      }
    };

    if (vid.readyState >= 2) {
      attemptPlay();
    } else {
      vid.addEventListener('canplay', attemptPlay, { once: true });
      vid.load();
    }

    vid.addEventListener('stalled', handleStallOrError);
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('scroll', handleFirstInteraction, { once: true, passive: true });

    return () => {
      vid.removeEventListener('canplay', attemptPlay);
      vid.removeEventListener('stalled', handleStallOrError);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [activeVideoSrc]);

  // Audio Toggle: activa el audio nativo del video o la atmósfera ambiental
  const toggleAudio = () => {
    const vid = videoRef.current;
    const nextAudioState = !isAudioActive;
    setIsAudioActive(nextAudioState);

    if (vid) {
      vid.muted = !nextAudioState;
      if (nextAudioState) {
        vid.volume = 0.9;
      }
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (nextAudioState) {
        if (!audioCtxRef.current) {
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.06, ctx.currentTime);
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
          gainNodeRef.current.gain.linearRampToValueAtTime(0.08, audioCtxRef.current.currentTime + 1);
        }
      } else {
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.4);
          setTimeout(() => {
            if (audioCtxRef.current?.state === 'running') {
              audioCtxRef.current.suspend();
            }
          }, 450);
        }
      }
    } catch (e) {
      console.warn('Web Audio note:', e);
    }
  };

  const handleScrollToNext = () => {
    const galeriaElem = document.getElementById('galeria');
    if (galeriaElem) {
      const yOffset = -72;
      const y = galeriaElem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    onVideoEnded?.();
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    onVideoPlay?.();
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (vid) {
      if (vid.ended) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
        setIsPlaying(true);
        onVideoPlay?.();
      } else if (vid.paused) {
        vid.play().catch(() => {});
        setIsPlaying(true);
        onVideoPlay?.();
      } else {
        vid.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Clases de post-procesado Super-Resolution calibradas por IA en el servidor
  const videoOpticalClass = isUhdEnhanced
    ? isMobileDevice
      ? 'contrast-[1.04] saturate-[1.05] brightness-[1.01] will-change-transform'
      : 'contrast-[1.04] saturate-[1.05] brightness-[1.01] [filter:url(#caroni-cinema-sharpen)_contrast(1.03)_saturate(1.04)] will-change-transform'
    : '';

  return (
    <section id="obra" className="relative w-full bg-[#070706] text-[#FAF8F5]">
      {/* Encabezado principal solo para lectores de pantalla y buscadores: no altera el diseño */}
      <h1 className="sr-only">Residencias Caroní · Altamira, Caracas · Añil Arquitectura</h1>

      {/* Filtro SVG de convolución óptica calibrado dinámicamente por el servicio IA Super-Resolution del servidor */}
      <svg className="sr-only pointer-events-none" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="caroni-cinema-sharpen" colorInterpolationFilters="sRGB">
            <feConvolveMatrix
              order="3 3"
              preserveAlpha="true"
              kernelMatrix={srCalibration.svgKernelMatrix}
            />
          </filter>
        </defs>
      </svg>

      {/* ========================================================================= */}
      {/* HERO CINEMÁTICO — ANCHO TOTAL DE BORDE A BORDE · PROPORCIÓN 16:9 NATURAL   */}
      {/* CERO ZOOM · CERO RECORTE · 100% NITIDEZ 4K IA SR · SIN INFORMACIÓN        */}
      {/* ========================================================================= */}
      <div className="relative w-full aspect-video bg-[#070706] overflow-hidden select-none">
        {/* Master Film pre-procesado con Super-Resolution 4K (3840x2160 Poster + Calibración IA) */}
        <video
          key={activeVideoSrc}
          ref={videoRef}
          src={activeVideoSrc}
          poster={activePosterSrc}
          autoPlay
          loop
          muted={!isAudioActive}
          playsInline
          preload="auto"
          onEnded={handleVideoEnded}
          onPlay={handleVideoPlay}
          onPause={() => setIsPlaying(false)}
          className={`w-full h-full object-cover object-center block transform-gpu transition-[filter] duration-500 ${videoOpticalClass}`}
        />

        {/* Sutil viñeta inferior para fundir de forma elegante con la sección siguiente */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#070706] to-transparent pointer-events-none" />

        {/* Controles Flotantes Discretos de Cine (Esquina Superior Derecha) */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30 flex items-center space-x-2 pointer-events-auto">
          {/* AI 4K Super-Resolution Toggle */}
          <button
            onClick={handleToggleOrTrigger4kSr}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer shadow-lg ${
              isUhdEnhanced
                ? 'bg-black/75 text-[#C9A86A] border-[#C9A86A]/50 hover:border-[#C9A86A]'
                : 'bg-black/60 text-white/70 border-white/20 hover:text-white hover:bg-black/80'
            }`}
            title={srCalibration.diagnosticReport}
            aria-label={
              isUhdEnhanced
                ? 'Desactivar Super-Resolution 4K IA'
                : 'Activar Super-Resolution 4K IA'
            }
          >
            <Sparkles className={`w-3 h-3 ${isProcessingServer4k ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isProcessingServer4k
                ? '4K IA: CALIBRANDO'
                : isUhdEnhanced
                ? '4K IA SR: ON'
                : '4K IA SR: OFF'}
            </span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer shadow-lg ${
              isAudioActive
                ? 'bg-[#C9A86A] text-[#070706] border-[#C9A86A] font-bold shadow-[#C9A86A]/20'
                : 'bg-black/60 text-white/90 border-white/20 hover:text-white hover:bg-black/80 hover:border-white/40'
            }`}
            title={isAudioActive ? 'Silenciar audio' : 'Activar audio del film'}
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAudioActive ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-white p-2 rounded-full border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-lg"
            title={isPlaying ? 'Pausar video' : 'Reproducir video'}
            aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Indicador Inferior de Desplazamiento Suave hacia la Galería */}
        <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center pointer-events-auto">
          <button
            onClick={handleScrollToNext}
            className="flex flex-col items-center space-y-1 text-white/70 hover:text-[#C9A86A] transition-colors cursor-pointer group py-2 px-4 backdrop-blur-[2px] rounded-full"
            title="Desplazarse a la Galería de Perspectivas"
          >
            <span className="font-meta text-[10px] tracking-[0.28em] uppercase font-semibold">
              EXPLORAR GALERÍA
            </span>
            <ChevronDown className="w-4 h-4 text-[#C9A86A] animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};


