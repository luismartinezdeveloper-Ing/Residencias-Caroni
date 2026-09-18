/**
 * Configuración y Helper de Activos Multimedia y CDN
 * Residencias Caroní · Altamira, Caracas
 * Ingeniería de Software: Ing. Luis Martinez
 */

/**
 * Devuelve la URL optimizada para un recurso multimedia.
 * Si existe VITE_MEDIA_CDN_URL (ej. en Cloudflare R2, AWS CloudFront o Google Cloud CDN),
 * redirige la petición al CDN global; de lo contrario, recurre a los activos estáticos locales.
 */
export function getMediaAssetUrl(relativePath: string): string {
  if (!relativePath) return '';

  // Si ya es una URL absoluta (http/https/blob/data), retornarla directamente
  if (/^(https?:|\/\/|blob:|data:)/i.test(relativePath)) {
    return relativePath;
  }

  // Leer variable de entorno en tiempo de ejecución / compilación de Vite
  const cdnBase = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_MEDIA_CDN_URL as string | undefined)
    : undefined;

  if (cdnBase && cdnBase.trim().length > 0) {
    const cleanBase = cdnBase.trim().replace(/\/+$/, '');
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${cleanBase}${cleanPath}`;
  }

  return relativePath;
}
