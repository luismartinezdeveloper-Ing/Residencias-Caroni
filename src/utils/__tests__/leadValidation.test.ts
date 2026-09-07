// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  validateFullName,
  validateEmailAddress,
  validatePhoneNumber,
  DISPOSABLE_EMAIL_DOMAINS,
} from '../leadValidation';

describe('leadValidation - Calidad y Aseguramiento Forense de Leads', () => {
  describe('validateEmailAddress', () => {
    it('debe aceptar correos corporativos y personales válidos', () => {
      const validEmails = [
        'inversiones@holding.com',
        'carlos.mendoza@empresa.com.ve',
        'vp.finanzas@patrimonio.ch',
        'contacto@familyoffice.es',
      ];

      for (const email of validEmails) {
        const res = validateEmailAddress(email);
        expect(res.isValid).toBe(true);
        expect(res.sanitizedValue).toBe(email.toLowerCase());
      }
    });

    it('debe bloquear dominios de correos temporales/desechables', () => {
      const disposableEmails = [
        'bot123@mailinator.com',
        'tester@tempmail.com',
        'fake@guerrillamail.com',
        'spammer@10minutemail.com',
        'throw@yopmail.com',
        'test@test.com',
      ];

      for (const email of disposableEmails) {
        const res = validateEmailAddress(email);
        expect(res.isValid).toBe(false);
        expect(res.error).toContain('no temporal');
      }
    });

    it('debe rechazar correos sin estructura o vacíos', () => {
      expect(validateEmailAddress('').isValid).toBe(false);
      expect(validateEmailAddress('sin-arroba.com').isValid).toBe(false);
      expect(validateEmailAddress('incompleto@').isValid).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('debe validar números legítimos de Venezuela (+58) con prefijos reales', () => {
      const validVE = [
        { raw: '4141234567', expected: '4141234567' },
        { raw: '0412 987 6543', expected: '4129876543' },
        { raw: '0424-555-8899', expected: '4245558899' },
        { raw: '212 999 1122', expected: '2129991122' },
      ];

      for (const item of validVE) {
        const res = validatePhoneNumber(item.raw, '+58');
        expect(res.isValid).toBe(true);
        expect(res.sanitizedValue).toBe(item.expected);
      }
    });

    it('debe rechazar prefijos no válidos para Venezuela', () => {
      const invalidPrefixes = ['4991234567', '4331234567', '5551234567'];
      for (const raw of invalidPrefixes) {
        const res = validatePhoneNumber(raw, '+58');
        expect(res.isValid).toBe(false);
        expect(res.error).toContain('no corresponde a una operadora válida');
      }
    });

    it('debe rechazar secuencias spam, repetitivas o falsas', () => {
      const fakeNumbers = [
        '0000000000',
        '1111111111',
        '1234567',
        '123',
      ];

      for (const raw of fakeNumbers) {
        const res = validatePhoneNumber(raw, '+58');
        expect(res.isValid).toBe(false);
      }
    });

    it('debe validar números de USA/Canadá (+1) con formato de 10 dígitos', () => {
      const validUS = '305 555 1234';
      const res = validatePhoneNumber(validUS, '+1');
      expect(res.isValid).toBe(true);
      expect(res.sanitizedValue).toBe('3055551234');

      const invalidUS = '012 345 6789'; // Código de área no puede empezar por 0
      expect(validatePhoneNumber(invalidUS, '+1').isValid).toBe(false);
    });
  });

  describe('validateFullName', () => {
    it('debe requerir al menos nombre y apellido para el perfil institucional', () => {
      expect(validateFullName('Carlos Mendoza').isValid).toBe(true);
      expect(validateFullName('Dra. Maria Eugenia Perez').isValid).toBe(true);
      expect(validateFullName('Carlos').isValid).toBe(false); // Solo 1 palabra
      expect(validateFullName('123456').isValid).toBe(false); // Caracteres no alfabéticos
    });
  });
});
