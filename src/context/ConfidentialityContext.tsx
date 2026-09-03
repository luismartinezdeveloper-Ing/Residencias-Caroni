import React, { createContext, useContext, useState, useEffect } from 'react';
import { LeadRecord, getActiveLead } from '../services/leadService';

export interface InvestorCredentials {
  holderName: string;
  representativeOrg?: string;
  accessCode: string;
  isAccredited: boolean;
  unlockedAt?: string;
  leadData?: LeadRecord;
}

interface ConfidentialityContextType {
  isAccredited: boolean;
  credentials: InvestorCredentials | null;
  activeLead: LeadRecord | null;
  authenticate: (name: string, code: string, org?: string) => boolean;
  unlockWithLead: (lead: LeadRecord) => void;
  revokeAccess: () => void;
  isAuthModalOpen: boolean;
  isAdvisorMode: boolean;
  toggleAdvisorMode: () => void;
  openAuthModal: (targetSection?: string) => void;
  closeAuthModal: () => void;
  targetAfterAuth?: string;
}

const ConfidentialityContext = createContext<ConfidentialityContextType | undefined>(undefined);

const VALID_ACCESS_CODES = ['ANIL-2026', 'CARONI-VIII', 'LANCARA', 'PATRIMONIAL', 'VIP-CARONI'];

export const ConfidentialityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAccredited, setIsAccredited] = useState<boolean>(() => {
    return localStorage.getItem('caroni_accredited') === 'true';
  });

  const [activeLead, setActiveLead] = useState<LeadRecord | null>(() => {
    return getActiveLead();
  });

  const [credentials, setCredentials] = useState<InvestorCredentials | null>(() => {
    const saved = localStorage.getItem('caroni_credentials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    const lead = getActiveLead();
    if (lead) {
      return {
        holderName: lead.fullName,
        representativeOrg: lead.interestType === 'inversion' ? 'Inversión Patrimonial' : 'Cliente Privado',
        accessCode: 'LEAD-DESBLOQUEADO',
        isAccredited: true,
        unlockedAt: lead.timestamp,
        leadData: lead,
      };
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdvisorMode, setIsAdvisorMode] = useState<boolean>(false);
  const [targetAfterAuth, setTargetAfterAuth] = useState<string | undefined>(undefined);

  const unlockWithLead = (lead: LeadRecord) => {
    const creds: InvestorCredentials = {
      holderName: lead.fullName,
      representativeOrg: lead.interestType === 'family_office' ? 'Family Office / Fondo' : lead.interestType === 'inversion' ? 'Inversión Patrimonial' : 'Residencial',
      accessCode: 'LEAD-DESBLOQUEADO',
      isAccredited: true,
      unlockedAt: lead.timestamp,
      leadData: lead,
    };
    setIsAccredited(true);
    setActiveLead(lead);
    setCredentials(creds);
    localStorage.setItem('caroni_accredited', 'true');
    localStorage.setItem('caroni_credentials', JSON.stringify(creds));
    setIsAuthModalOpen(false);
  };

  const authenticate = (name: string, code: string, org?: string): boolean => {
    const normalizedCode = code.trim().toUpperCase();
    const isValid = VALID_ACCESS_CODES.includes(normalizedCode) || normalizedCode.startsWith('RCAR-');

    if (isValid || name.trim().length > 3) {
      const creds: InvestorCredentials = {
        holderName: name.trim() || 'Comprador Acreditado',
        representativeOrg: org?.trim() || 'Fideicomiso Patrimonial Privado',
        accessCode: normalizedCode || 'CITA-DIRECTA',
        isAccredited: true,
        unlockedAt: new Date().toISOString(),
      };
      setIsAccredited(true);
      setCredentials(creds);
      localStorage.setItem('caroni_accredited', 'true');
      localStorage.setItem('caroni_credentials', JSON.stringify(creds));
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const revokeAccess = () => {
    setIsAccredited(false);
    setCredentials(null);
    setActiveLead(null);
    localStorage.removeItem('caroni_accredited');
    localStorage.removeItem('caroni_credentials');
    localStorage.removeItem('caroni_active_lead');
  };

  const openAuthModal = (targetSection?: string) => {
    setTargetAfterAuth(targetSection);
    setIsAuthModalOpen(true);
  };

  const toggleAdvisorMode = () => setIsAdvisorMode(prev => !prev);

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <ConfidentialityContext.Provider
      value={{
        isAccredited,
        credentials,
        activeLead,
        authenticate,
        unlockWithLead,
        revokeAccess,
        isAuthModalOpen,
        openAuthModal,
        isAdvisorMode,
        toggleAdvisorMode,
        closeAuthModal,
        targetAfterAuth,
      }}
    >
      {children}
    </ConfidentialityContext.Provider>
  );
};

export const useConfidentiality = () => {
  const context = useContext(ConfidentialityContext);
  if (!context) {
    throw new Error('useConfidentiality must be used within a ConfidentialityProvider');
  }
  return context;
};
