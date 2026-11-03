import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAIClient } from '../server/services/aiClient';
import { parseTtsText } from '../server/security/aiInput';
import { getClientIp, handleCors } from '../server/security/http';
import { rateLimit } from '../server/security/rateLimit';
import { AI_MODELS, AI_VOICES } from '../src/config/aiConfig';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    // Máximo 15 síntesis por IP cada 10 minutos
    const limit = await rateLimit('tts', getClientIp(req), 15, 600);
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(limit.retryAfterSeconds));
      return res.status(429).json({ error: 'Límite de audio alcanzado. Intente de nuevo en unos minutos.' });
    }

    const text = parseTtsText(req.body?.text);
    if (!text) {
      return res.status(400).json({ error: 'Texto inválido o demasiado largo.' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Servicio de voz no disponible.' });
    }

    const response = await ai.models.generateContent({
      model: AI_MODELS.TTS,
      contents: [{ parts: [{ text }] }],
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
      res.json({ audio: base64Audio });
    } else {
      res.status(500).json({ error: 'No audio generated' });
    }
  } catch (error) {
    console.error('Error in Vercel Serverless /api/tts:', (error as Error).message);
    res.status(500).json({ error: 'TTS generation failed.' });
  }
}
