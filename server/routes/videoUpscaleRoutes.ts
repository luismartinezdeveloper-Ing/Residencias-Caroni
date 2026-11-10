import { Router, Request, Response } from 'express';
import {
  getVideoUpscaleStatus,
  triggerServerSuperResolution,
} from '../services/videoUpscaleService';

export const videoUpscaleRouter = Router();

videoUpscaleRouter.get('/api/video/upscale/status', (_req: Request, res: Response) => {
  res.status(200).json(getVideoUpscaleStatus());
});

videoUpscaleRouter.post('/api/video/upscale/process', async (req: Request, res: Response) => {
  try {
    const encodeFull4kClip = Boolean(req.body?.encodeFull4kClip);
    const status = await triggerServerSuperResolution({ encodeFull4kClip });
    return res.status(200).json(status);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Error al ejecutar el pre-procesamiento Super-Resolution 4K en el servidor.',
      details: err?.message,
    });
  }
});
