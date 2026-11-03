/**
 * Validación y límites de entrada para los endpoints de IA (/api/chat, /api/tts).
 * Acota tamaño y forma del payload para contener coste e inyección de prompt.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AI_INPUT_LIMITS = {
  CHAT_MAX_MESSAGES: 20,
  CHAT_MAX_MESSAGE_CHARS: 2000,
  CHAT_MAX_TOTAL_CHARS: 12000,
  TTS_MAX_CHARS: 800,
  UNIT_ID_MAX_CHARS: 64,
} as const;

/**
 * Normaliza el historial: solo roles conocidos, texto no vacío, recorta a los últimos
 * mensajes y rechaza payloads que excedan los límites. El último mensaje debe ser del usuario.
 */
export function parseChatHistory(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages: ChatMessage[] = [];
  for (const item of raw.slice(-AI_INPUT_LIMITS.CHAT_MAX_MESSAGES)) {
    if (!item || typeof item !== 'object') return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim();
    if (!text) continue;
    if (text.length > AI_INPUT_LIMITS.CHAT_MAX_MESSAGE_CHARS) return null;
    messages.push({ role, content: text });
  }

  const total = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  if (messages.length === 0 || total > AI_INPUT_LIMITS.CHAT_MAX_TOTAL_CHARS) return null;
  if (messages[messages.length - 1].role !== 'user') return null;

  return messages;
}

export function parseUnitId(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const id = raw.trim();
  return id && id.length <= AI_INPUT_LIMITS.UNIT_ID_MAX_CHARS ? id : undefined;
}

export function parseTtsText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  return text && text.length <= AI_INPUT_LIMITS.TTS_MAX_CHARS ? text : null;
}
