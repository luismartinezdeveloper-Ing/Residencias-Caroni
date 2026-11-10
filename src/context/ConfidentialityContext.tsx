import React, { useState } from 'react';
import { LeadRecord, getActiveLead } from '../services/leadService';
import { ConfidentialityContext, InvestorCredentials } from './confidentialityTypes';

export { type InvestorCredentials } from './confidentialityTypes';

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
  const [isAdvisorMode, setIsAdvisorMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('caroni_advisor_mode');
    if (savedMode !== null) return savedMode === 'true';
    return localStorage.getItem('caroni_accredited') === 'true';
  });
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
    setIsAdvisorMode(true);
    localStorage.setItem('caroni_accredited', 'true');
    localStorage.setItem('caroni_advisor_mode', 'true');
    localStorage.setItem('caroni_credentials', JSON.stringify(creds));
    setIsAuthModalOpen(false);
  };

  const LOCAL_VALID_CODES = ['ANIL-2026', 'CARONI-VIII', 'LANCARA', 'PATRIMONIAL', 'VIP-CARONI'];

  const applyAccreditation = (name: string, normalizedCode: string, org?: string, accessToken?: string) => {
    const creds: InvestorCredentials = {
      holderName: name.trim() || 'Comprador Acreditado',
      representativeOrg: org?.trim() || 'Fideicomiso Patrimonial Privado',
      accessCode: normalizedCode,
      isAccredited: true,
      unlockedAt: new Date().toISOString(),
    };
    setIsAccredited(true);
    setCredentials(creds);
    setIsAdvisorMode(true);
    try {
      localStorage.setItem('caroni_accredited', 'true');
      localStorage.setItem('caroni_advisor_mode', 'true');
      localStorage.setItem('caroni_credentials', JSON.stringify(creds));
      if (accessToken) {
        localStorage.setItem('caroni_access_token', accessToken);
      }
    } catch {
      // Safe fallback for restricted storage mode
    }
    setIsAuthModalOpen(false);
  };

  const authenticate = async (name: string, code: string, org?: string): Promise<boolean> => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const isLocallyValid =
      LOCAL_VALID_CODES.includes(normalizedCode) || /^RCAR-[A-Z0-9]{4,12}$/.test(normalizedCode);

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), code: normalizedCode, org: org?.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          applyAccreditation(name, normalizedCode, org, data.accessToken);
          return true;
        }
      }

      if (isLocallyValid) {
        applyAccreditation(name, normalizedCode, org);
        return true;
      }

      return false;
    } catch {
      // Silent offline/network recovery: validate against local institutional code pattern
      if (isLocallyValid) {
        applyAccreditation(name, normalizedCode, org);
        return true;
      }
      return false;
    }
  };

  const revokeAccess = () => {
    setIsAccredited(false);
    setIsAdvisorMode(false);
    setCredentials(null);
    setActiveLead(null);
    localStorage.removeItem('caroni_accredited');
    localStorage.removeItem('caroni_advisor_mode');
    localStorage.removeItem('caroni_credentials');
    localStorage.removeItem('caroni_active_lead');
  };

  const openAuthModal = (targetSection?: string) => {
    setTargetAfterAuth(targetSection);
    setIsAuthModalOpen(true);
  };

  const toggleAdvisorMode = () => {
    setIsAdvisorMode(prev => {
      const next = !prev;
      localStorage.setItem('caroni_advisor_mode', String(next));
      return next;
    });
  };

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
