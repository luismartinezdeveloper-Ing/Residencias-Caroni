/**
 * Utilidad robusta para parsear streams SSE (Server-Sent Events)
 * Reensambla fragmentos TCP que hayan cortado líneas JSON a la mitad.
 */
export interface SSEEvent {
  event?: string;
  data: string;
}

export class SSEStreamParser {
  private buffer: string = '';

  /**
   * Alimenta un chunk de texto decodificado y retorna todos los datos JSON o payloads completos
   */
  public feed(chunk: string): string[] {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    
    // El último elemento tras split es lo que quedó después del último '\n'.
    // Si la cadena terminaba en '\n', este residuo es '' (buffer vacío).
    // Si la cadena se cortó a la mitad, este residuo es la línea incompleta que guardamos para el siguiente chunk.
    this.buffer = lines.pop() || '';

    const results: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(':')) {
        // Comentarios SSE o líneas vacías
        continue;
      }

      if (line === 'data: [DONE]') {
        continue;
      }

      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        results.push(payload);
      }
    }

    return results;
  }

  /**
   * Procesa cualquier remanente final al cerrar el stream si no terminaba en \n
   */
  public flush(): string[] {
    const remaining = this.buffer.trim();
    this.buffer = '';
    if (remaining.startsWith('data: ') && remaining !== 'data: [DONE]') {
      return [remaining.slice(6).trim()];
    }
    return [];
  }

  public reset(): void {
    this.buffer = '';
  }
}
