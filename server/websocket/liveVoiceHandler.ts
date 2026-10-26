import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { Modality, LiveServerMessage } from '@google/genai';
import { getAIClient } from '../services/aiClient';
import { AI_MODELS, AI_VOICES, AI_PROMPTS } from '../../src/config/aiConfig';

const MAX_CONCURRENT_VOICE_PER_IP = 2;
const INACTIVITY_TIMEOUT_MS = 180000; // 3 minutes timeout for voice calls
const activeIpConnections = new Map<string, number>();

export function setupLiveVoiceWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/api/live' });

  // Heartbeat RFC 6455 to evict dead TCP sockets
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

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (clientWs: WebSocket, req: http.IncomingMessage) => {
    (clientWs as any).isAlive = true;
    clientWs.on('pong', () => {
      (clientWs as any).isAlive = true;
    });

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const currentCount = activeIpConnections.get(clientIp) || 0;

    if (currentCount >= MAX_CONCURRENT_VOICE_PER_IP) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          error:
            'Límite de sesiones de voz simultáneas alcanzado para su conexión. Por favor intente más tarde.',
        })
      );
      clientWs.close(1008, 'Policy Violation - Connection Limit Exceeded');
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
          clientWs.send(
            JSON.stringify({
              type: 'sessionClosed',
              reason: 'Sesión cerrada por inactividad prolongada para optimizar recursos.',
            })
          );
          clientWs.close(1000, 'Inactivity Timeout');
        }
      }, INACTIVITY_TIMEOUT_MS);
    };

    resetInactivityTimer();

    clientWs.on('message', async (data: Buffer | string) => {
      resetInactivityTimer();
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'setup') {
          const ai = getAIClient();
          if (!ai) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                error: 'GEMINI_API_KEY no configurada en el servidor.',
              })
            );
            return;
          }

          const voiceName = msg.voiceName || AI_VOICES.DEFAULT_LIVE;
          const unitContext = msg.context || 'Residencias Caroní en Altamira, Caracas.';
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
                    clientWs.send(
                      JSON.stringify({
                        type: 'audio',
                        audio: audioPart,
                      })
                    );
                  }

                  // 2. Transcriptions
                  const outText = message.serverContent?.outputAudioTranscription?.text;
                  if (outText) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'outputTranscription',
                        text: outText,
                      })
                    );
                  }

                  const inText = message.serverContent?.inputAudioTranscription?.text;
                  if (inText) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'inputTranscription',
                        text: inText,
                      })
                    );
                  }

                  // 3. User interrupted AI speaking
                  if (message.serverContent?.interrupted) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'interrupted',
                      })
                    );
                  }

                  // 4. Turn Complete
                  if (message.serverContent?.turnComplete) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'turnComplete',
                      })
                    );
                  }
                },
                onclose: () => {
                  if (isConnected && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'sessionClosed' }));
                  }
                },
              },
            });

            clientWs.send(JSON.stringify({ type: 'ready', voiceName }));
          } catch (sessionErr: any) {
            console.error('Error creating Gemini Live session:', sessionErr);
            clientWs.send(
              JSON.stringify({
                type: 'error',
                error: sessionErr?.message || 'No se pudo inicializar la sesión de Voz en Vivo.',
              })
            );
          }
        } else if (msg.type === 'audio' && liveSession && msg.audio) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      } catch (err) {
        console.error('Error processing client WS message:', err);
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
    clientWs.on('close', cleanupConnection);
    clientWs.on('error', (err) => {
      console.error('WebSocket client error:', err);
      cleanupConnection();
    });
  });

  return {
    wss,
    close: () => {
      clearInterval(heartbeatInterval);
      wss.close();
    },
  };
}
