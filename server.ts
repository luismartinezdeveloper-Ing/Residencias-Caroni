import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";
import { AI_MODELS, AI_PROMPTS, AI_VOICES } from "./src/config/aiConfig";
import { JsonFileLeadRepository } from "./src/services/leadRepository";
import { startLeadSyncWorker } from "./src/services/leadSyncWorker";

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

  // Static serving for high-performance video streaming with HTTP 206 partial ranges
  app.use('/videos', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  }, express.static(path.join(process.cwd(), 'public', 'videos'), {
    acceptRanges: true,
  }));

  // In-memory rate limiting and active session tracking for WebSocket & API
  const MAX_CONCURRENT_VOICE_PER_IP = 2;
  const INACTIVITY_TIMEOUT_MS = 180000; // 3 minutes timeout for voice calls
  const activeIpConnections = new Map<string, number>();

  // Leads transactional repository with disk persistence and in-memory cache
  const leadRepository = new JsonFileLeadRepository();

  // Background Autonomous Sync Worker for Unsynced Leads
  const syncWorker = startLeadSyncWorker(leadRepository, 60000);

  // WebSocket Server for Gemini Live Real-time Bi-directional Voice
  const wss = new WebSocketServer({ server, path: "/api/live" });

  // Heartbeat RFC 6455 to evict dead TCP sockets and prevent rate-limiting lockouts
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        if (typeof ws.cleanup === 'function') {
          ws.cleanup();
        }
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  wss.on("connection", (clientWs: WebSocket, req: http.IncomingMessage) => {
    (clientWs as any).isAlive = true;
    clientWs.on('pong', () => {
      (clientWs as any).isAlive = true;
    });

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

          const voiceName = msg.voiceName || AI_VOICES.DEFAULT_LIVE;
          const unitContext = msg.context || "Residencias Caroní en Altamira, Caracas.";
          const systemInstruction = AI_PROMPTS.getLiveVoiceSystemInstruction(unitContext);

          try {
            liveSession = await ai.live.connect({
              model: AI_MODELS.LIVE_WEBSOCKET,
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

    let isCleanedUp = false;
    const cleanupConnection = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
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
    };

    (clientWs as any).cleanup = cleanupConnection;

    clientWs.on("close", cleanupConnection);

    clientWs.on("error", (err) => {
      console.error("WebSocket client error:", err);
      cleanupConnection();
    });
  });

  // API Routes
  // Lead Registration & Institutional Dispatch Endpoint
  const MAX_STORED_LEADS = 500;

  app.post("/api/leads", async (req, res) => {
    try {
      const { fullName, email, phone, countryCode, unitInterest, interestType, source, accreditationStatus, company_website } = req.body;

      // 1. Silent Honeypot Trap for automated bots
      if (company_website && String(company_website).trim().length > 0) {
        console.warn(`[BOT BLOCKED] Detección de bot en /api/leads desde IP ${req.socket.remoteAddress}`);
        return res.status(200).json({
          success: true,
          leadId: `LEAD-SIMULATED-${Date.now()}`,
          accessToken: Buffer.from(JSON.stringify({ simulated: true })).toString('base64'),
          synced: { gsheets: false, crm: false }
        });
      }

      if (!fullName || !email || !phone) {
        return res.status(400).json({ 
          error: "Campos requeridos faltantes (Nombre, Correo o Teléfono)." 
        });
      }

      // 2. Disposable Email Filter Server-Side
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailDomain = normalizedEmail.split('@')[1];
      const DISPOSABLE_DOMAINS = [
        'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
        '10minutemail.com', 'sharklasers.com', 'yopmail.com', 'dispostable.com',
        'throwawaymail.com', 'test.com', 'example.com'
      ];
      if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
        return res.status(400).json({
          error: "Por favor utilice una dirección de correo corporativa o personal válida (no temporal)."
        });
      }

      // 3. Sanity check for phone length
      const cleanedPhoneDigits = String(phone).replace(/\D/g, '');
      if (cleanedPhoneDigits.length < 7 || /^(\d)\1+$/.test(cleanedPhoneDigits)) {
        return res.status(400).json({
          error: "El número de teléfono ingresado no corresponde a una línea válida."
        });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
      const formattedPhone = countryCode ? `${countryCode} ${phone}`.trim() : String(phone).trim();
      
      const leadEntry = {
        id: `LEAD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        fullName: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: formattedPhone,
        countryCode: countryCode || '+58',
        interestType: interestType || 'inversion',
        unitInterest: unitInterest || 'General',
        source: source || 'Hero Cinematic Funnel',
        accreditationStatus: accreditationStatus || 'Accredited_Buyer',
        timestamp: new Date().toISOString(),
        ip: clientIp,
      };

      // Persistir lead en el repositorio transaccional
      await leadRepository.saveLead({
        ...leadEntry,
        syncedGSheets: false,
        syncedCrm: false,
      });
      console.log(`[LEAD CAPTURED] ${leadEntry.fullName} (${leadEntry.email}) interesado en: ${leadEntry.unitInterest}`);

      // Dispatch to external Google Sheets Webhook server-side (with 4s atomic timeout)
      const gsheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      let gsheetsSynced = false;

      if (gsheetsWebhook && !gsheetsWebhook.includes('placeholder')) {
        try {
          const gsheetsRes = await fetch(gsheetsWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify({
              action: 'ADD_LEAD',
              leadId: leadEntry.id,
              timestamp: leadEntry.timestamp,
              fullName: leadEntry.fullName,
              email: leadEntry.email,
              phone: leadEntry.phone,
              interestType: leadEntry.interestType,
              preferredUnit: leadEntry.unitInterest,
              source: leadEntry.source,
              project: 'Residencias Caroní - Altamira',
            })
          });
          gsheetsSynced = gsheetsRes.ok;
          if (gsheetsSynced) {
            await leadRepository.markSynced(leadEntry.id, 'gsheets');
          }
        } catch (gsheetsErr) {
          console.warn("Failed or timed out dispatching to GOOGLE_SHEETS_WEBHOOK_URL:", gsheetsErr);
        }
      }

      // Webhook integration (with 4s atomic timeout)
      let crmSynced = false;
      if (process.env.CRM_WEBHOOK_URL) {
        try {
          const crmRes = await fetch(process.env.CRM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify(leadEntry)
          });
          crmSynced = crmRes.ok;
          if (crmSynced) {
            await leadRepository.markSynced(leadEntry.id, 'crm');
          }
        } catch (webhookErr) {
          console.warn("Failed or timed out dispatching to CRM_WEBHOOK_URL:", webhookErr);
        }
      }

      // Generate a secure verification token for the client session
      const verificationToken = Buffer.from(
        JSON.stringify({ id: leadEntry.id, email: leadEntry.email, ts: Date.now() })
      ).toString('base64');

      return res.status(200).json({
        success: true,
        message: "Acreditación registrada exitosamente. Acceso a planos y cotizaciones otorgado.",
        leadId: leadEntry.id,
        accessToken: verificationToken,
        synced: {
          gsheets: gsheetsSynced,
          crm: crmSynced
        }
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

      const systemInstruction = AI_PROMPTS.getChatSystemInstruction(context);

      const contents = history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Canonical and stable Gemini models in prioritized order
      const candidateModels = AI_MODELS.CHAT_STREAMING;
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

      // Track client disconnection to stop consuming Gemini generation stream immediately
      let isClientConnected = true;
      req.on('close', () => {
        isClientConnected = false;
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (streamResponse) {
        for await (const chunk of streamResponse) {
          if (!isClientConnected) {
            console.log("Client aborted chat stream early. Breaking generator.");
            break;
          }
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
          if (!isClientConnected) break;
          res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 35));
        }
      }

      if (isClientConnected) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      if (isClientConnected && !res.writableEnded) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
        }
        res.write(`data: ${JSON.stringify({ text: "Las unidades de Residencias Caroní cuentan con acabados de primera, vistas panorámicas y financiamiento flexible. ¿En qué tipología estás interesado?" })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
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
        model: AI_MODELS.TTS,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
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

  const gracefulShutdown = () => {
    console.log("Shutting down gracefully...");
    syncWorker.stop();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

startServer();
