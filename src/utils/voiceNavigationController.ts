// Speech Recognition and Voice Navigation Controller for 3D & 360 Tour Viewers

export type VoiceNavigationCommand =
  // 3D Building Views
  | { type: 'SET_VIEW_MODE'; mode: 'assembled' | 'exploded' | 'tour360' | 'floorplan' | 'pricing'; label: string }
  // Tour 360 Rooms
  | { type: 'GO_TO_ROOM'; roomId: string; roomName: string }
  // Solar / Lighting Simulation
  | { type: 'SET_SOLAR_MODE'; mode: 'morning' | 'golden' | 'night'; label: string }
  // Camera Views
  | { type: 'SET_CAMERA_VIEW'; view: 'iso' | 'north' | 'south' | 'top'; label: string }
  // Rotation
  | { type: 'TOGGLE_ROTATION'; state?: boolean; label: string }
  // Zoom
  | { type: 'ZOOM'; direction: 'in' | 'out' | 'reset'; label: string }
  // VR & Immersion
  | { type: 'TOGGLE_VR'; label: string }
  // Audio Ambiance
  | { type: 'TOGGLE_AUDIO'; state?: boolean; label: string }
  // Select Specific Unit
  | { type: 'SELECT_UNIT'; unitId: string; unitName: string }
  // Reset / Help
  | { type: 'RESET_VIEW'; label: string }
  | { type: 'OPEN_ADVISOR'; label: string }
  | { type: 'UNKNOWN'; transcript: string };

export interface VoiceFeedback {
  transcript: string;
  matchedCommand: VoiceNavigationCommand | null;
  confidence: number;
  timestamp: number;
}

export class VoiceNavigationController {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private onCommandCallback?: (command: VoiceNavigationCommand, rawTranscript: string) => void;
  private onFeedbackCallback?: (feedback: VoiceFeedback) => void;
  private onListeningChangeCallback?: (isListening: boolean) => void;
  private onErrorCallback?: (error: string) => void;
  private keepAlive: boolean = false;
  private audioFeedbackCtx: AudioContext | null = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (SpeechRecognition) {
      this.isSupported = true;
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-ES'; // Spanish primary with natural fallback
        this.recognition.maxAlternatives = 3;

        this.setupRecognitionEvents();
      } catch (err) {
        console.warn('VoiceNavigationController init error:', err);
        this.isSupported = false;
      }
    }
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public setCallbacks(callbacks: {
    onCommand?: (command: VoiceNavigationCommand, rawTranscript: string) => void;
    onFeedback?: (feedback: VoiceFeedback) => void;
    onListeningChange?: (isListening: boolean) => void;
    onError?: (error: string) => void;
  }) {
    if (callbacks.onCommand) this.onCommandCallback = callbacks.onCommand;
    if (callbacks.onFeedback) this.onFeedbackCallback = callbacks.onFeedback;
    if (callbacks.onListeningChange) this.onListeningChangeCallback = callbacks.onListeningChange;
    if (callbacks.onError) this.onErrorCallback = callbacks.onError;
  }

  private setupRecognitionEvents() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onListeningChangeCallback?.(true);
      this.playChime('start');
    };

    this.recognition.onend = () => {
      if (this.keepAlive) {
        try {
          this.recognition.start();
          return;
        } catch {
          // Ignore retry failure
        }
      }
      this.isListening = false;
      this.onListeningChangeCallback?.(false);
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.keepAlive = false;
        this.isListening = false;
        this.onListeningChangeCallback?.(false);
        this.onErrorCallback?.('Permiso de micrófono no otorgado');
      } else if (event.error === 'no-speech' || event.error === 'aborted') {
        // Standard silence timeout or manual abort, keep calm without console noise
      } else {
        this.onErrorCallback?.(`Error de voz: ${event.error}`);
      }
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0.85;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        const text = res[0].transcript;
        if (res.isFinal) {
          finalTranscript += text;
          bestConfidence = res[0].confidence || 0.9;
        } else {
          interimTranscript += text;
        }
      }

      const activeText = (finalTranscript || interimTranscript).trim().toLowerCase();
      if (!activeText) return;

      const parsedCommand = this.parseNaturalCommand(activeText);

      this.onFeedbackCallback?.({
        transcript: activeText,
        matchedCommand: parsedCommand.type !== 'UNKNOWN' ? parsedCommand : null,
        confidence: bestConfidence,
        timestamp: Date.now(),
      });

      // If we got a conclusive command on final speech or high-confidence interim
      if (parsedCommand.type !== 'UNKNOWN') {
        this.playChime('success');
        this.onCommandCallback?.(parsedCommand, activeText);
      }
    };
  }

  public parseNaturalCommand(text: string): VoiceNavigationCommand {
    const clean = text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents for robust matching
      .trim();

    // 1. Navigation to Tour 360 Rooms
    if (
      clean.includes('cocina') ||
      clean.includes('ir a la cocina') ||
      clean.includes('ver cocina') ||
      clean.includes('gourmet') ||
      clean.includes('cava')
    ) {
      return { type: 'GO_TO_ROOM', roomId: 'cocina', roomName: 'Cocina Gourmet & Cava' };
    }

    if (
      clean.includes('salon') ||
      clean.includes('sala') ||
      clean.includes('living') ||
      clean.includes('comedor') ||
      clean.includes('gran salon') ||
      clean.includes('ir al salon')
    ) {
      return { type: 'GO_TO_ROOM', roomId: 'salon', roomName: 'Gran Salón & Comedor' };
    }

    if (
      clean.includes('terraza') ||
      clean.includes('balcon') ||
      clean.includes('mirador') ||
      clean.includes('deck') ||
      clean.includes('asador') ||
      clean.includes('salir a la terraza') ||
      clean.includes('ir a la terraza')
    ) {
      return { type: 'GO_TO_ROOM', roomId: 'terraza', roomName: 'Terraza Panorámica' };
    }

    if (
      clean.includes('master') ||
      clean.includes('habitacion') ||
      clean.includes('suite') ||
      clean.includes('dormitorio') ||
      clean.includes('cuarto principal') ||
      clean.includes('recamara')
    ) {
      return { type: 'GO_TO_ROOM', roomId: 'master', roomName: 'Master Suite & Balcón' };
    }

    // 2. View Modes: Exploded / Assembled / 360 / Floorplan / Pricing
    if (
      clean.includes('explosion') ||
      clean.includes('modo explosion') ||
      clean.includes('despiece') ||
      clean.includes('desarmar') ||
      clean.includes('separar pisos') ||
      clean.includes('estratos') ||
      clean.includes('niveles')
    ) {
      return { type: 'SET_VIEW_MODE', mode: 'exploded', label: 'Modo Despiece Vertical' };
    }

    if (
      clean.includes('monolito') ||
      clean.includes('monolitico') ||
      clean.includes('modo monolito') ||
      clean.includes('modo monolitico') ||
      clean.includes('ensamblado') ||
      clean.includes('edificio completo') ||
      clean.includes('unir pisos') ||
      clean.includes('armar') ||
      clean.includes('cerrar explosion') ||
      clean.includes('cerrar despiece') ||
      clean.includes('vista general') ||
      clean.includes('fachada principal') ||
      (clean.includes('fachada') && !clean.includes('sur') && !clean.includes('norte') && !clean.includes('avila'))
    ) {
      return { type: 'SET_VIEW_MODE', mode: 'assembled', label: 'Modo Monolítico' };
    }

    if (
      clean.includes('tour') ||
      clean.includes('tour 360') ||
      clean.includes('360') ||
      clean.includes('interiores') ||
      clean.includes('entrar al apartamento') ||
      clean.includes('vista interior')
    ) {
      return { type: 'SET_VIEW_MODE', mode: 'tour360', label: 'Tour 360° Interiores' };
    }

    if (
      clean.includes('plano') ||
      clean.includes('plano 2d') ||
      clean.includes('plantas') ||
      clean.includes('distribucion') ||
      clean.includes('arquitectura')
    ) {
      return { type: 'SET_VIEW_MODE', mode: 'floorplan', label: 'Planta Arquitectónica 2D' };
    }

    if (
      clean.includes('precio') ||
      clean.includes('precios') ||
      clean.includes('costo') ||
      clean.includes('valor') ||
      clean.includes('cotizacion') ||
      clean.includes('preventa') ||
      clean.includes('lista de precios')
    ) {
      return { type: 'SET_VIEW_MODE', mode: 'pricing', label: 'Portal de Precios & Preventa' };
    }

    // 3. Solar Time Simulation (Mañana, Golden Hour / Tarde / Atardecer, Noche)
    if (
      clean.includes('manana') ||
      clean.includes('sol') ||
      clean.includes('dia') ||
      clean.includes('amanecer') ||
      clean.includes('10 am') ||
      clean.includes('modo dia')
    ) {
      return { type: 'SET_SOLAR_MODE', mode: 'morning', label: '10:00 AM · Sol Matutino' };
    }

    if (
      clean.includes('dorada') ||
      clean.includes('golden') ||
      clean.includes('atardecer') ||
      clean.includes('ocaso') ||
      clean.includes('tarde') ||
      clean.includes('5:30') ||
      clean.includes('hora dorada')
    ) {
      return { type: 'SET_SOLAR_MODE', mode: 'golden', label: '5:30 PM · Hora Dorada' };
    }

    if (
      clean.includes('noche') ||
      clean.includes('nocturno') ||
      clean.includes('nocturna') ||
      clean.includes('luz calida') ||
      clean.includes('8:30') ||
      clean.includes('modo noche') ||
      clean.includes('luna')
    ) {
      return { type: 'SET_SOLAR_MODE', mode: 'night', label: '8:30 PM · Noche de Gala' };
    }

    // 4. Camera Orientations (Isometric, Norte / Ávila, Sur / Valle, Cenital / Superior)
    if (
      clean.includes('norte') ||
      clean.includes('avila') ||
      clean.includes('ver el avila') ||
      clean.includes('montana')
    ) {
      return { type: 'SET_CAMERA_VIEW', view: 'north', label: 'Fachada Norte · Frente al Ávila' };
    }

    if (
      clean.includes('sur') ||
      clean.includes('valle') ||
      clean.includes('ciudad') ||
      clean.includes('fachada sur')
    ) {
      return { type: 'SET_CAMERA_VIEW', view: 'south', label: 'Fachada Sur · Valle de Caracas' };
    }

    if (
      clean.includes('arriba') ||
      clean.includes('techo') ||
      clean.includes('cenital') ||
      clean.includes('superior') ||
      clean.includes('planta') ||
      clean.includes('desde arriba')
    ) {
      return { type: 'SET_CAMERA_VIEW', view: 'top', label: 'Vista Cenital / Superior' };
    }

    if (
      clean.includes('isometrica') ||
      clean.includes('perspectiva') ||
      clean.includes('diagonal') ||
      clean.includes('angulo principal')
    ) {
      return { type: 'SET_CAMERA_VIEW', view: 'iso', label: 'Perspectiva Isométrica' };
    }

    // 5. Rotation & Movement
    if (
      clean.includes('girar') ||
      clean.includes('rotar') ||
      clean.includes('auto rotar') ||
      clean.includes('iniciar rotacion') ||
      clean.includes('dar vuelta')
    ) {
      return { type: 'TOGGLE_ROTATION', state: true, label: 'Iniciar Rotación Continua' };
    }

    if (
      clean.includes('parar') ||
      clean.includes('detener') ||
      clean.includes('pausar rotacion') ||
      clean.includes('alto') ||
      clean.includes('quieto')
    ) {
      return { type: 'TOGGLE_ROTATION', state: false, label: 'Detener Rotación' };
    }

    // 6. Zoom
    if (clean.includes('acercar') || clean.includes('zoom in') || clean.includes('mas cerca')) {
      return { type: 'ZOOM', direction: 'in', label: 'Acercar Cámara (+)' };
    }

    if (clean.includes('alejar') || clean.includes('zoom out') || clean.includes('mas lejos')) {
      return { type: 'ZOOM', direction: 'out', label: 'Alejar Cámara (-)' };
    }

    // 7. Virtual Reality Mode
    if (clean.includes('realidad virtual') || clean.includes('vr') || clean.includes('gafas') || clean.includes('visor')) {
      return { type: 'TOGGLE_VR', label: 'Realidad Virtual VR' };
    }

    // 8. Audio Ambiance
    if (clean.includes('musica') || clean.includes('sonido') || clean.includes('audio') || clean.includes('ambiente') || clean.includes('brisa')) {
      return { type: 'TOGGLE_AUDIO', label: 'Alternar Sonido Ambiental' };
    }

    // 9. Reset View & Advisor
    if (clean.includes('reiniciar') || clean.includes('restablecer') || clean.includes('inicio') || clean.includes('reset')) {
      return { type: 'RESET_VIEW', label: 'Restablecer Vista Original' };
    }

    if (clean.includes('asesor') || clean.includes('asistente') || clean.includes('ayuda') || clean.includes('chat') || clean.includes('preguntar')) {
      return { type: 'OPEN_ADVISOR', label: 'Consultar Asesor Inmobiliario IA' };
    }

    // 10. Specific Units Selection (P2-A, P3-B, Penthouse, etc.)
    if (clean.includes('penthouse') || clean.includes('ph') || clean.includes('mirador')) {
      return { type: 'SELECT_UNIT', unitId: 'PH-A', unitName: 'Penthouse Mirador' };
    }

    if (clean.includes('planta baja') || clean.includes('jardin') || clean.includes('pb')) {
      return { type: 'SELECT_UNIT', unitId: 'PB-A', unitName: 'Residencia Jardín PB-A' };
    }

    return { type: 'UNKNOWN', transcript: text };
  }

  public async startListening(): Promise<boolean> {
    if (!this.isSupported || !this.recognition) {
      this.onErrorCallback?.('El reconocimiento por voz no está disponible en este navegador.');
      return false;
    }

    try {
      this.keepAlive = true;
      this.recognition.start();
      return true;
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        // Already started
        return true;
      }
      console.warn('SpeechRecognition start failed:', err);
      this.onErrorCallback?.('No se pudo activar el micrófono.');
      return false;
    }
  }

  public stopListening() {
    this.keepAlive = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    this.onListeningChangeCallback?.(false);
  }

  public toggleListening(): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      this.startListening();
      return true;
    }
  }

  private playChime(_type: 'start' | 'success' | 'stop') {
    // Intentionally silent for clean, non-gamified architectural experience
  }

  public destroy() {
    this.stopListening();
    if (this.audioFeedbackCtx) {
      try {
        this.audioFeedbackCtx.close();
      } catch {
        // ignore
      }
    }
  }
}
