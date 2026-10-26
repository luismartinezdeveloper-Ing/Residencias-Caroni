import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { JsonFileLeadRepository } from "./src/services/leadRepository";
import { startLeadSyncWorker } from "./src/services/leadSyncWorker";
import { authRouter } from "./server/routes/authRoutes";
import { createLeadRouter } from "./server/routes/leadRoutes";
import { chatRouter } from "./server/routes/chatRoutes";
import { ttsRouter } from "./server/routes/ttsRoutes";
import { setupLiveVoiceWebSocket } from "./server/websocket/liveVoiceHandler";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  // Trust proxy for secure HTTPS detection in Cloud Run / Reverse Proxies
  app.set('trust proxy', 1);

  // Security & Hardware Permissions-Policy Headers
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'microphone=(self), xr-spatial-tracking=(self), gyroscope=(self), accelerometer=(self), magnetometer=(self)'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
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

  // Lead transactional repository & background synchronization worker
  const leadRepository = new JsonFileLeadRepository();
  const syncWorker = startLeadSyncWorker(leadRepository, 60000);

  // Modular API routes
  app.use(authRouter);
  app.use(createLeadRouter(leadRepository));
  app.use(chatRouter);
  app.use(ttsRouter);

  // Gemini Multimodal Live API WebSocket Server
  const liveVoice = setupLiveVoiceWebSocket(server);

  // Vite middleware for development vs static serve for production
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
    liveVoice.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

startServer();
