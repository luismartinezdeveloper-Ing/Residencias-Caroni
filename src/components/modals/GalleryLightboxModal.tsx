import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryItem } from '../../data/galleryData';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

interface GalleryLightboxModalProps {
  isOpen: boolean;
  item: GalleryItem | null;
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export const GalleryLightboxModal: React.FC<GalleryLightboxModalProps> = ({
  isOpen,
  item,
  items,
  currentIndex,
  onClose,
  onSelectIndex,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset states on item change
  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length]);

  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    const nextIndex = (currentIndex + 1) % items.length;
    onSelectIndex(nextIndex);
  }, [currentIndex, items.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onSelectIndex(prevIndex);
  }, [currentIndex, items.length, onSelectIndex]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.warn('Fullscreen not allowed:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0D0B09]/95 backdrop-blur-xl select-none"
      >
        {/* Top Floating Control Bar */}
        <header className="relative w-full h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between z-30 bg-gradient-to-b from-[#0D0B09]/90 to-transparent">
          {/* Left: Index & Category Badge */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="font-mono text-xs sm:text-sm text-[#8C7452] font-semibold tracking-wider">
              {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <span className="text-[#3A352C]">|</span>
            <span className="font-meta text-[10px] sm:text-xs text-[#FAF9F6]/80 tracking-[0.2em] uppercase font-medium">
              {item.categoryLabel}
            </span>
            {item.isVideo && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-[#8C7452]/20 border border-[#8C7452]/40 text-[#FAF9F6]">
                <Sparkles className="w-2.5 h-2.5 text-[#8C7452]" />
                <span>RECORRIDO CINEMATOGRÁFICO</span>
              </span>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-[#1B1813]/80 border border-[#FAF9F6]/10 rounded-full px-1.5 py-1 text-[#FAF9F6]/80 space-x-1">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.5))}
                disabled={zoomLevel <= 1}
                className="p-1.5 hover:text-[#FAF9F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Alejar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-[#8C7452] px-1 font-semibold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.5))}
                disabled={zoomLevel >= 2.5}
                className="p-1.5 hover:text-[#FAF9F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Acercar (Alta Resolución)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-[#1B1813]/80 border border-[#FAF9F6]/15 text-[#FAF9F6]/80 hover:text-[#FAF9F6] transition-all"
              title="Pantalla Completa"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-[#1B1813] border border-[#8C7452]/50 text-[#FAF9F6] hover:bg-[#8C7452] hover:text-[#1B1813] transition-all"
              title="Cerrar Visor (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Viewing Canvas */}
        <div className="relative flex-1 w-full flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-hidden">
          {/* High-Res Architectural Still Image (Unobstructed Max Viewport) */}
          <div
            className={`relative w-full h-full flex items-center justify-center transition-transform duration-300 ${
              zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing overflow-auto' : ''
            }`}
          >
            <motion.img
              key={item.id}
              src={item.image}
              alt={item.title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: zoomLevel }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="max-w-full max-h-[82vh] object-contain rounded-lg border border-[#FAF9F6]/10 shadow-2xl"
            />
          </div>

          {/* Left Nav Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-[#1B1813]/80 border border-[#FAF9F6]/15 text-[#FAF9F6] hover:bg-[#8C7452] hover:text-[#1B1813] transition-all transform hover:scale-105 z-30 shadow-xl cursor-pointer"
            title="Anterior (←)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right Nav Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-[#1B1813]/80 border border-[#FAF9F6]/15 text-[#FAF9F6] hover:bg-[#8C7452] hover:text-[#1B1813] transition-all transform hover:scale-105 z-30 shadow-xl cursor-pointer"
            title="Siguiente (→)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Bottom Clean Attribution & Title Bar */}
        <footer className="relative w-full h-12 sm:h-14 px-4 sm:px-8 flex items-center justify-between text-[10px] font-meta text-[#FAF9F6]/70 bg-gradient-to-t from-[#0D0B09]/90 to-transparent z-30">
          <div className="flex items-center space-x-2.5 truncate pr-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C7452] flex-shrink-0" />
            <span className="font-display text-sm sm:text-base text-[#FAF9F6] tracking-wide truncate">
              {item.title}
            </span>
            <span className="hidden sm:inline text-[#8C8678]">·</span>
            <span className="hidden sm:inline font-mono text-[10px] text-[#8C7452]">
              {item.cota}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[9px] uppercase tracking-widest text-[#8C8678] flex-shrink-0">
            <span className="hidden md:inline">Añil Arquitectura · Arq. J.C. Láncara</span>
            <span className="hidden md:inline text-[#FAF9F6]/20">|</span>
            <span className="text-[#8C7452]">Ing. Luis Martinez</span>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
