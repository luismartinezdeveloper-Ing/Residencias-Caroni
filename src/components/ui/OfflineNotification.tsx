import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, Download, CheckCircle, X } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

export const OfflineNotification: React.FC = () => {
  const { isOnline, isInstallable, isPWAInstalled, promptInstall } = useOfflineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setIsDismissed(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const [isInstallDismissed, setIsInstallDismissed] = useState(false);

  useEffect(() => {
    // Check if previously dismissed in session
    try {
      if (sessionStorage.getItem('rc_pwa_install_dismissed') === 'true') {
        setIsInstallDismissed(true);
      }
    } catch (_) {}
  }, []);

  const handleDismissInstall = () => {
    setIsInstallDismissed(true);
    try {
      sessionStorage.setItem('rc_pwa_install_dismissed', 'true');
    } catch (_) {}
  };

  return (
    <div className="fixed top-20 right-4 z-[99990] flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {/* Offline Banner */}
        {!isOnline && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto bg-[#1B1813]/95 backdrop-blur-xl border border-[#8C7452] text-[#FAF9F6] p-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-meta text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                  Modo Sin Conexión
                </span>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="text-[#A6A092] hover:text-white p-1 rounded transition-colors"
                  aria-label="Cerrar aviso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-serif text-xs text-[#EFEBE0] mt-0.5 leading-snug">
                La información arquitectónica, planos, especificaciones y unidades se encuentran guardadas localmente para su consulta.
              </p>
            </div>
          </motion.div>
        )}

        {/* Back Online Reconnect Toast */}
        {showReconnected && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto bg-[#1B1813]/95 backdrop-blur-xl border border-emerald-500/60 text-[#FAF9F6] p-3 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Wifi className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-meta text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                Conexión Restablecida
              </span>
              <p className="font-serif text-[11px] text-[#C9C4B5] leading-none mt-0.5">
                Servicios interactivos y asesoría en vivo listos.
              </p>
            </div>
          </motion.div>
        )}

        {/* PWA Install Suggestion Pill (when supported & not installed & not dismissed) */}
        {isInstallable && !isPWAInstalled && !isInstallDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-auto bg-[#FAF9F6] border border-[#8C7452] text-[#1B1813] px-3.5 py-2 rounded-xl shadow-lg flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#8C7452]" />
              <span className="font-meta text-[9px] uppercase tracking-wider font-semibold">
                Instalar App Residencias Caroní
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => promptInstall()}
                className="bg-[#1B1813] hover:bg-[#8C7452] text-white px-2.5 py-1 rounded-lg font-meta text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Instalar
              </button>
              <button
                onClick={handleDismissInstall}
                className="text-[#8C7452] hover:text-[#1B1813] hover:bg-black/5 p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar sugerencia de instalación"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
