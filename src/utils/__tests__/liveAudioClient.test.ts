// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// @vitest-environment jsdom
import { LiveAudioClient } from '../liveAudioClient';

describe('LiveAudioClient Lifecycle & Resource Cleanup', () => {
  let mockMediaStream: any;
  let mockTrack: any;
  let mockAudioContext: any;
  let mockWebSocket: any;

  beforeEach(() => {
    mockTrack = {
      stop: vi.fn(),
      readyState: 'live',
    };

    mockMediaStream = {
      getTracks: vi.fn(() => [mockTrack]),
    };

    mockAudioContext = {
      state: 'running',
      close: vi.fn().mockResolvedValue(undefined),
      resume: vi.fn().mockResolvedValue(undefined),
      createMediaStreamSource: vi.fn(() => ({
        connect: vi.fn(),
      })),
      createAnalyser: vi.fn(() => ({
        fftSize: 64,
        connect: vi.fn(),
        getByteFrequencyData: vi.fn(),
      })),
      createScriptProcessor: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        onaudioprocess: null,
      })),
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(100)),
        duration: 0.1,
      })),
      createBufferSource: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
      })),
      destination: {},
      currentTime: 0,
    };

    // Mock AudioContext as constructible class
    class MockAudioContext {
      constructor() {
        return mockAudioContext;
      }
    }

    vi.stubGlobal('AudioContext', MockAudioContext);
    window.AudioContext = MockAudioContext as any;

    // Mock navigator.mediaDevices
    vi.stubGlobal('navigator', {
      ...navigator,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
      },
    });

    // Mock WebSocket as constructible class
    mockWebSocket = {
      readyState: 1, // OPEN
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    class MockWebSocket {
      constructor() {
        return mockWebSocket;
      }
    }
    vi.stubGlobal('WebSocket', MockWebSocket);
    window.WebSocket = MockWebSocket as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe inicializarse con estado desconectado', () => {
    const client = new LiveAudioClient();
    expect(client.getIsMuted()).toBe(false);
  });

  it('debe alternar mute correctamente con toggleMute()', () => {
    const client = new LiveAudioClient();
    expect(client.toggleMute()).toBe(true);
    expect(client.getIsMuted()).toBe(true);
    expect(client.toggleMute()).toBe(false);
    expect(client.getIsMuted()).toBe(false);
  });

  it('debe liberar todos los tracks de MediaStream y cerrar AudioContext al ejecutar disconnect()', async () => {
    const onStatusChange = vi.fn();
    const client = new LiveAudioClient({ onStatusChange });

    await client.connect('Contexto de prueba', 'Aoede');

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);

    // Desconectar
    client.disconnect();

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
    expect(mockWebSocket.close).toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenCalledWith('disconnected');
  });

  it('debe manejar rechazo de permisos de micrófono emitiendo error descriptivo', async () => {
    const onError = vi.fn();
    const onStatusChange = vi.fn();

    // Simular error NotAllowedError
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce({
      name: 'NotAllowedError',
      message: 'Permission denied',
    });

    const client = new LiveAudioClient({ onError, onStatusChange });
    await client.connect('Contexto de prueba');

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('Permiso de micrófono denegado')
    );
    expect(onStatusChange).toHaveBeenCalledWith('error');
  });
});
