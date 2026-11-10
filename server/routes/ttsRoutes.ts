import { Router } from 'express';
import { getAIClient } from '../services/aiClient';
import { AI_MODELS, AI_VOICES } from '../../src/config/aiConfig';

export const ttsRouter = Router();

const TTS_RATE_LIMIT_WINDOW_MS = 60000;
const TTS_RATE_LIMIT_MAX = 15;
const MAX_TTS_TEXT_LENGTH = 1000;
const ttsRateLimitMap = new Map<string, { count: number; windowStart: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ttsRateLimitMap.entries()) {
    if (now - entry.windowStart > TTS_RATE_LIMIT_WINDOW_MS) {
      ttsRateLimitMap.delete(ip);
    }
  }
}, 180000).unref();

export function _resetTtsRateLimitForTesting(): void {
  ttsRateLimitMap.clear();
}

function isTtsRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ttsRateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > TTS_RATE_LIMIT_WINDOW_MS) {
    ttsRateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > TTS_RATE_LIMIT_MAX;
}

ttsRouter.post('/api/tts', async (req, res) => {
  try {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    if (isTtsRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes de síntesis de voz. Por favor espere un momento.',
      });
    }

    const { text } = req.body || {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'El texto para síntesis de voz es requerido.' });
    }

    if (text.length > MAX_TTS_TEXT_LENGTH) {
      return res.status(400).json({
        error: `El texto excede el límite máximo permitido de ${MAX_TTS_TEXT_LENGTH} caracteres.`,
      });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(200).json({
        audio: null,
        fallback: 'browser_speech',
        text: text.trim(),
      });
    }

    const response = await ai.models.generateContent({
      model: AI_MODELS.TTS,
      contents: [{ parts: [{ text: text.trim() }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: AI_VOICES.DEFAULT_TTS },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio });
    } else {
      return res.status(200).json({
        audio: null,
        fallback: 'browser_speech',
        text: text.trim(),
      });
    }
  } catch (error) {
    console.warn('Silent fallback in /api/tts:', error);
    const safeText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    return res.status(200).json({
      audio: null,
      fallback: 'browser_speech',
      text: safeText,
    });
  }
});
