import { describe, it, expect } from 'vitest';
import { normalizeString, areIngredientsEqual } from '@/lib/domain/normalizer';

describe('normalizer', () => {
  it('elimina tildes y diacríticos correctamente', () => {
    expect(normalizeString('Ají amarillo')).toBe('aji amarillo');
    expect(normalizeString('Cebólla rója')).toBe('cebolla roja');
    expect(normalizeString('Limón sútil')).toBe('limon sutil');
  });

  it('colapsa espacios múltiples y pasa a minúsculas', () => {
    expect(normalizeString('   PECHUGA    DE   POLLO   ')).toBe('pechuga de pollo');
  });

  it('determina igualdad entre variantes ortográficas', () => {
    expect(areIngredientsEqual('Lentejas bebé', 'Lentejas Bebe')).toBe(true);
    expect(areIngredientsEqual('Arroz Extra', 'arroz extra')).toBe(true);
    expect(areIngredientsEqual('Papa Amarilla', 'Papa Blanca')).toBe(false);
  });
});
