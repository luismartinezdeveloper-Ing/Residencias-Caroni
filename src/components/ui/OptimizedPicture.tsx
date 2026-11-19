import React, { useEffect, useRef, useState } from 'react';
import { getMediaAssetUrl } from '../../config/mediaConfig';

export interface ModernImageSources {
  avif: string;
  webp: string;
  fallback: string;
  hasModernVariants: boolean;
}

/**
 * Deriva las variantes AVIF y WebP conservando los parámetros de versión (?v=...)
 * y aplicando la resolución de CDN configurada en mediaConfig.
 */
export function getModernImageSources(src: string): ModernImageSources {
  if (!src) {
    return { avif: '', webp: '', fallback: '', hasModernVariants: false };
  }

  const isRasterSiblingCandidate = /\.(jpe?g|png)(\?.*)?$/i.test(src);
  if (!isRasterSiblingCandidate || /^(blob:|data:)/i.test(src)) {
    const resolved = getMediaAssetUrl(src);
    return {
      avif: resolved,
      webp: resolved,
      fallback: resolved,
      hasModernVariants: false,
    };
  }

  const avifPath = src.replace(/\.(jpe?g|png)(\?.*)?$/i, '.avif$2');
  const webpPath = src.replace(/\.(jpe?g|png)(\?.*)?$/i, '.webp$2');

  return {
    avif: getMediaAssetUrl(avifPath),
    webp: getMediaAssetUrl(webpPath),
    fallback: getMediaAssetUrl(src),
    hasModernVariants: true,
  };
}

export interface OptimizedPictureProps {
  src: string;
  alt: string;
  priority?: boolean;
  rootMargin?: string;
  className?: string;
  pictureClassName?: string;
  wrapperClassName?: string;
  style?: React.CSSProperties;
  imgRef?: React.RefObject<HTMLImageElement | null> | React.RefCallback<HTMLImageElement>;
  draggable?: boolean;
  disableWrapper?: boolean;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onMouseMove?: React.MouseEventHandler<HTMLImageElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLImageElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLImageElement>;
}

/**
 * OptimizedPicture — Carga Diferida con IntersectionObserver + Formatos AVIF/WebP (<picture>)
 * Residencias Caroní · Ingeniería de Software: Ing. Luis Martinez
 */
export const OptimizedPicture: React.FC<OptimizedPictureProps> = ({
  src,
  alt,
  priority = false,
  rootMargin = '250px 0px',
  className = '',
  pictureClassName = 'contents',
  wrapperClassName = 'relative w-full h-full',
  style,
  imgRef,
  draggable = false,
  disableWrapper = false,
  onLoad,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
}) => {
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState<boolean>(
    () => priority || typeof IntersectionObserver === 'undefined'
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const sources = getModernImageSources(src);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (isInView) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const target = observerTargetRef.current;
    if (!target) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [priority, rootMargin, isInView]);

  const assignImgRef = (node: HTMLImageElement | null) => {
    if (!imgRef) return;
    if (typeof imgRef === 'function') {
      imgRef(node);
    } else {
      (imgRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
    }
  };

  const handleImageLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const pictureElement = (
    <picture className={pictureClassName}>
      {sources.hasModernVariants && (
        <>
          <source type="image/avif" srcSet={sources.avif} />
          <source type="image/webp" srcSet={sources.webp} />
        </>
      )}
      <img
        ref={assignImgRef}
        src={sources.fallback}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={draggable}
        onLoad={handleImageLoad}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={style}
        className={`${className} transition-opacity duration-500 ${
          isLoaded || priority || disableWrapper ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </picture>
  );

  if (disableWrapper) {
    return pictureElement;
  }

  return (
    <div ref={observerTargetRef} className={wrapperClassName}>
      {!isLoaded && !priority && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#EFEBE0] via-[#E5DFD0] to-[#EFEBE0] animate-pulse pointer-events-none"
        />
      )}
      {isInView && pictureElement}
    </div>
  );
};
