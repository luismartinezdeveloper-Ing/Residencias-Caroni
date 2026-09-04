import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Trust proxy for secure HTTPS detection in Cloud Run / Reverse Proxies
  app.set('trust proxy', 1);

  // Security & Hardware Permissions-Policy Headers
  app.use((req, res, next) => {
    // Microphone & XR Permissions for WebXR and Live Audio Advisor
    res.setHeader(
      'Permissions-Policy',
      'microphone=(self), xr-spatial-tracking=(self), gyroscope=(self), accelerometer=(self), magnetometer=(self)'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Strict-Transport-Security (HSTS) when running in production/HTTPS
    if (process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });

  app.use(express.json());

  // In-memory rate limiting and active session tracking for WebSocket & API
  const MAX_CONCURRENT_VOICE_PER_IP = 2;
  const INACTIVITY_TIMEOUT_MS = 180000; // 3 minutes timeout for voice calls
  const activeIpConnections = new Map<string, number>();

  // Leads storage (in-memory persistent during runtime with optional webhook dispatch)
  const leadsRegistry: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    unitInterest: string;
    accreditationStatus: string;
    timestamp: string;
    ip: string;
  }> = [];

  // WebSocket Server for Gemini Live Real-time Bi-directional Voice
  const wss = new WebSocketServer({ server, path: "/api/live" });

  wss.on("connection", (clientWs: WebSocket, req: http.IncomingMessage) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const currentCount = activeIpConnections.get(clientIp) || 0;

    if (currentCount >= MAX_CONCURRENT_VOICE_PER_IP) {
      clientWs.send(JSON.stringify({
        type: "error",
        error: "Límite de sesiones de voz simultáneas alcanzado para su conexión. Por favor intente más tarde."
      }));
      clientWs.close(1008, "Policy Violation - Connection Limit Exceeded");
      return;
    }

    activeIpConnections.set(clientIp, currentCount + 1);

    let liveSession: any = null;
    let isConnected = true;
    let inactivityTimer: NodeJS.Timeout | null = null;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (isConnected && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: "sessionClosed",
            reason: "Sesión cerrada por inactividad prolongada para optimizar recursos."
          }));
          clientWs.close(1000, "Inactivity Timeout");
        }
      }, INACTIVITY_TIMEOUT_MS);
    };

    resetInactivityTimer();

    clientWs.on("message", async (data: Buffer | string) => {
      resetInactivityTimer();
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "setup") {
          if (!process.env.GEMINI_API_KEY) {
            clientWs.send(JSON.stringify({ 
              type: "error", 
              error: "GEMINI_API_KEY no configurada en el servidor." 
            }));
            return;
          }

          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const voiceName = msg.voiceName || "Aoede";
          const unitContext = msg.context || "Residencias Caroní en Altamira, Caracas.";

          const systemInstruction = `Eres el Asesor Inmobiliario IA Oficial y de Lujo de 'Residencias Caroní', un exclusivo edificio residencial de autor en Altamira, Caracas, diseñado por Añil Arquitectura.

REGLAS DE CONVERSACIÓN DE VOZ EN VIVO:
1. Estás en una llamada telefónica / conversación de voz en tiempo real con un comprador o inversionista de alto nivel.
2. Sé MUY CONCISO, claro y natural (1 a 2 oraciones máximo por turno). Jamás uses listas largas o viñetas por voz.
3. Habla en español con tono distinguido, acogedor, sobrio y seguro.
4. Responde directamente lo que pregunte el cliente sobre precios estimados ($2,950 a $3,600 / m²), metrajes (desde 220 m² hasta 450 m² con terrazas), acabados de mármol y maderas nobles, vistas al Ávila, estacionamientos o amenidades privadas (gimnasio, piscina infinita, vigilancia 24/7 y planta eléctrica 100%).
5. Si te preguntan detalles específicos de la unidad seleccionada:
${unitContext}

Responde de forma inmediata y conversacional.`;

          try {
            liveSession = await ai.live.connect({
              model: "gemini-3.1-flash-live-preview",
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName },
                  },
                },
                systemInstruction: systemInstruction,
                outputAudioTranscription: {},
                inputAudioTranscription: {},
              },
              callbacks: {
                onmessage: (message: LiveServerMessage) => {
                  if (!isConnected || clientWs.readyState !== WebSocket.OPEN) return;

                  // 1. Audio data chunks from model (24kHz PCM)
                  const audioPart = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                  if (audioPart) {
                    clientWs.send(JSON.stringify({
                      type: "audio",
                      audio: audioPart
                    }));
                  }

                  // 2. Transcriptions
                  const outText = message.serverContent?.outputAudioTranscription?.text;
                  if (outText) {
                    clientWs.send(JSON.stringify({
                      type: "outputTranscription",
                      text: outText
                    }));
                  }

                  const inText = message.serverContent?.inputAudioTranscription?.text;
                  if (inText) {
                    clientWs.send(JSON.stringify({
                      type: "inputTranscription",
                      text: inText
                    }));
                  }

                  // 3. User interrupted AI speaking
                  if (message.serverContent?.interrupted) {
                    clientWs.send(JSON.stringify({
                      type: "interrupted"
                    }));
                  }

                  // 4. Turn Complete
                  if (message.serverContent?.turnComplete) {
                    clientWs.send(JSON.stringify({
                      type: "turnComplete"
                    }));
                  }
                },
                onclose: () => {
                  if (isConnected && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: "sessionClosed" }));
                  }
                }
              }
            });

            clientWs.send(JSON.stringify({ type: "ready", voiceName }));
          } catch (sessionErr: any) {
            console.error("Error creating Gemini Live session:", sessionErr);
            clientWs.send(JSON.stringify({ 
              type: "error", 
              error: sessionErr?.message || "No se pudo inicializar la sesión de Voz en Vivo." 
            }));
          }
        } else if (msg.type === "audio" && liveSession && msg.audio) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: "audio/pcm;rate=16000"
            }
          });
        }
      } catch (err) {
        console.error("Error processing client WS message:", err);
      }
    });

    clientWs.on("close", () => {
      isConnected = false;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      const count = activeIpConnections.get(clientIp) || 1;
      if (count <= 1) {
        activeIpConnections.delete(clientIp);
      } else {
        activeIpConnections.set(clientIp, count - 1);
      }

      if (liveSession) {
        try {
          liveSession.close();
        } catch (e) {
          // ignore
        }
      }
    });

    clientWs.on("error", (err) => {
      console.error("WebSocket client error:", err);
    });
  });

  // API Routes
  // Lead Registration & Institutional Dispatch Endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const { fullName, email, phone, unitInterest, accreditationStatus } = req.body;

      if (!fullName || !email || !phone) {
        return res.status(400).json({ 
          error: "Campos requeridos faltantes (Nombre, Correo o Teléfono)." 
        });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
      const leadEntry = {
        id: `LEAD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        fullName: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        unitInterest: unitInterest || 'General',
        accreditationStatus: accreditationStatus || 'Accredited_Buyer',
        timestamp: new Date().toISOString(),
        ip: clientIp
      };

      leadsRegistry.push(leadEntry);
      console.log(`[LEAD CAPTURED] ${leadEntry.fullName} (${leadEntry.email}) interesado en: ${leadEntry.unitInterest}`);

      // Webhook integration (if CRM_WEBHOOK_URL is defined)
      if (process.env.CRM_WEBHOOK_URL) {
        try {
          await fetch(process.env.CRM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadEntry)
          });
        } catch (webhookErr) {
          console.warn("Failed to dispatch to CRM_WEBHOOK_URL:", webhookErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Acreditación registrada exitosamente. Acceso a planos y cotizaciones otorgado.",
        leadId: leadEntry.id
      });
    } catch (err: any) {
      console.error("Error processing /api/leads:", err);
      return res.status(500).json({ error: "Error interno al procesar acreditación." });
    }
  });
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, context } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY no está configurada en el servidor." });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `Eres un Asesor Inmobiliario IA de Lujo experto en 'Residencias Caroní'.
REGLAS DE ORO:
1. Sé EXTREMADAMENTE BREVE, preciso y directo al grano (máximo 2 oraciones).
2. Tono amigable, pero enfocado en lo que un comprador quiere saber: Precio, M², Distribución y Vistas.
3. Cero redundancias, cero introducciones largas. Tono elegante de cerrador de ventas.

Unidad actual del usuario:
${context}

Responde en español.`;

      const contents = history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Candidate models in prioritized fallback order according to @google/genai guidelines
      const candidateModels = [
        "gemini-3.7-flash",
        "gemini-3.1-pro-preview",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
      ];
      let streamResponse: any = null;
      let lastModelError: any = null;

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
          lastModelError = modelErr;
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (streamResponse) {
        for await (const chunk of streamResponse) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
      } else {
        // Fallback intelligent domain assistant when external AI model cluster experiences temporary 503 demand spikes
        console.warn("All external Gemini models returned 503 / unavailable. Activating local domain concierge stream.");
        const lastUserMsg = history[history.length - 1]?.content?.toLowerCase() || '';
        let fallbackReply = '';

        if (lastUserMsg.includes('precio') || lastUserMsg.includes('cuesta') || lastUserMsg.includes('valor') || lastUserMsg.includes('pago') || lastUserMsg.includes('financ')) {
          fallbackReply = "Las unidades en Residencias Caroní van desde $185,000 USD (2D) hasta $495,000 USD (Penthouse). Contamos con plan de pago inicial del 30% y financiamiento directo a 24 meses sin intereses.";
        } else if (lastUserMsg.includes('metro') || lastUserMsg.includes('m2') || lastUserMsg.includes('tamaño') || lastUserMsg.includes('superficie') || lastUserMsg.includes('area')) {
          fallbackReply = "Disponemos de tipologías desde 85 m² (2 habitaciones) hasta 240 m² con terrazas privadas panorámicas en los niveles superiores.";
        } else if (lastUserMsg.includes('habitaci') || lastUserMsg.includes('cuarto') || lastUserMsg.includes('dormitorio') || lastUserMsg.includes('baño')) {
          fallbackReply = "Nuestros apartamentos cuentan con configuraciones de 2 a 4 suites, acabados en mármol y carpintería italiana de piso a techo.";
        } else if (lastUserMsg.includes('amenidad') || lastUserMsg.includes('piscina') || lastUserMsg.includes('gym') || lastUserMsg.includes('gimnasio') || lastUserMsg.includes('spa')) {
          fallbackReply = "El complejo incluye Rooftop Infinity Pool climatizada, Fitness Center con sauna húmedo/seco, Sky Lounge y servicio de Concierge 24/7.";
        } else if (lastUserMsg.includes('estacion') || lastUserMsg.includes('parque') || lastUserMsg.includes('cochera') || lastUserMsg.includes('auto')) {
          fallbackReply = "Cada unidad incluye de 2 a 3 puestos de estacionamiento subterráneo techado con cargador para vehículos eléctricos y maletero privado.";
        } else if (lastUserMsg.includes('hola') || lastUserMsg.includes('buenas') || lastUserMsg.includes('saludos') || lastUserMsg.includes('dia') || lastUserMsg.includes('tarde')) {
          fallbackReply = "¡Hola! Bienvenido a Residencias Caroní. Estoy a tu disposición para brindarte precios, planos, opciones de financiamiento y detalles de cada tipología.";
        } else {
          fallbackReply = "En Residencias Caroní combinamos arquitectura vanguardista, vistas panorámicas y alta rentabilidad inmobiliaria. ¿Deseas cotizar una unidad en particular o agendar un tour virtual personalizado?";
        }

        // Stream the response smoothly
        const words = fallbackReply.split(' ');
        for (const word of words) {
          res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 35));
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      }
      res.write(`data: ${JSON.stringify({ text: "Las unidades de Residencias Caroní cuentan con acabados de primera, vistas panorámicas y financiamiento flexible. ¿En qué tipología estás interesado?" })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY missing." });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        res.status(500).json({ error: "No audio generated" });
      }
    } catch (error) {
      console.error("Error in /api/tts:", error);
      res.status(500).json({ error: "TTS generation failed." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
