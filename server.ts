import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { JsonFileLeadRepository } from "./src/services/leadRepository";
import { startLeadSyncWorker } from "./src/services/leadSyncWorker";
import { authRouter } from "./server/routes/authRoutes";
import { getJwtSecret } from "./server/security/auth";
import { createLeadRouter } from "./server/routes/leadRoutes";
import { chatRouter } from "./server/routes/chatRoutes";
import { createHealthRouter } from "./server/routes/healthRoutes";
import { ttsRouter } from "./server/routes/ttsRoutes";
import { videoUpscaleRouter } from "./server/routes/videoUpscaleRoutes";
import { triggerServerSuperResolution } from "./server/services/videoUpscaleService";
import { setupLiveVoiceWebSocket } from "./server/websocket/liveVoiceHandler";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  // Fixed port 3000 required by development environment & container reverse proxy
  const PORT = 3000;

  // Trust proxy for secure HTTPS detection in Cloud Run / Reverse Proxies
  app.set('trust proxy', 1);

  // Security & Hardware Permissions-Policy Headers
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'microphone=(self), xr-spatial-tracking=(self), gyroscope=(self), accelerometer=(self), magnetometer=(self)'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: data: https:; connect-src 'self' ws: wss: https:; frame-ancestors 'self' https://*.google.com https://*.run.app;"
    );

    if (process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });


  // Production security fail-fast: prevent running in production with insecure fallback secret
  try {
    getJwtSecret();
  } catch {
    console.error('[SECURITY CRITICAL] Servidor bloqueado: JWT_SECRET no configurado o inseguro en producción.');
    process.exit(1);
  }

  app.use(express.json({ limit: '64kb' }));
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: 'Formato JSON inválido en la solicitud.' });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'El tamaño de la solicitud excede el límite permitido (64KB).' });
    }
    return next(err);
  });

  // Static serving for high-performance video streaming with HTTP 206 partial ranges
  app.use('/videos', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  }, express.static(path.join(process.cwd(), 'public', 'videos'), {
    acceptRanges: true,
  }));

  // Lead transactional repository & background synchronization worker
  const leadRepository = new JsonFileLeadRepository();
  const syncWorker = startLeadSyncWorker(leadRepository, 60000);

  // Modular API routes
  app.use(createHealthRouter(leadRepository));
  app.use(authRouter);
  app.use(createLeadRouter(leadRepository));
  app.use(chatRouter);
  app.use(ttsRouter);
  app.use(videoUpscaleRouter);

  // Gemini Multimodal Live API WebSocket Server
  const liveVoice = setupLiveVoiceWebSocket(server);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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
    // Pre-calibrar Super-Resolution 4K con IA en segundo plano sin bloquear el arranque
    triggerServerSuperResolution({ encodeFull4kClip: false }).catch(() => {});
  });

  const gracefulShutdown = () => {
    console.log("Shutting down gracefully...");
    syncWorker.stop();
    liveVoice.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

startServer();
