import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada en Vercel Environment Variables.' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `Eres un Asesor Inmobiliario IA de Lujo experto en 'Residencias Caroní'.
REGLAS DE ORO:
1. Sé EXTREMADAMENTE BREVE, preciso y directo al grano (máximo 2 oraciones).
2. Tono amigable, pero enfocado en lo que un comprador quiere saber: Precio, M², Distribución y Vistas.
3. Cero redundancias, cero introducciones largas. Tono elegante de cerrador de ventas.

Unidad actual del usuario:
${context || 'Residencias Caroní General'}

Responde en español.`;

    const contents = (history || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const candidateModels = [
      'gemini-3.7-flash',
      'gemini-3.1-pro-preview',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ];

    let streamResponse: any = null;

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
      // Intelligent Domain Fallback
      const lastUserMsg = (history?.[history.length - 1]?.content || '').toLowerCase();
      let fallbackReply = '';

      if (lastUserMsg.includes('precio') || lastUserMsg.includes('cuesta') || lastUserMsg.includes('valor') || lastUserMsg.includes('pago') || lastUserMsg.includes('financ')) {
        fallbackReply = 'Las unidades en Residencias Caroní van desde $185,000 USD (2D) hasta $495,000 USD (Penthouse). Contamos con plan de pago inicial del 30% y financiamiento directo a 24 meses sin intereses.';
      } else if (lastUserMsg.includes('metro') || lastUserMsg.includes('m2') || lastUserMsg.includes('tamaño') || lastUserMsg.includes('superficie') || lastUserMsg.includes('area')) {
        fallbackReply = 'Disponemos de tipologías desde 85 m² (2 habitaciones) hasta 240 m² con terrazas privadas panorámicas en los niveles superiores.';
      } else if (lastUserMsg.includes('habitaci') || lastUserMsg.includes('cuarto') || lastUserMsg.includes('dormitorio') || lastUserMsg.includes('baño')) {
        fallbackReply = 'Nuestros apartamentos cuentan con configuraciones de 2 a 4 suites, acabados en mármol y carpintería italiana de piso a techo.';
      } else if (lastUserMsg.includes('amenidad') || lastUserMsg.includes('piscina') || lastUserMsg.includes('gym') || lastUserMsg.includes('gimnasio') || lastUserMsg.includes('spa')) {
        fallbackReply = 'El complejo incluye Rooftop Infinity Pool climatizada, Fitness Center con sauna húmedo/seco, Sky Lounge y servicio de Concierge 24/7.';
      } else if (lastUserMsg.includes('estacion') || lastUserMsg.includes('parque') || lastUserMsg.includes('cochera') || lastUserMsg.includes('auto')) {
        fallbackReply = 'Cada unidad incluye de 2 a 3 puestos de estacionamiento subterráneo techado con cargador para vehículos eléctricos y maletero privado.';
      } else if (lastUserMsg.includes('hola') || lastUserMsg.includes('buenas') || lastUserMsg.includes('saludos') || lastUserMsg.includes('dia') || lastUserMsg.includes('tarde')) {
        fallbackReply = '¡Hola! Bienvenido a Residencias Caroní. Estoy a tu disposición para brindarte precios, planos, opciones de financiamiento y detalles de cada tipología.';
      } else {
        fallbackReply = 'En Residencias Caroní combinamos arquitectura vanguardista, vistas panorámicas y alta rentabilidad inmobiliaria. ¿Deseas cotizar una unidad en particular o agendar un tour virtual personalizado?';
      }

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
    res.write(`data: ${JSON.stringify({ text: 'Las unidades de Residencias Caroní cuentan con acabados de primera, vistas panorámicas y financiamiento flexible. ¿En qué tipología estás interesado?' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
