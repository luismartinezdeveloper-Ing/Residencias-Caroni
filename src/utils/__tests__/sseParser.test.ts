import { describe, it, expect, beforeEach } from 'vitest';
import { SSEStreamParser } from '../sseParser';

describe('SSEStreamParser', () => {
  let parser: SSEStreamParser;

  beforeEach(() => {
    parser = new SSEStreamParser();
  });

  it('debe parsear un evento SSE normal completo', () => {
    const chunk = 'data: {"text": "Hola, bienvenido a Residencias Caroní"}\n\n';
    const payloads = parser.feed(chunk);
    expect(payloads).toHaveLength(1);
    expect(JSON.parse(payloads[0])).toEqual({
      text: 'Hola, bienvenido a Residencias Caroní',
    });
  });

  it('debe manejar fragmentación TCP donde un JSON se divide en dos chunks', () => {
    const chunk1 = 'data: {"text": "El precio de la Pent';
    const chunk2 = 'house es USD 3,300/m²"}\n';

    const payloads1 = parser.feed(chunk1);
    expect(payloads1).toHaveLength(0); // Aún no ha terminado la línea

    const payloads2 = parser.feed(chunk2);
    expect(payloads2).toHaveLength(1);
    expect(JSON.parse(payloads2[0])).toEqual({
      text: 'El precio de la Penthouse es USD 3,300/m²',
    });
  });

  it('debe procesar múltiples eventos en un solo chunk', () => {
    const chunk = 'data: {"text": "Uno"}\ndata: {"text": "Dos"}\ndata: {"text": "Tres"}\n';
    const payloads = parser.feed(chunk);
    expect(payloads).toHaveLength(3);
    expect(payloads.map((p) => JSON.parse(p).text)).toEqual(['Uno', 'Dos', 'Tres']);
  });

  it('debe ignorar comentarios SSE y la señal data: [DONE]', () => {
    const chunk = ': heartbeat keep-alive\n\ndata: [DONE]\n\ndata: {"text": "Final"}\n';
    const payloads = parser.feed(chunk);
    expect(payloads).toHaveLength(1);
    expect(JSON.parse(payloads[0])).toEqual({ text: 'Final' });
  });

  it('debe entregar remanentes pendientes con flush() si el stream termina sin newline final', () => {
    const chunk = 'data: {"text": "Remanente final sin salto de línea"}';
    const payloadsInitial = parser.feed(chunk);
    expect(payloadsInitial).toHaveLength(0);

    const flushed = parser.flush();
    expect(flushed).toHaveLength(1);
    expect(JSON.parse(flushed[0])).toEqual({ text: 'Remanente final sin salto de línea' });
  });
});
