import { describe, it, expect } from 'vitest';
import {
  lerp,
  calculateSegmentTargetTime,
  VideoScrubberController,
} from '../videoScrubEngine';

describe('VideoScrubEngine - Inercia y Mapeo Cinemático de Scroll', () => {
  describe('lerp (Linear Interpolation)', () => {
    it('debe interpolar suavemente entre start y end', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.1)).toBeCloseTo(11, 4);
      expect(lerp(5, 5, 0.8)).toBe(5);
    });
  });

  describe('calculateSegmentTargetTime', () => {
    const duration = 10; // 10 segundos de video
    const start = 0.0;
    const end = 0.33;

    it('debe calcular el inicio exacto en 0s al inicio del segmento', () => {
      const target = calculateSegmentTargetTime(0.0, start, end, duration);
      expect(target).toBe(0);
    });

    it('debe calcular la mitad de la duración en el punto medio del segmento', () => {
      const mid = (start + end) / 2;
      const target = calculateSegmentTargetTime(mid, start, end, duration);
      expect(target).toBeCloseTo(5, 2);
    });

    it('debe alcanzar la duración máxima al llegar al final del segmento', () => {
      const target = calculateSegmentTargetTime(0.33, start, end, duration);
      expect(target).toBe(10);
    });

    it('debe respetar el clamping si el scroll está fuera del rango asignado', () => {
      // Scroll antes de que empiece la toma
      expect(calculateSegmentTargetTime(-0.1, start, end, duration)).toBe(0);
      // Scroll después de que termine la toma
      expect(calculateSegmentTargetTime(0.8, start, end, duration)).toBe(10);
    });

    it('debe protegerse ante duraciones inválidas o 0', () => {
      expect(calculateSegmentTargetTime(0.2, start, end, 0)).toBe(0);
      expect(calculateSegmentTargetTime(0.2, start, end, -5)).toBe(0);
      expect(calculateSegmentTargetTime(0.2, start, end, NaN)).toBe(0);
    });
  });

  describe('VideoScrubberController', () => {
    it('debe converger progresivamente hacia el targetTime con factor lerp', () => {
      const controller = new VideoScrubberController({ lerpFactor: 0.5 });
      controller.setTargetTime(10);

      // Simular un mock de video
      const mockVideo = {
        currentTime: 0,
        duration: 10,
      } as unknown as HTMLVideoElement;

      // Paso 1: 0 -> 5
      controller.update(mockVideo);
      expect(controller.getCurrentVirtualTime()).toBe(5);
      expect(mockVideo.currentTime).toBe(5);

      // Paso 2: 5 -> 7.5
      controller.update(mockVideo);
      expect(controller.getCurrentVirtualTime()).toBe(7.5);
      expect(mockVideo.currentTime).toBe(7.5);
    });

    it('no debe actualizar currentTime si la diferencia es menor al seekThreshold', () => {
      const controller = new VideoScrubberController({
        lerpFactor: 0.1,
        seekThreshold: 0.05,
      });
      controller.reset(4.0);
      controller.setTargetTime(4.02);

      const mockVideo = {
        currentTime: 4.0,
        duration: 10,
      } as unknown as HTMLVideoElement;

      controller.update(mockVideo);
      // La diferencia es < 0.05, por tanto no fuerza actualización del hardware
      expect(mockVideo.currentTime).toBe(4.0);
    });
  });
});
