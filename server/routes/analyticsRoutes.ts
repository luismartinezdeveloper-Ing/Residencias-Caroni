import { Router } from 'express';

/**
 * Receptor de Analítica & Tracking de Conversión First-Party — Residencias Caroní
 * Ingeniería de Software: Ing. Luis Martinez
 */
export const analyticsRouter = Router();

const ALLOWED_EVENTS = new Set([
  'page_view',
  'section_view',
  'lead_gate_open',
  'lead_gate_submit',
  'vip_code_verified',
  'model_3d_open',
  'model_3d_view_mode',
  'unit_selected',
  'advisor_open',
  'advisor_message_sent',
  'cta_schedule_click',
  'cta_whatsapp_click',
  'locale_change',
  'video_adaptive_stream',
]);

const eventCounters: Record<string, number> = {};
let lastRecordedAt: string | null = null;

analyticsRouter.post('/api/analytics', (req, res) => {
  const event = typeof req.body?.event === 'string' ? req.body.event.trim() : '';
  if (!ALLOWED_EVENTS.has(event)) {
    return res.status(400).json({ error: 'Evento de analítica no reconocido.' });
  }

  eventCounters[event] = (eventCounters[event] || 0) + 1;
  lastRecordedAt = new Date().toISOString();

  return res.status(202).json({ accepted: true, event });
});

analyticsRouter.get('/api/analytics/summary', (_req, res) => {
  const totalEvents = Object.values(eventCounters).reduce((sum, count) => sum + count, 0);
  res.json({
    totalEvents,
    lastRecordedAt,
    counts: { ...eventCounters },
  });
});
