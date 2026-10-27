import React, { useRef, useState, useEffect } from 'react';
import { getMediaAssetUrl } from '../../config/mediaConfig';
import {
  Play,
  Pause,
  ChevronDown,
  Volume2,
  VolumeX,
} from 'lucide-react';

/**
 * Residencias Caroní · Altamira, Caracas
 * Hero Cinemático Principal (Ancho Total de Borde a Borde · Proporción 16:9 Natural sin Zoom)
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Desarrollo & Experiencia Interactiva: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */

const MASTER_FILM_SRC = getMediaAssetUrl('/videos/residencias_caroni_master_film.mp4');
const MASTER_FILM_POSTER = getMediaAssetUrl('/videos/residencias_caroni_master_film_poster.jpg');

interface CinematicScrollNarrativeProps {
  onOpen3DModal?: () => void;
  onExploreElevation?: () => void;
}

export const CinematicScrollNarrative: React.FC<CinematicScrollNarrativeProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);

  // Audio Context Ref (ambient fallback)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Precarga preventiva en memoria de GPU
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.load();
    }
  }, []);

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

  const togglePlay = () => {
    const vid = videoRef.current;
    if (vid) {
      if (vid.paused) {
        vid.play().catch(() => {});
        setIsPlaying(true);
      } else {
        vid.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
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

  return (
    <section id="obra" className="relative w-full bg-[#070706] text-[#FAF8F5]">
      {/* ========================================================================= */}
      {/* HERO CINEMÁTICO — ANCHO TOTAL DE BORDE A BORDE · PROPORCIÓN 16:9 NATURAL   */}
      {/* CERO ZOOM · CERO RECORTE · 100% NITIDEZ FULL HD NATIVA · SIN INFORMACIÓN  */}
      {/* ========================================================================= */}
      <div className="relative w-full aspect-video bg-[#070706] overflow-hidden select-none">
        {/* Master Film 1920x1080 a Ancho Completo */}
        <video
          ref={videoRef}
          src={MASTER_FILM_SRC}
          poster={MASTER_FILM_POSTER}
          autoPlay
          muted={!isAudioActive}
          playsInline
          preload="auto"
          loop
          className="w-full h-full object-cover object-center will-change-transform block"
        />

        {/* Sutil viñeta inferior para fundir de forma elegante con la sección siguiente */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#070706] to-transparent pointer-events-none" />

        {/* Controles Flotantes Discretos de Cine (Esquina Superior Derecha) */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30 flex items-center space-x-2 pointer-events-auto">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-[9.5px] font-mono tracking-wider uppercase transition-all cursor-pointer shadow-lg ${
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
            <span className="font-meta text-[9px] tracking-[0.28em] uppercase font-semibold">
              EXPLORAR GALERÍA
            </span>
            <ChevronDown className="w-4 h-4 text-[#C9A86A] animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
