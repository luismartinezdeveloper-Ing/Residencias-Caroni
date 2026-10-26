import { Router } from 'express';
import { getAIClient } from '../services/aiClient';
import { AI_MODELS, AI_PROMPTS } from '../../src/config/aiConfig';
import { getDomainFallbackReply } from '../../src/utils/aiDomainFallback';

export const chatRouter = Router();

chatRouter.post('/api/chat', async (req, res) => {
  let isClientConnected = true;
  res.on('close', () => {
    if (!res.writableEnded) {
      isClientConnected = false;
    }
  });

  try {
    const { history, context } = req.body;
    const ai = getAIClient();

    let streamResponse: any = null;

    if (ai) {
      const systemInstruction = AI_PROMPTS.getChatSystemInstruction(context);
      const contents = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const candidateModels = AI_MODELS.CHAT_STREAMING;

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
          console.warn(`Model ${modelName} unavailable, attempting fallback:`, modelErr?.message || modelErr);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    if (streamResponse) {
      for await (const chunk of streamResponse) {
        if (!isClientConnected || res.writableEnded) {
          console.log('Client aborted chat stream early.');
          break;
        }
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
    } else {
      // Local domain concierge stream based on authentic project knowledge
      console.log('Using authentic local domain fallback for /api/chat');
      const lastUserMsg = (history?.[history.length - 1]?.content || '');
      const fallbackReply = getDomainFallbackReply(lastUserMsg, context);

      const words = fallbackReply.split(' ');
      for (const word of words) {
        if (!isClientConnected || res.writableEnded) break;
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    if (!res.writableEnded) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
      }
      const safeReply = getDomainFallbackReply('', '');
      res.write(`data: ${JSON.stringify({ text: safeReply })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});
