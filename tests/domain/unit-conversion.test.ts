import { describe, it, expect } from 'vitest';
import { formatQuantityWithUnit, convertToBaseUnit } from '@/lib/domain/unit-conversion';

describe('unit-conversion', () => {
  it('convierte gramos mayores o iguales a 1000 en kilogramos legibles', () => {
    expect(formatQuantityWithUnit(1000, 'g').displayText).toBe('1 kg');
    expect(formatQuantityWithUnit(1500, 'g').displayText).toBe('1.5 kg');
    expect(formatQuantityWithUnit(2250, 'g').displayText).toBe('2.25 kg');
    expect(formatQuantityWithUnit(750, 'g').displayText).toBe('750 g');
  });

  it('convierte mililitros mayores o iguales a 1000 en litros', () => {
    expect(formatQuantityWithUnit(1000, 'ml').displayText).toBe('1 L');
    expect(formatQuantityWithUnit(1750, 'ml').displayText).toBe('1.75 L');
    expect(formatQuantityWithUnit(500, 'ml').displayText).toBe('500 ml');
  });

  it('formatea unidades individuales y plurales', () => {
    expect(formatQuantityWithUnit(1, 'und').displayText).toBe('1 und.');
    expect(formatQuantityWithUnit(4, 'und').displayText).toBe('4 unds.');
  });

  it('convierte a unidad base para cálculos internos', () => {
    expect(convertToBaseUnit(1.5, 'kg')).toEqual({ amount: 1500, baseUnit: 'g' });
    expect(convertToBaseUnit(2, 'L')).toEqual({ amount: 2000, baseUnit: 'ml' });
    expect(convertToBaseUnit(300, 'g')).toEqual({ amount: 300, baseUnit: 'g' });
  });
});
