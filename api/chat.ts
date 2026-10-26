import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { AI_MODELS, AI_PROMPTS } from '../src/config/aiConfig';
import { getDomainFallbackReply } from '../src/utils/aiDomainFallback';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    const { history, context } = req.body;

    const candidateModels = AI_MODELS.CHAT_STREAMING;
    let streamResponse: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction = AI_PROMPTS.getChatSystemInstruction(context);
        const contents = (history || []).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        for (const modelName of candidateModels) {
          try {
            streamResponse = await ai.models.generateContentStream({
              model: modelName,
              contents: contents,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
            if (streamResponse) break;
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} failed on Vercel, trying next fallback:`, modelErr?.message || modelErr);
          }
        }
      } catch (clientErr) {
        console.warn('GoogleGenAI initialization failed on Vercel:', clientErr);
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    if (streamResponse) {
      for await (const chunk of streamResponse) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
    } else {
      // Intelligent Domain Fallback with Authentic Project Facts
      const lastUserMsg = (history?.[history.length - 1]?.content || '');
      const fallbackReply = getDomainFallbackReply(lastUserMsg, context);

      const words = fallbackReply.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in Vercel Serverless /api/chat:', error);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }
    const safeFallback = getDomainFallbackReply('', '');
    res.write(`data: ${JSON.stringify({ text: safeFallback })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
