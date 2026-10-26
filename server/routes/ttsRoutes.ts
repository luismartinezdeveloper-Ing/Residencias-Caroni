import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { AI_MODELS, AI_VOICES } from '../../src/config/aiConfig';

export const ttsRouter = Router();

ttsRouter.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada.' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

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
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: 'TTS generation failed.' });
  }
});
