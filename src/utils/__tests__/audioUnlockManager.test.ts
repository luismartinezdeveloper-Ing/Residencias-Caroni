// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioUnlockManager } from '../audioUnlockManager';

describe('audioUnlockManager - Reanudación Automática de AudioContext', () => {
  let mockAudioContext: any;

  beforeEach(() => {
    mockAudioContext = {
      state: 'suspended',
      resume: vi.fn().mockImplementation(async () => {
        mockAudioContext.state = 'running';
      }),
    };
  });

  it('debe registrar un contexto y reanudarlo cuando se invoque unlockAll()', async () => {
    audioUnlockManager.registerContext(mockAudioContext);

    await audioUnlockManager.unlockAll();

    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(mockAudioContext.state).toBe('running');
    expect(audioUnlockManager.getIsUnlocked()).toBe(true);

    audioUnlockManager.unregisterContext(mockAudioContext);
  });

  it('debe reanudar contextos al disparar un evento de usuario en window (touchstart)', async () => {
    const freshContext = {
      state: 'suspended',
      resume: vi.fn().mockImplementation(async () => {
        freshContext.state = 'running';
      }),
    };

    audioUnlockManager.registerContext(freshContext as any);

    window.dispatchEvent(new Event('touchstart'));

    // Esperar microtask de promesa
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(freshContext.resume).toHaveBeenCalled();
    audioUnlockManager.unregisterContext(freshContext as any);
  });
});
