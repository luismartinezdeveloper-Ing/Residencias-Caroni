import { Router } from 'express';
import { ILeadRepository } from '../../src/services/leadRepository';

export function createHealthRouter(leadRepository: ILeadRepository): Router {
  const router = Router();

  router.get('/api/health', async (req, res) => {
    try {
      const allLeads = await leadRepository.getAllLeads();
      const unsyncedLeads = await leadRepository.getUnsyncedLeads();
      const quarantinedLeads = typeof leadRepository.getQuarantineLeads === 'function'
        ? await leadRepository.getQuarantineLeads()
        : [];

      const mem = process.memoryUsage();

      return res.status(200).json({
        status: 'ok',
        service: 'Residencias Caroní · API Gateway',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        metrics: {
          memory: {
            heapUsedMB: +(mem.heapUsed / 1024 / 1024).toFixed(2),
            heapTotalMB: +(mem.heapTotal / 1024 / 1024).toFixed(2),
            rssMB: +(mem.rss / 1024 / 1024).toFixed(2),
          },
          leads: {
            totalStored: allLeads.length,
            pendingSync: unsyncedLeads.length,
            inQuarantine: quarantinedLeads.length,
          },
          liveVoice: {
            endpoint: '/api/live',
            status: 'operational',
          },
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        status: 'error',
        error: err?.message || 'Error al obtener telemetría del sistema',
      });
    }
  });

  return router;
}

