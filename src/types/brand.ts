export interface BrandColor {
  name: string;
  subName: string;
  hex: string;
  rgb: string;
  cmyk: string;
  pantone: string;
  functionDesc: string;
  contrastWhite: number;
  contrastCream: number;
  minPtUsage: string;
}

export interface UnitData {
  id: string;
  code: string;
  name: string;
  typology: 'Jardín' | 'Residencia' | 'Mirador';
  orientation: 'Norte' | 'Sur';
  level: string;
  character: string;
  interiorArea: number; // m²
  terraceArea: number; // m²
  gardenArea?: number; // m²
  totalArea: number; // m²
  rooms: number;
  parkingSpots: number;
  storageUnits: number;
  status: 'comprometida' | 'disponible' | 'en_reserva';
  statusLabel: 'Atención' | 'Normal' | 'Inactivo';
  floorPlanDescriptor: string;
  distinctiveAttribute: string;
  roomList: string[];
}

export interface MilestoneData {
  id: number;
  name: string;
  targetDate: string;
  percentage: number;
  certifiedValueUsd: number;
  status: 'completado' | 'en_curso' | 'pendiente';
  description: string;
}

export interface IncorrectUse {
  number: string;
  title: string;
  reason: string;
  visualKind: string;
}

export interface MasterMessage {
  text: string;
  functionType: string;
  usagePlace: string;
}

export interface ChecklistItem {
  id: number;
  question: string;
  detail: string;
  importance: 'Norma dura' | 'Comprobación';
}
