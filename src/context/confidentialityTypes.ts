import { createContext } from 'react';
import { LeadRecord } from '../services/leadService';

export interface InvestorCredentials {
  holderName: string;
  representativeOrg?: string;
  accessCode: string;
  isAccredited: boolean;
  unlockedAt?: string;
  leadData?: LeadRecord;
}

export interface ConfidentialityContextType {
  isAccredited: boolean;
  credentials: InvestorCredentials | null;
  activeLead: LeadRecord | null;
  authenticate: (name: string, code: string, org?: string) => Promise<boolean>;
  unlockWithLead: (lead: LeadRecord) => void;
  revokeAccess: () => void;
  isAuthModalOpen: boolean;
  isAdvisorMode: boolean;
  toggleAdvisorMode: () => void;
  openAuthModal: (targetSection?: string) => void;
  closeAuthModal: () => void;
  targetAfterAuth?: string;
}

export const ConfidentialityContext = createContext<ConfidentialityContextType | undefined>(undefined);
