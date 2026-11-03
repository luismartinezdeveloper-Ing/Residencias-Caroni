import { describe, it, expect, vi, afterEach } from 'vitest';
import { processLeadSubmission, validateLeadPayload } from '../processLead';

const VALID_LEAD = {
  fullName: 'Inversor Patrimonial',
  email: 'inversor@familyoffice.com',
  phone: '0414 555 1234',
  countryCode: '+58',
  unitInterest: 'Penthouse Norte',
};

const ENV = { JWT_SECRET: 'z'.repeat(40), CRM_WEBHOOK_URL: 'https://crm.test/hook' };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('processLead - validación en servidor', () => {
  it('normaliza un lead válido', () => {
    const { lead } = validateLeadPayload(VALID_LEAD);
    expect(lead?.phone).toBe('+58 4145551234');
    expect(lead?.email).toBe('inversor@familyoffice.com');
  });

  it('rechaza correos desechables, teléfonos falsos y nombres incompletos', () => {
    expect(validateLeadPayload({ ...VALID_LEAD, email: 'x@mailinator.com' }).error).toBeTruthy();
    expect(validateLeadPayload({ ...VALID_LEAD, phone: '1111111111' }).error).toBeTruthy();
    expect(validateLeadPayload({ ...VALID_LEAD, fullName: 'Pedro' }).error).toBeTruthy();
    expect(validateLeadPayload(null).error).toBeTruthy();
  });
});

describe('processLead - entrega a webhooks', () => {
  it('devuelve accessToken cuando el CRM confirma', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await processLeadSubmission(VALID_LEAD, ENV);
    expect(result.status).toBe(200);
    expect(typeof result.body.accessToken).toBe('string');
  });

  it('responde 502 si todos los webhooks fallan, para que el cliente reintente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await processLeadSubmission(VALID_LEAD, ENV);
    expect(result.status).toBe(502);
  });

  it('no registra datos personales en los logs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await processLeadSubmission(VALID_LEAD, ENV);
    const output = log.mock.calls.flat().join(' ');
    expect(output).not.toContain(VALID_LEAD.email);
    expect(output).not.toContain(VALID_LEAD.fullName);
  });

  it('honeypot: simula éxito sin llamar a los webhooks', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await processLeadSubmission({ ...VALID_LEAD, company_website: 'http://spam' }, ENV);
    expect(result.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
