// Client Audio & WebSocket Manager for Gemini Live API Real-Time Voice

export interface LiveAudioCallbacks {
  onStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error') => void;
  onUserTranscription?: (text: string) => void;
  onModelTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  onAudioLevel?: (level: number, source: 'user' | 'ai') => void;
}

export class LiveAudioClient {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private userAnalyser: AnalyserNode | null = null;
  private aiAnalyser: AnalyserNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextStartTime: number = 0;
  private isMuted: boolean = false;
  private isRunning: boolean = false;
  private callbacks: LiveAudioCallbacks = {};
  private animationFrameId: number | null = null;

  constructor(callbacks: LiveAudioCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: LiveAudioCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async connect(unitContext: string, voiceName: string = 'Aoede') {
    this.disconnect();
    this.isRunning = true;
    this.callbacks.onStatusChange?.('connecting');

    try {
      // 1. Request microphone permissions & media stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Initialize Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx();
      this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });

      if (this.inputAudioCtx.state === 'suspended') {
        try {
          await this.inputAudioCtx.resume();
        } catch (e) {
          console.warn('Could not resume input AudioContext:', e);
        }
      }
      if (this.outputAudioCtx.state === 'suspended') {
        try {
          await this.outputAudioCtx.resume();
        } catch (e) {
          console.warn('Could not resume output AudioContext:', e);
        }
      }

      // Setup AI Output Analyser
      this.aiAnalyser = this.outputAudioCtx.createAnalyser();
      this.aiAnalyser.fftSize = 64;
      this.aiAnalyser.connect(this.outputAudioCtx.destination);

      // 3. Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Send initial setup payload
        this.ws?.send(
          JSON.stringify({
            type: 'setup',
            context: unitContext,
            voiceName: voiceName,
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            this.callbacks.onStatusChange?.('connected');
            this.startMicRecording();
            this.startAudioVisualizerLoop();
          } else if (msg.type === 'audio' && msg.audio) {
            this.callbacks.onStatusChange?.('speaking');
            this.playAudioChunk(msg.audio);
          } else if (msg.type === 'outputTranscription' && msg.text) {
            this.callbacks.onModelTranscription?.(msg.text);
          } else if (msg.type === 'inputTranscription' && msg.text) {
            this.callbacks.onUserTranscription?.(msg.text);
          } else if (msg.type === 'interrupted') {
            this.stopAllPlayback();
            this.callbacks.onStatusChange?.('listening');
          } else if (msg.type === 'turnComplete') {
            this.callbacks.onStatusChange?.('listening');
          } else if (msg.type === 'error') {
            this.callbacks.onError?.(msg.error);
            this.callbacks.onStatusChange?.('error');
          } else if (msg.type === 'sessionClosed') {
            this.callbacks.onStatusChange?.('disconnected');
          }
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('Live WS Error:', err);
        this.callbacks.onError?.('Error de conexión WebSocket');
        this.callbacks.onStatusChange?.('error');
      };

      this.ws.onclose = () => {
        if (this.isRunning) {
          this.callbacks.onStatusChange?.('disconnected');
        }
      };
    } catch (err: any) {
      console.error('Failed to start Live Audio Client:', err);
      let errorMsg = 'No se pudo inicializar el micrófono o la conexión.';
      
      const isNotAllowed = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || err?.message?.includes('Permission');
      const isSecurityError = err?.name === 'SecurityError' || (typeof window !== 'undefined' && window.isSecureContext === false);

      if (isNotAllowed) {
        const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

        if (isIOS) {
          errorMsg = 'Permiso de micrófono denegado. En Safari: toca "aA" junto a la URL > Configuración de sitio web > Micrófono > Permitir.';
        } else if (isAndroid) {
          errorMsg = 'Permiso de micrófono denegado. En Chrome: toca el candado 🔒 junto a la URL > Permisos > Micrófono > Permitir.';
        } else {
          errorMsg = 'Permiso de micrófono denegado. Por favor, habilita el micrófono en los permisos de tu navegador.';
        }
      } else if (isSecurityError) {
        errorMsg = 'El navegador requiere conexión segura HTTPS para activar el micrófono.';
      }

      this.callbacks.onError?.(errorMsg);
      this.callbacks.onStatusChange?.('error');
      this.disconnect();
    }
  }

  private startMicRecording() {
    if (!this.inputAudioCtx || !this.mediaStream || !this.ws) return;

    const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
    this.userAnalyser = this.inputAudioCtx.createAnalyser();
    this.userAnalyser.fftSize = 64;

    // Buffer size 2048 or 4096 gives smooth streaming chunks
    const bufferSize = 2048;
    this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(bufferSize, 1, 1);

    source.connect(this.userAnalyser);
    this.userAnalyser.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioCtx.destination);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (this.isMuted || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const inputSampleRate = e.inputBuffer.sampleRate;

      // Resample Float32 buffer to 16000Hz PCM
      const pcm16 = this.downsampleTo16k(inputData, inputSampleRate);
      const base64Audio = this.arrayBufferToBase64(pcm16.buffer);

      this.ws.send(
        JSON.stringify({
          type: 'audio',
          audio: base64Audio,
        })
      );
    };
  }

  private downsampleTo16k(inputBuffer: Float32Array, inputSampleRate: number): Int16Array {
    if (inputSampleRate === 16000) {
      const output = new Int16Array(inputBuffer.length);
      for (let i = 0; i < inputBuffer.length; i++) {
        const s = Math.max(-1, Math.min(1, inputBuffer[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return output;
    }

    const sampleRateRatio = inputSampleRate / 16000;
    const newLength = Math.round(inputBuffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < inputBuffer.length; i++) {
        accum += inputBuffer[i];
        count++;
      }
      const avg = count > 0 ? accum / count : 0;
      const s = Math.max(-1, Math.min(1, avg));
      result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private arrayBufferToBase64(buffer: ArrayBufferLike): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private playAudioChunk(base64Audio: string) {
    if (!this.outputAudioCtx || !this.aiAnalyser) return;

    try {
      const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
      const int16Array = new Int16Array(arrayBuffer);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const sourceNode = this.outputAudioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(this.aiAnalyser);

      const currentTime = this.outputAudioCtx.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      sourceNode.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(sourceNode);

      sourceNode.onended = () => {
        const index = this.activeSources.indexOf(sourceNode);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.error('Error playing audio chunk:', err);
    }
  }

  private stopAllPlayback() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
  }

  private startAudioVisualizerLoop() {
    const userBuf = new Uint8Array(32);
    const aiBuf = new Uint8Array(32);

    const update = () => {
      if (!this.isRunning) return;

      let userLevel = 0;
      let aiLevel = 0;

      if (this.userAnalyser && !this.isMuted) {
        this.userAnalyser.getByteFrequencyData(userBuf);
        let sum = 0;
        for (let i = 0; i < userBuf.length; i++) sum += userBuf[i];
        userLevel = sum / (userBuf.length * 255);
      }

      if (this.aiAnalyser && this.activeSources.length > 0) {
        this.aiAnalyser.getByteFrequencyData(aiBuf);
        let sum = 0;
        for (let i = 0; i < aiBuf.length; i++) sum += aiBuf[i];
        aiLevel = sum / (aiBuf.length * 255);
      }

      if (aiLevel > 0.04) {
        this.callbacks.onAudioLevel?.(Math.min(1, aiLevel * 1.8), 'ai');
      } else if (userLevel > 0.04) {
        this.callbacks.onAudioLevel?.(Math.min(1, userLevel * 2.2), 'user');
      } else {
        this.callbacks.onAudioLevel?.(0, 'user');
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public disconnect() {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.stopAllPlayback();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.inputAudioCtx && this.inputAudioCtx.state !== 'closed') {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx && this.outputAudioCtx.state !== 'closed') {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }

    this.callbacks.onStatusChange?.('disconnected');
  }
}
