import { describe, it, expect } from 'vitest';
import { getDomainFallbackReply } from '../aiDomainFallback';
import { UNITS_DATA } from '../../data/brandData';

describe('aiDomainFallback (Catálogo Offline Bilingüe ES/EN)', () => {
  it('devuelve las unidades disponibles reales de UNITS_DATA en español', () => {
    const expectedAvailableCount = UNITS_DATA.filter((u) => u.status === 'disponible').length;
    const reply = getDomainFallbackReply('¿Qué unidades están disponibles?', undefined, 'es');

    expect(reply).toContain(`${expectedAvailableCount} unidades disponibles`);
    expect(reply).toContain('Residencias Caroní');
  });

  it('devuelve respuesta en inglés al especificar locale="en"', () => {
    const reply = getDomainFallbackReply('What units are currently available?', undefined, 'en');

    expect(reply).toContain('authored residences');
    expect(reply).toContain('offline catalog');
  });

  it('detalla ficha verificada de una residencia específica (Mirador Norte)', () => {
    const mirador = UNITS_DATA.find((u) => u.id === 'mirador-norte')!;
    const replyEs = getDomainFallbackReply('Dame la ficha de Mirador Norte', undefined, 'es');
    const replyEn = getDomainFallbackReply('Specs for Mirador Norte unit', undefined, 'en');

    expect(replyEs).toContain(String(mirador.totalArea));
    expect(replyEs).toContain('Superficie total');
    expect(replyEn).toContain('Total Area');
    expect(replyEn).toContain(String(mirador.parkingSpots));
  });

  it('responde precios referenciales y protocolo LOI sin conectividad', () => {
    const replyEs = getDomainFallbackReply('¿Cuál es el precio y proceso de reserva?', 'jardin-sur', 'es');
    const replyEn = getDomainFallbackReply('What is the price range and escrow process?', 'jardin-sur', 'en');

    expect(replyEs).toContain('$2.400 a $3.000 USD');
    expect(replyEs).toContain('Escrow');
    expect(replyEn).toContain('$2,400 to $3,000 USD');
    expect(replyEn).toContain('Escrow');
  });
});
