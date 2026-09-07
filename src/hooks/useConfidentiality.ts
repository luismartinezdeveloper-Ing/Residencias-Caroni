import { useContext } from 'react';
import { ConfidentialityContext } from '../context/confidentialityTypes';

export const useConfidentiality = () => {
  const context = useContext(ConfidentialityContext);
  if (!context) {
    throw new Error('useConfidentiality must be used within a ConfidentialityProvider');
  }
  return context;
};
