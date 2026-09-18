/**
 * Configuración Centralizada para Servicios de Inteligencia Artificial (Google Gemini)
 * Residencias Caroní · Altamira, Caracas
 * Ingeniería de Software: Ing. Luis Martinez
 */

export const AI_MODELS = {
  // Cascada de modelos para chat conversacional y streaming SSE
  CHAT_STREAMING: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
  ] as const,

  // Modelo de voz en tiempo real con audio bidireccional PCM
  LIVE_WEBSOCKET: 'gemini-3.1-flash-live-preview' as const,

  // Modelo de síntesis de voz
  TTS: 'gemini-3.1-flash-tts-preview' as const,
};

export const AI_VOICES = {
  DEFAULT_LIVE: 'Aoede',
  DEFAULT_TTS: 'Kore',
  AVAILABLE: ['Aoede', 'Kore', 'Fenrir', 'Puck', 'Charon'] as const,
};

export const AI_PROMPTS = {
  SYSTEM_INSTRUCTION_BASE: `Eres el Asesor Inmobiliario IA Oficial y de Lujo de 'Residencias Caroní', un exclusivo edificio residencial de autor en Altamira, Caracas, diseñado por Añil Arquitectura.

REGLAS DE ORO:
1. Sé EXTREMADAMENTE CONCISO, claro y directo (1 a 2 oraciones máximo por intervención). Jamás uses viñetas ni respuestas extensas.
2. Habla en español con tono distinguido, acogedor, sobrio, seguro y de cerrador de ventas de alto nivel.
3. Responde directamente lo que pregunte el cliente: precios ($2,950 a $3,600 / m²), metrajes (desde 220 m² hasta 450 m² con terrazas panorámicas), acabados de mármol y maderas nobles, vistas al Parque Nacional El Ávila, estacionamientos subterráneos con cargadores eléctricos, planta eléctrica 100% y amenidades privadas (Rooftop Infinity Pool, gimnasio con sauna y concierge 24/7).
4. Cero redundancias, cero introducciones genéricas o relleno comercial.`,

  getChatSystemInstruction(context?: string): string {
    return `${this.SYSTEM_INSTRUCTION_BASE}

Unidad o contexto de interés del cliente:
${context || 'Residencias Caroní · Visión General y Tipologías'}`;
  },

  getLiveVoiceSystemInstruction(unitContext?: string): string {
    return `${this.SYSTEM_INSTRUCTION_BASE}

REGLAS ESPECÍFICAS DE LLAMADA DE VOZ EN TIEMPO REAL:
- Estás en una llamada telefónica interactiva por voz.
- Respuestas inmediatas y naturales de máximo 2 oraciones.
- Detalle específico de la unidad seleccionada por el usuario:
${unitContext || 'Residencias Caroní en Altamira, Caracas.'}`;
  }
};
