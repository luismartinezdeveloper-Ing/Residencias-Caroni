/**
 * Residencias Caroní · Altamira, Caracas
 * Motor Inercial de Video Scrubbing gobernado por Scroll
 * Inspirado en la técnica de suavizado de cámara cinematográfica continua
 * Software & Experiencia Interactiva: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 */

/**
 * Interpolación lineal suave (lerp) para amortiguar saltos entre el scroll físico y el decodificador de video
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Mapea el progreso de scroll normalizado [0, 1] dentro de un segmento asignado al tiempo objetivo del video en segundos
 * @param globalProgress Progreso total del contenedor (0 a 1)
 * @param segmentStart Inicio del segmento (ej. 0.0)
 * @param segmentEnd Fin del segmento (ej. 0.33)
 * @param duration Duración total del video en segundos
 */
export function calculateSegmentTargetTime(
  globalProgress: number,
  segmentStart: number,
  segmentEnd: number,
  duration: number
): number {
  if (!duration || isNaN(duration) || duration <= 0) return 0;

  // Clamping de progreso dentro de la ventana de la toma
  const clampedProgress = Math.max(segmentStart, Math.min(segmentEnd, globalProgress));
  const segmentLength = segmentEnd - segmentStart;

  if (segmentLength <= 0) return 0;

  const normalizedSegmentProgress = (clampedProgress - segmentStart) / segmentLength;
  const targetTime = normalizedSegmentProgress * duration;

  // Garantizar que nunca exceda los límites de duración del video
  return Math.max(0, Math.min(duration, targetTime));
}

export interface VideoScrubberOptions {
  lerpFactor?: number;
  seekThreshold?: number; // Diferencia mínima en segundos para disparar actualización del decodificador
}

/**
 * Controlador inercial para aplicar currentTime a un elemento HTMLVideoElement de forma suave a 60 FPS
 */
export class VideoScrubberController {
  private currentVirtualTime = 0;
  private targetTime = 0;
  private lerpFactor: number;
  private seekThreshold: number;

  constructor(options: VideoScrubberOptions = {}) {
    this.lerpFactor = options.lerpFactor ?? 0.28; // Respuesta ágil al scroll
    this.seekThreshold = options.seekThreshold ?? 0.04; // ~1 fotograma de umbral
  }

  public setTargetTime(time: number): void {
    if (!isNaN(time) && time >= 0) {
      this.targetTime = time;
    }
  }

  public reset(initialTime = 0): void {
    this.currentVirtualTime = initialTime;
    this.targetTime = initialTime;
  }

  private isSeeking = false;

  /**
   * Ejecuta un paso del ciclo de animación RAF actualizando el video solo si hay diferencia perceptible
   * y el decodificador no está bloqueado procesando un fotograma previo (video.seeking).
   */
  public update(video: HTMLVideoElement | null): void {
    if (!video || isNaN(video.duration) || video.duration <= 0) return;

    // Interpolar tiempo virtual hacia el tiempo objetivo del scroll con lerp ágil
    this.currentVirtualTime = lerp(this.currentVirtualTime, this.targetTime, this.lerpFactor);

    // Si el hardware ya está decodificando un fotograma previo, esperamos para evitar tirones
    if (video.seeking) return;

    const diff = Math.abs(video.currentTime - this.currentVirtualTime);
    if (diff > this.seekThreshold) {
      if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
        try {
          (video as any).fastSeek(this.currentVirtualTime);
        } catch {
          video.currentTime = this.currentVirtualTime;
        }
      } else {
        video.currentTime = this.currentVirtualTime;
      }
    }
  }

  public getCurrentVirtualTime(): number {
    return this.currentVirtualTime;
  }
}
