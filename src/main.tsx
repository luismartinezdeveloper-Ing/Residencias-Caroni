import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/registerServiceWorker';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';

// Register Service Worker for offline PWA consultation
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      {/* Respeta "reducir movimiento" del sistema: sin transformaciones, solo cambios de opacidad */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </GlobalErrorBoundary>
  </StrictMode>,
);
