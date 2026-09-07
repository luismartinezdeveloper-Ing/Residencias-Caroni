/**
 * Residencias Caroní · Altamira, Caracas
 * Utilidades de Validación Forense y Aseguramiento de Calidad de Datos (Leads VIP)
 * Arquitectura y Desarrollo: Añil Arquitectura & Ing. Luis Martinez
 */

// Lista de dominios de correos temporales, desechables y de pruebas falsas
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  '10minutemail.com',
  'sharklasers.com',
  'yopmail.com',
  'yopmail.fr',
  'dispostable.com',
  'throwawaymail.com',
  'getairmail.com',
  'fakemailgenerator.com',
  'trashmail.com',
  'mytemp.email',
  'mohmal.com',
  'crazymailing.com',
  'nada.ltd',
  'inboxkitten.com',
  'generator.email',
  'dropmail.me',
  'test.com',
  'example.com',
]);

// Prefijos móviles y fijos válidos para Venezuela (+58)
const VENEZUELA_VALID_PREFIXES = ['412', '414', '424', '416', '426', '212'];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Valida si un correo electrónico cumple con sintaxis RFC y no pertenece a un dominio temporal/desechable
 */
export function validateEmailAddress(email: string): ValidationResult {
  const trimmed = (email || '').trim().toLowerCase();
  
  if (!trimmed) {
    return { isValid: false, error: 'Por favor ingrese su correo electrónico.' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Ingrese una dirección de correo electrónico con formato válido.' };
  }

  const domain = trimmed.split('@')[1];
  if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Por favor utilice una dirección de correo corporativa o personal válida (no temporal).',
    };
  }

  return { isValid: true, sanitizedValue: trimmed };
}

/**
 * Valida que un número telefónico tenga la longitud y prefijo legítimos según el país
 */
export function validatePhoneNumber(rawPhone: string, countryCode: string = '+58'): ValidationResult {
  const cleanedDigits = (rawPhone || '').replace(/\D/g, '');

  if (!cleanedDigits || cleanedDigits.length < 6) {
    return { isValid: false, error: 'Por favor ingrese un número de teléfono de contacto válido.' };
  }

  // Descartar secuencias repetitivas evidentes o spam (ej. 0000000000, 1111111111)
  if (/^(\d)\1+$/.test(cleanedDigits)) {
    return { isValid: false, error: 'El número de teléfono ingresado parece no corresponder a una línea activa.' };
  }

  // Descartar secuencias secuenciales como 1234567 u 0123456
  if ('0123456789012345'.includes(cleanedDigits) || '9876543210987654'.includes(cleanedDigits)) {
    return { isValid: false, error: 'El número de teléfono ingresado no es válido.' };
  }

  // Reglas específicas por país
  if (countryCode === '+58') {
    // Si empieza por 0, normalizarlo (ej. 0414 -> 414)
    let nationalNumber = cleanedDigits;
    if (nationalNumber.startsWith('0')) {
      nationalNumber = nationalNumber.substring(1);
    }

    if (nationalNumber.length !== 10) {
      return {
        isValid: false,
        error: 'Para Venezuela (+58), el número debe contener 10 dígitos (ej. 414 123 4567).',
      };
    }

    const prefix = nationalNumber.substring(0, 3);
    if (!VENEZUELA_VALID_PREFIXES.includes(prefix)) {
      return {
        isValid: false,
        error: `El prefijo "${prefix}" no corresponde a una operadora válida en Venezuela (0414, 0424, 0412, 0416, 0426, 0212).`,
      };
    }

    return {
      isValid: true,
      sanitizedValue: nationalNumber,
    };
  }

  if (countryCode === '+1') {
    // USA / Canadá: 10 dígitos en formato NANP
    let usNumber = cleanedDigits;
    if (usNumber.length === 11 && usNumber.startsWith('1')) {
      usNumber = usNumber.substring(1);
    }

    if (usNumber.length !== 10) {
      return {
        isValid: false,
        error: 'Para Estados Unidos / Canadá (+1), el número debe contener 10 dígitos.',
      };
    }

    // Código de área no puede empezar por 0 o 1
    if (usNumber.startsWith('0') || usNumber.startsWith('1')) {
      return {
        isValid: false,
        error: 'El código de área ingresado no es válido para Norteamérica.',
      };
    }

    return { isValid: true, sanitizedValue: usNumber };
  }

  // Otros países (+34, +57, +507, etc.): estándar E.164 entre 7 y 13 dígitos
  if (cleanedDigits.length < 7 || cleanedDigits.length > 13) {
    return {
      isValid: false,
      error: 'La cantidad de dígitos no corresponde al estándar internacional del país seleccionado.',
    };
  }

  return { isValid: true, sanitizedValue: cleanedDigits };
}

/**
 * Valida el nombre completo asegurando apellido y sin caracteres spam
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = (name || '').trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Por favor ingrese su nombre y apellido completo.' };
  }

  // Evitar que coloquen solo números o caracteres especiales
  if (/^[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'El nombre debe contener caracteres alfabéticos válidos.' };
  }

  // Al menos dos palabras para nombre y apellido (recomendado en perfil VIP)
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return { isValid: false, error: 'Por favor ingrese tanto su nombre como su apellido.' };
  }

  return { isValid: true, sanitizedValue: trimmed };
}
