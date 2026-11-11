import { describe, it, expect } from 'vitest';
import { calculateCommercialRounding } from '@/lib/domain/commercial-rounding';

describe('commercial-rounding', () => {
  it('redondea a la presentación comercial y calcula el sobrante', () => {
    const recommendation = calculateCommercialRounding(450, 'g', {
      name: 'Bolsa 500g',
      quantityInBaseUnit: 500,
      unit: 'g',
    });

    expect(recommendation).toBeDefined();
    expect(recommendation?.packageCount).toBe(1);
    expect(recommendation?.totalAmountInBaseUnit).toBe(500);
    expect(recommendation?.surplusInBaseUnit).toBe(50);
  });

  it('calcula múltiples paquetes si la necesidad supera el tamaño comercial', () => {
    const recommendation = calculateCommercialRounding(1200, 'g', {
      name: 'Bolsa 1 kg',
      quantityInBaseUnit: 1000,
      unit: 'g',
    });

    expect(recommendation).toBeDefined();
    expect(recommendation?.packageCount).toBe(2);
    expect(recommendation?.totalAmountInBaseUnit).toBe(2000);
    expect(recommendation?.surplusInBaseUnit).toBe(800);
  });

  it('retorna surplus 0 si la cantidad requerida es múltiplo exacto', () => {
    const recommendation = calculateCommercialRounding(1000, 'g', {
      name: 'Bolsa 500g',
      quantityInBaseUnit: 500,
      unit: 'g',
    });

    expect(recommendation?.packageCount).toBe(2);
    expect(recommendation?.surplusInBaseUnit).toBe(0);
  });
});
