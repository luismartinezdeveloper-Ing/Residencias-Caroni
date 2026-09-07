// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
// @vitest-environment jsdom
import { VoiceNavigationController } from '../voiceNavigationController';

describe('VoiceNavigationController - Parsing de Comandos y Resiliencia', () => {
  let controller: VoiceNavigationController;

  beforeEach(() => {
    // Entorno jsdom sin Web Speech nativo por defecto
    controller = new VoiceNavigationController();
  });

  it('debe reportar correctamente el soporte de Web Speech API', () => {
    // En jsdom sin mock es false
    expect(controller.getSupported()).toBe(false);
    expect(controller.getIsListening()).toBe(false);
  });

  it('debe parsear correctamente comandos de modo de vista (despiece / ensamblado)', () => {
    const cmdExploded = controller.parseNaturalCommand('despiece vertical de los pisos');
    expect(cmdExploded.type).toBe('SET_VIEW_MODE');
    if (cmdExploded.type === 'SET_VIEW_MODE') {
      expect(cmdExploded.mode).toBe('exploded');
    }

    const cmdAssembled = controller.parseNaturalCommand('mostrar edificio completo ensamblado');
    expect(cmdAssembled.type).toBe('SET_VIEW_MODE');
    if (cmdAssembled.type === 'SET_VIEW_MODE') {
      expect(cmdAssembled.mode).toBe('assembled');
    }
  });

  it('debe parsear comandos de simulación solar (mañana, atardecer, noche)', () => {
    const cmdNight = controller.parseNaturalCommand('iluminación nocturna');
    expect(cmdNight.type).toBe('SET_SOLAR_MODE');
    if (cmdNight.type === 'SET_SOLAR_MODE') {
      expect(cmdNight.mode).toBe('night');
    }

    const cmdGolden = controller.parseNaturalCommand('modo atardecer en el ávila');
    expect(cmdGolden.type).toBe('SET_SOLAR_MODE');
    if (cmdGolden.type === 'SET_SOLAR_MODE') {
      expect(cmdGolden.mode).toBe('golden');
    }
  });

  it('debe parsear comandos de zoom y reseteo de cámara', () => {
    const cmdZoomIn = controller.parseNaturalCommand('acercar vista');
    expect(cmdZoomIn.type).toBe('ZOOM');
    if (cmdZoomIn.type === 'ZOOM') {
      expect(cmdZoomIn.direction).toBe('in');
    }

    const cmdReset = controller.parseNaturalCommand('restablecer vista');
    expect(cmdReset.type).toBe('RESET_VIEW');
  });

  it('debe manejar entradas incomprensibles retornando UNKNOWN sin lanzar excepciones', () => {
    const cmdUnknown = controller.parseNaturalCommand('palabra inventada xyz 12345');
    expect(cmdUnknown.type).toBe('UNKNOWN');
    if (cmdUnknown.type === 'UNKNOWN') {
      expect(cmdUnknown.transcript).toBe('palabra inventada xyz 12345');
    }
  });
});
