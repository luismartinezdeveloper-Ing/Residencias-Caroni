/**
 * Gestor Universal de Desbloqueo de Audio para iOS Safari & WebKit
 * Residencias Caroní · Altamira, Caracas
 * Ingeniería de Software: Ing. Luis Martinez
 */

class AudioUnlockManager {
  private isUnlocked: boolean = false;
  private registeredContexts: Set<AudioContext> = new Set();
  private cleanupListeners: (() => void) | null = null;

  constructor() {
    this.setupUnlockListeners();
  }

  /**
   * Registra un AudioContext para que sea reanudado automáticamente
   * tan pronto ocurra una interacción del usuario.
   */
  public registerContext(ctx: AudioContext): void {
    if (!ctx) return;
    this.registeredContexts.add(ctx);

    // Si ya ocurrió el desbloqueo o el contexto está suspendido, intentar reanudar
    if (ctx.state === 'suspended') {
      this.attemptResume(ctx);
    }
  }

  /**
   * Elimina el registro de un AudioContext (por ejemplo al desmontar o cerrar)
   */
  public unregisterContext(ctx: AudioContext): void {
    this.registeredContexts.delete(ctx);
  }

  /**
   * Configura los listeners globales pasivos en el primer gesto del usuario
   */
  private setupUnlockListeners(): void {
    if (typeof window === 'undefined') return;

    const events = ['touchstart', 'touchend', 'click', 'keydown'];

    const handleFirstGesture = async () => {
      this.isUnlocked = true;

      // Reanudar todos los contextos registrados
      for (const ctx of this.registeredContexts) {
        await this.attemptResume(ctx);
      }

      // Remover los listeners una vez ejecutado
      if (this.cleanupListeners) {
        this.cleanupListeners();
        this.cleanupListeners = null;
      }
    };

    const removeListeners = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleFirstGesture);
      });
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleFirstGesture, { passive: true, once: true });
    });

    this.cleanupListeners = removeListeners;
  }

  private async attemptResume(ctx: AudioContext): Promise<boolean> {
    if ((ctx.state as string) === 'running') return true;
    try {
      await ctx.resume();
      return (ctx.state as string) === 'running';
    } catch {
      return false;
    }
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Método manual de activación ante acciones directas (ej. presionar botón de llamada)
   */
  public async unlockAll(): Promise<void> {
    this.isUnlocked = true;
    const promises = Array.from(this.registeredContexts).map((ctx) => this.attemptResume(ctx));
    await Promise.all(promises);
  }
}

export const audioUnlockManager = new AudioUnlockManager();
