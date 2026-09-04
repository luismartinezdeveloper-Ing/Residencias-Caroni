# Instrucciones para Carga de Videos · Residencias Caroní

Para agregar tus videos a la landing page fluida con scroll (estilo Higgsfield), simplemente copia tus archivos de video en esta carpeta (`public/videos/`).

### Nombres y Formatos Sugeridos:
- **`public/videos/hero-reel.mp4`** (o `.webm`):
  - Video principal cinemático para la sección de scroll inmersivo.
  - **Resolución recomendada:** 1080p (1920x1080) o 4K (3840x2160).
  - **Códec:** H.264 o H.265 / AV1 (WebM).
  - **Frame Rate:** 24 fps o 30 fps para textura cinematográfica.
  - **Peso sugerido:** Entre 4 MB y 18 MB (optimizado para carga web instantánea).
  - **Pista de Audio:** Silenciada o sin audio para compatibilidad con autoplay en móviles.

- **`public/videos/hero-poster.webp`** (o `.jpg`):
  - Fotograma inicial del video para visualización instantánea mientras se descarga el primer buffer.

Cualquier cambio de nombre o ruta se puede personalizar directamente en la constante `VIDEO_CONFIG` dentro de `src/components/sections/CinematicScrollNarrative.tsx`.
