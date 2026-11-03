import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAIClient } from '../server/services/aiClient';
import { parseChatHistory, parseUnitId } from '../server/security/aiInput';
import { getClientIp, handleCors } from '../server/security/http';
import { rateLimit } from '../server/security/rateLimit';
import { AI_MODELS, AI_PROMPTS } from '../src/config/aiConfig';
import { buildProjectContext, findUnitById } from '../src/config/aiContext';
import { getDomainFallbackReply } from '../src/utils/aiDomainFallback';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  // Máximo 20 mensajes por IP cada 5 minutos
  const limit = await rateLimit('chat', getClientIp(req), 20, 300);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    return res.status(429).json({ error: 'Ha alcanzado el límite de consultas. Intente de nuevo en unos minutos.' });
  }

  const history = parseChatHistory(req.body?.history);
  if (!history) {
    return res.status(400).json({ error: 'Conversación inválida o demasiado extensa.' });
  }

  // El contexto se construye en el servidor a partir de datos oficiales, nunca del cliente
  const unit = findUnitById(parseUnitId(req.body?.unitId));
  const lastUserMsg = history[history.length - 1].content;

  let clientConnected = true;
  res.on('close', () => {
    if (!res.writableEnded) clientConnected = false;
  });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const send = (text: string) => {
    if (clientConnected && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
  };

  let streamedAnyText = false;
  try {
    const ai = getAIClient();
    let streamResponse: Awaited<ReturnType<NonNullable<typeof ai>['models']['generateContentStream']>> | null = null;

    if (ai) {
      const systemInstruction = AI_PROMPTS.getChatSystemInstruction(buildProjectContext(unit));
      const contents = history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      for (const modelName of AI_MODELS.CHAT_STREAMING) {
        try {
          streamResponse = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: { systemInstruction, temperature: 0.7, maxOutputTokens: 512 },
          });
          break;
        } catch (modelErr) {
          console.warn(`Model ${modelName} failed on Vercel, trying next fallback:`, (modelErr as Error)?.message);
        }
      }
    }

    if (streamResponse) {
      for await (const chunk of streamResponse) {
        if (!clientConnected) break;
        if (chunk.text) {
          send(chunk.text);
          streamedAnyText = true;
        }
      }
    } else {
      // Respaldo local con datos auténticos del proyecto
      const fallbackReply = getDomainFallbackReply(lastUserMsg, unit?.name);
      for (const word of fallbackReply.split(' ')) {
        if (!clientConnected) break;
        send(word + ' ');
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
    }
  } catch (error) {
    console.error('Error in Vercel Serverless /api/chat:', (error as Error).message);
    // Solo se envía el respaldo si aún no se había transmitido texto del modelo
    if (!streamedAnyText) send(getDomainFallbackReply('', ''));
  }

  if (!res.writableEnded) {
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
