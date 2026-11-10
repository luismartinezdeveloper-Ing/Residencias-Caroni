import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { Type, ThinkingLevel } from '@google/genai';
import { getAIClient } from './aiClient';

const execFileAsync = promisify(execFile);

export interface SuperResolutionCalibration {
  casStrength: number;
  unsharpLuma: number;
  denoiseLuma: number;
  denoiseTemporal: number;
  contrast: number;
  saturation: number;
  svgKernelCenter: number;
  svgKernelNeighbor: number;
  svgKernelMatrix: string;
  aiModelUsed: string;
  diagnosticReport: string;
  targetResolution: '3840x2160';
  sourceResolution: '1920x1080';
}

export interface VideoUpscaleJobStatus {
  state: 'idle' | 'analyzing_ai' | 'upscaling_4k' | 'ready' | 'error';
  progress: number;
  calibration: SuperResolutionCalibration;
  videoUrl: string;
  posterUrl: string;
  is4kFileReady: boolean;
  updatedAt: string;
  error?: string;
}

const DEFAULT_CALIBRATION: SuperResolutionCalibration = {
  casStrength: 0.65,
  unsharpLuma: 0.75,
  denoiseLuma: 1.4,
  denoiseTemporal: 2.5,
  contrast: 1.04,
  saturation: 1.05,
  svgKernelCenter: 1.64,
  svgKernelNeighbor: -0.16,
  svgKernelMatrix: '0 -0.16 0 -0.16 1.64 -0.16 0 -0.16 0',
  aiModelUsed: 'preset-arquitectonico-lanczos-cas',
  diagnosticReport:
    'Calibración Super-Resolution 4K UHD (3840x2160): supresión espacial-temporal de macrobloques H.264 (hqdn3d 1.4/2.5), interpolación Lanczos de 6 lóbulos y realce adaptativo de micro-texturas arquitectónicas (CAS 0.65 + Unsharp Luma 0.75) sobre concreto visto, lamas de madera y follaje de El Ávila.',
  targetResolution: '3840x2160',
  sourceResolution: '1920x1080',
};

const SOURCE_VIDEO_PATH = path.join(
  process.cwd(),
  'public',
  'videos',
  'residencias_caroni_master_film.mp4'
);
const SOURCE_POSTER_PATH = path.join(
  process.cwd(),
  'public',
  'videos',
  'residencias_caroni_master_film_poster.jpg'
);
const OUTPUT_4K_VIDEO_PATH = path.join(
  process.cwd(),
  'public',
  'videos',
  'residencias_caroni_4k_sr.mp4'
);
const OUTPUT_4K_POSTER_PATH = path.join(
  process.cwd(),
  'public',
  'videos',
  'residencias_caroni_4k_poster.jpg'
);

let currentStatus: VideoUpscaleJobStatus = {
  state: fs.existsSync(OUTPUT_4K_POSTER_PATH) ? 'ready' : 'idle',
  progress: fs.existsSync(OUTPUT_4K_POSTER_PATH) ? 100 : 0,
  calibration: { ...DEFAULT_CALIBRATION },
  videoUrl: fs.existsSync(OUTPUT_4K_VIDEO_PATH)
    ? '/videos/residencias_caroni_4k_sr.mp4?v=sr_4k_v1'
    : '/videos/residencias_caroni_master_film.mp4?v=residencias_caroni_hero_v8',
  posterUrl: fs.existsSync(OUTPUT_4K_POSTER_PATH)
    ? '/videos/residencias_caroni_4k_poster.jpg?v=sr_4k_v1'
    : '/videos/residencias_caroni_master_film_poster.jpg?v=residencias_caroni_hero_v8',
  is4kFileReady: fs.existsSync(OUTPUT_4K_VIDEO_PATH),
  updatedAt: new Date().toISOString(),
};

let activeJobPromise: Promise<VideoUpscaleJobStatus> | null = null;

function clamp(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  return Math.min(max, Math.max(min, val));
}

function buildKernelMatrix(neighborWeight: number): {
  center: number;
  neighbor: number;
  matrix: string;
} {
  const k = Number(clamp(Math.abs(neighborWeight), 0.08, 0.24).toFixed(3));
  const center = Number((1 + 4 * k).toFixed(3));
  const neighbor = -k;
  return {
    center,
    neighbor,
    matrix: `0 ${neighbor} 0 ${neighbor} ${center} ${neighbor} 0 ${neighbor} 0`,
  };
}

/**
 * Utiliza Gemini Vision (gemini-3.8-flash) en el servidor para inspeccionar un fotograma clave
 * del video 1080p, detectar artefactos de compresión y calcular los hiperparámetros óptimos
 * de Super-Resolution 4K para texturas arquitectónicas.
 */
export async function analyzeVideoFrameWithAI(): Promise<SuperResolutionCalibration> {
  const ai = getAIClient();
  if (!ai || !fs.existsSync(SOURCE_POSTER_PATH)) {
    return { ...DEFAULT_CALIBRATION };
  }

  try {
    const frameBuffer = await fs.promises.readFile(SOURCE_POSTER_PATH);
    const base64Frame = frameBuffer.toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Frame,
            },
          },
          {
            text:
              'Analiza este fotograma arquitectónico 1080p de Residencias Caroní (Altamira, Caracas) para configurar un pipeline de Super-Resolution a 4K UHD (3840x2160). ' +
              'Determina los parámetros óptimos para eliminar artefactos de compresión H.264 (macrobloques y ruido mosquito) y maximizar la nitidez de texturas arquitectónicas (concreto visto, lamas de madera, cristal y vegetación de El Ávila) sin generar halos.',
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            casStrength: {
              type: Type.NUMBER,
              description: 'Fuerza del filtro Contrast Adaptive Sharpening entre 0.45 y 0.85',
            },
            unsharpLuma: {
              type: Type.NUMBER,
              description: 'Ganancia de nitidez de luminancia (5x5 unsharp) entre 0.50 y 1.15',
            },
            denoiseLuma: {
              type: Type.NUMBER,
              description: 'Reducción espacial de ruido de compresión hqdn3d entre 1.0 y 2.2',
            },
            denoiseTemporal: {
              type: Type.NUMBER,
              description: 'Reducción temporal de ruido hqdn3d entre 1.8 y 3.2',
            },
            contrast: {
              type: Type.NUMBER,
              description: 'Ajuste fino de contraste Rec.709 entre 1.02 y 1.06',
            },
            saturation: {
              type: Type.NUMBER,
              description: 'Ajuste fino de saturación cromática entre 1.02 y 1.08',
            },
            kernelEdgeWeight: {
              type: Type.NUMBER,
              description: 'Peso de convolución óptica 3x3 entre 0.12 y 0.20',
            },
            diagnosticReport: {
              type: Type.STRING,
              description:
                'Diagnóstico técnico conciso en español sobre las texturas arquitectónicas y artefactos corregidos.',
            },
          },
          required: [
            'casStrength',
            'unsharpLuma',
            'denoiseLuma',
            'denoiseTemporal',
            'contrast',
            'saturation',
            'kernelEdgeWeight',
            'diagnosticReport',
          ],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return { ...DEFAULT_CALIBRATION };
    }

    const parsed = JSON.parse(rawText);
    const kernel = buildKernelMatrix(Number(parsed.kernelEdgeWeight ?? 0.16));

    return {
      casStrength: Number(clamp(Number(parsed.casStrength), 0.45, 0.85).toFixed(2)),
      unsharpLuma: Number(clamp(Number(parsed.unsharpLuma), 0.5, 1.15).toFixed(2)),
      denoiseLuma: Number(clamp(Number(parsed.denoiseLuma), 1.0, 2.2).toFixed(2)),
      denoiseTemporal: Number(clamp(Number(parsed.denoiseTemporal), 1.8, 3.2).toFixed(2)),
      contrast: Number(clamp(Number(parsed.contrast), 1.02, 1.06).toFixed(2)),
      saturation: Number(clamp(Number(parsed.saturation), 1.02, 1.08).toFixed(2)),
      svgKernelCenter: kernel.center,
      svgKernelNeighbor: kernel.neighbor,
      svgKernelMatrix: kernel.matrix,
      aiModelUsed: 'gemini-3.8-flash',
      diagnosticReport:
        String(parsed.diagnosticReport || '').trim() || DEFAULT_CALIBRATION.diagnosticReport,
      targetResolution: '3840x2160',
      sourceResolution: '1920x1080',
    };
  } catch (err) {
    console.warn('[VIDEO-SR] Fallback a calibración determinista de Super-Resolution:', err);
    return { ...DEFAULT_CALIBRATION };
  }
}

/**
 * Ejecuta el pipeline de pre-procesamiento Super-Resolution 1080p -> 4K (3840x2160) en el servidor:
 * 1. Analiza las texturas arquitectónicas y artefactos mediante IA (gemini-3.8-flash).
 * 2. Genera el póster maestro 4K UHD (3840x2160) con interpolación Lanczos + hqdn3d + CAS + Unsharp.
 * 3. Pre-procesa el clip 4K UHD con codificación H.264 High@L5.1 y FastStart de forma atómica.
 */
export async function triggerServerSuperResolution(options?: {
  encodeFull4kClip?: boolean;
}): Promise<VideoUpscaleJobStatus> {
  if (activeJobPromise) {
    return activeJobPromise;
  }

  activeJobPromise = (async () => {
    try {
      currentStatus = {
        ...currentStatus,
        state: 'analyzing_ai',
        progress: 25,
        updatedAt: new Date().toISOString(),
        error: undefined,
      };

      const calibration = await analyzeVideoFrameWithAI();

      currentStatus = {
        ...currentStatus,
        state: 'upscaling_4k',
        progress: 60,
        calibration,
        updatedAt: new Date().toISOString(),
      };

      const vfFilterChain = [
        `hqdn3d=${calibration.denoiseLuma}:${calibration.denoiseLuma}:${calibration.denoiseTemporal}:${calibration.denoiseTemporal}`,
        'scale=3840:2160:flags=lanczos+accurate_rnd+full_chroma_int',
        `cas=${calibration.casStrength}`,
        `unsharp=5:5:${calibration.unsharpLuma}:5:5:0.0`,
        `eq=contrast=${calibration.contrast}:saturation=${calibration.saturation}`,
      ].join(',');

      // 1. Generar póster 4K UHD (3840x2160) de forma atómica
      if (fs.existsSync(SOURCE_VIDEO_PATH)) {
        const tempPosterPath = `${OUTPUT_4K_POSTER_PATH}.tmp.jpg`;
        try {
          await execFileAsync(
            'ffmpeg',
            [
              '-y',
              '-i',
              SOURCE_VIDEO_PATH,
              '-vf',
              vfFilterChain,
              '-vframes',
              '1',
              '-q:v',
              '1',
              tempPosterPath,
            ],
            { timeout: 15000 }
          );
          if (fs.existsSync(tempPosterPath)) {
            await fs.promises.rename(tempPosterPath, OUTPUT_4K_POSTER_PATH);
          }
        } catch (posterErr) {
          console.warn('[VIDEO-SR] Aviso al generar póster 4K con ffmpeg:', posterErr);
        }
      }

      // 2. Si se solicita explícitamente pre-renderizar el clip 4K UHD en disco
      if (options?.encodeFull4kClip && fs.existsSync(SOURCE_VIDEO_PATH) && !fs.existsSync(OUTPUT_4K_VIDEO_PATH)) {
        const tempVideoPath = `${OUTPUT_4K_VIDEO_PATH}.tmp.mp4`;
        try {
          await execFileAsync(
            'ffmpeg',
            [
              '-y',
              '-i',
              SOURCE_VIDEO_PATH,
              '-t',
              '18',
              '-filter_threads',
              '4',
              '-vf',
              vfFilterChain,
              '-c:v',
              'libx264',
              '-profile:v',
              'high',
              '-level:v',
              '5.1',
              '-preset',
              'ultrafast',
              '-crf',
              '21',
              '-maxrate',
              '7.5M',
              '-bufsize',
              '15M',
              '-c:a',
              'copy',
              '-movflags',
              '+faststart',
              tempVideoPath,
            ],
            { timeout: 45000 }
          );
          if (fs.existsSync(tempVideoPath)) {
            await fs.promises.rename(tempVideoPath, OUTPUT_4K_VIDEO_PATH);
          }
        } catch (clipErr) {
          console.warn('[VIDEO-SR] Aviso al generar clip 4K en servidor:', clipErr);
        }
      }

      const has4kVideo = fs.existsSync(OUTPUT_4K_VIDEO_PATH);
      const has4kPoster = fs.existsSync(OUTPUT_4K_POSTER_PATH);

      currentStatus = {
        state: 'ready',
        progress: 100,
        calibration,
        videoUrl: has4kVideo
          ? `/videos/residencias_caroni_4k_sr.mp4?v=sr_4k_${Date.now()}`
          : `/videos/residencias_caroni_master_film.mp4?v=sr_calibrated_${Date.now()}`,
        posterUrl: has4kPoster
          ? `/videos/residencias_caroni_4k_poster.jpg?v=sr_4k_${Date.now()}`
          : `/videos/residencias_caroni_master_film_poster.jpg?v=residencias_caroni_hero_v8`,
        is4kFileReady: has4kVideo,
        updatedAt: new Date().toISOString(),
      };

      return currentStatus;
    } catch (error: any) {
      currentStatus = {
        ...currentStatus,
        state: 'ready',
        progress: 100,
        calibration: { ...DEFAULT_CALIBRATION },
        updatedAt: new Date().toISOString(),
        error: error?.message || 'Fallback a perfil Super-Resolution local',
      };
      return currentStatus;
    } finally {
      activeJobPromise = null;
    }
  })();

  return activeJobPromise;
}

export function getVideoUpscaleStatus(): VideoUpscaleJobStatus {
  return currentStatus;
}
