/**
 * Repositorio Desacoplado y Transaccional de Leads & Acreditaciones
 * Residencias Caroní · Altamira, Caracas
 * Ingeniería de Software: Ing. Luis Martinez
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
}

export interface ILeadRepository {
  saveLead(lead: LeadRecord): Promise<void>;
  getAllLeads(): Promise<LeadRecord[]>;
  getUnsyncedLeads(): Promise<LeadRecord[]>;
  markSynced(leadId: string, target: 'gsheets' | 'crm'): Promise<void>;
}

export class JsonFileLeadRepository implements ILeadRepository {
  private filePath: string;
  private memoryCache: LeadRecord[] = [];
  private isInitialized = false;
  private maxStoredLeads: number;

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

  private persistToDisk() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.memoryCache, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.filePath);
    } catch (err) {
      console.warn('[LeadRepository] Fallo al persistir en disco (posible entorno de solo lectura):', err);
    }
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

    this.persistToDisk();
  }

  public async getAllLeads(): Promise<LeadRecord[]> {
    this.ensureInitialized();
    return [...this.memoryCache];
  }

  public async getUnsyncedLeads(): Promise<LeadRecord[]> {
    this.ensureInitialized();
    return this.memoryCache.filter(
      (lead) => lead.syncedGSheets === false || lead.syncedCrm === false
    );
  }

  public async markSynced(leadId: string, target: 'gsheets' | 'crm'): Promise<void> {
    this.ensureInitialized();
    const lead = this.memoryCache.find((item) => item.id === leadId);
    if (lead) {
      if (target === 'gsheets') lead.syncedGSheets = true;
      if (target === 'crm') lead.syncedCrm = true;
      this.persistToDisk();
    }
  }
}
