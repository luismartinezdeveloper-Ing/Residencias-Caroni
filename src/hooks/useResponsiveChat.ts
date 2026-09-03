import { useState, useEffect } from 'react';

export interface ResponsiveChatState {
  isMobile: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isShortScreen: boolean;
  width: number;
  height: number;
  viewportHeight: number;
  keyboardOpen: boolean;
}

export function useResponsiveChat(): ResponsiveChatState {
  const [layout, setLayout] = useState<ResponsiveChatState>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const h = typeof window !== 'undefined' ? window.innerHeight : 768;
    const vh = typeof window !== 'undefined' && window.visualViewport ? window.visualViewport.height : h;

    return {
      isMobile: w < 640,
      isTablet: w >= 640 && w < 1024,
      isLandscape: w > h && h < 600,
      isShortScreen: h < 620,
      width: w,
      height: h,
      viewportHeight: vh,
      keyboardOpen: vh < h * 0.8,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const vh = window.visualViewport ? window.visualViewport.height : h;
      const isKeyboard = vh < h * 0.8;

      setLayout({
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
        isLandscape: w > h && h < 600,
        isShortScreen: h < 620,
        width: w,
        height: h,
        viewportHeight: vh,
        keyboardOpen: isKeyboard,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize, { passive: true });
      window.visualViewport.addEventListener('scroll', handleResize, { passive: true });
    }

    // Call once to ensure accurate layout
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  return layout;
}
