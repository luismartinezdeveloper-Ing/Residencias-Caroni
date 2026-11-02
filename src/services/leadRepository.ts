/**
 * Repositorio Desacoplado y Transaccional de Leads & Acreditaciones
 * Residencias Caroní · Altamira, Caracas
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Ingeniería de Software: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */

import fs from 'fs';
import path from 'path';

export interface LeadRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode?: string;
  unitInterest: string;
  interestType?: string;
  source?: string;
  accreditationStatus: string;
  timestamp: string;
  ip: string;
  syncedGSheets?: boolean;
  syncedCrm?: boolean;
  quarantineStatus?: 'DLQ_MAX_RETRIES' | 'VALIDATION_FAILED';
  quarantineReason?: string;
}

export interface ILeadRepository {
  saveLead(lead: LeadRecord): Promise<void>;
  getAllLeads(): Promise<LeadRecord[]>;
  getUnsyncedLeads(): Promise<LeadRecord[]>;
  markSynced(leadId: string, target: 'gsheets' | 'crm'): Promise<void>;
  markQuarantine?(leadId: string, reason: string): Promise<void>;
  getQuarantineLeads?(): Promise<LeadRecord[]>;
}

export type LeadRepository = ILeadRepository;

export class JsonFileLeadRepository implements ILeadRepository {
  private filePath: string;
  private memoryCache: LeadRecord[] = [];
  private isInitialized = false;
  private maxStoredLeads: number;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath?: string, maxStoredLeads: number = 1000) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'leads_store.json');
    this.maxStoredLeads = maxStoredLeads;
  }

  private ensureInitialized() {
    if (this.isInitialized) return;

    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.memoryCache = parsed;
        }
      } else {
        fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('[LeadRepository] Advertencia al inicializar almacenamiento en disco, operando en memoria:', err);
    }
    this.isInitialized = true;
  }

  /**
   * Cola de escritura asíncrona secuencial (Async Mutex).
   * Elimina colisiones de archivo temporal (EPERM en Windows) y evita el bloqueo del Event Loop.
   */
  private async persistToDisk(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
          await fs.promises.mkdir(dir, { recursive: true });
        }

        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const tmpPath = `${this.filePath}.tmp.${uniqueSuffix}`;
        const payload = JSON.stringify(this.memoryCache, null, 2);

        await fs.promises.writeFile(tmpPath, payload, 'utf-8');

        // Mecanismo de reintento atómico para evitar bloqueos breves de indexadores o antivirus en Windows
        let retries = 3;
        while (retries > 0) {
          try {
            await fs.promises.rename(tmpPath, this.filePath);
            break;
          } catch (renameErr) {
            retries--;
            if (retries === 0) {
              await fs.promises.writeFile(this.filePath, payload, 'utf-8');
              try {
                await fs.promises.unlink(tmpPath);
              } catch {
                // Silencioso en caso de limpieza de temporal
              }
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 20 * (4 - retries)));
          }
        }
      } catch (err) {
        console.warn('[LeadRepository] Fallo al persistir en disco (posible entorno de solo lectura):', err);
      }
    }).catch((err) => {
      console.error('[LeadRepository] Error en cola de persistencia:', err);
    });

    return this.writeQueue;
  }

  public async saveLead(lead: LeadRecord): Promise<void> {
    this.ensureInitialized();

    const existingIndex = this.memoryCache.findIndex((item) => item.id === lead.id);
    if (existingIndex >= 0) {
      this.memoryCache[existingIndex] = { ...this.memoryCache[existingIndex], ...lead };
    } else {
      if (this.memoryCache.length >= this.maxStoredLeads) {
        this.memoryCache.shift();
      }
      this.memoryCache.push(lead);
    }

    await this.persistToDisk();
  }

  public async getAllLeads(): Promise<LeadRecord[]> {
    this.ensureInitialized();
    return [...this.memoryCache];
  }

  public async getUnsyncedLeads(): Promise<LeadRecord[]> {
    this.ensureInitialized();
    return this.memoryCache.filter(
      (lead) =>
        (lead.syncedGSheets === false || lead.syncedCrm === false) &&
        lead.quarantineStatus === undefined
    );
  }

  public async markSynced(leadId: string, target: 'gsheets' | 'crm'): Promise<void> {
    this.ensureInitialized();
    const lead = this.memoryCache.find((item) => item.id === leadId);
    if (lead) {
      if (target === 'gsheets') lead.syncedGSheets = true;
      if (target === 'crm') lead.syncedCrm = true;
      await this.persistToDisk();
    }
  }

  public async markQuarantine(leadId: string, reason: string): Promise<void> {
    this.ensureInitialized();
    const lead = this.memoryCache.find((item) => item.id === leadId);
    if (lead) {
      lead.quarantineStatus = 'DLQ_MAX_RETRIES';
      lead.quarantineReason = reason;
      await this.persistToDisk();
    }
  }

  public async getQuarantineLeads(): Promise<LeadRecord[]> {
    this.ensureInitialized();
    return this.memoryCache.filter((lead) => lead.quarantineStatus !== undefined);
  }
}
