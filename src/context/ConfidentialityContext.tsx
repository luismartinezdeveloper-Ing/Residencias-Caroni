import React, { useState } from 'react';
import { LeadRecord, getActiveLead } from '../services/leadService';
import { ConfidentialityContext, InvestorCredentials } from './confidentialityTypes';

export { type InvestorCredentials } from './confidentialityTypes';

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

    if (isValid) {
      const creds: InvestorCredentials = {
        holderName: name.trim() || 'Comprador Acreditado',
        representativeOrg: org?.trim() || 'Fideicomiso Patrimonial Privado',
        accessCode: normalizedCode,
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

export { useConfidentiality } from '../hooks/useConfidentiality';
