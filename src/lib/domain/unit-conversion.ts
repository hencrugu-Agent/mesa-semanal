import { UnitType } from '@/types/ingredient';

export interface ConvertedDisplay {
  amount: number;
  unit: UnitType;
  displayText: string;
}

/**
 * Convierte y formatea cantidades a unidades comerciales legibles en el mercado peruano.
 * Por ejemplo:
 * - 1500 g -> 1.5 kg ("1.5 kg" o "kilo y medio")
 * - 750 g -> 750 g
 * - 2000 ml -> 2 L
 * - 4 und -> "4 unidades"
 */
export function formatQuantityWithUnit(amount: number, unit: UnitType): ConvertedDisplay {
  const safeAmount = Math.max(0, Number(amount) || 0);

  if (unit === 'g') {
    if (safeAmount >= 1000) {
      const inKg = safeAmount / 1000;
      const formattedKg = Number.isInteger(inKg)
        ? inKg.toString()
        : inKg.toFixed(2).replace(/\.?0+$/, '');
      return {
        amount: inKg,
        unit: 'kg',
        displayText: `${formattedKg} kg`,
      };
    }
    return {
      amount: safeAmount,
      unit: 'g',
      displayText: `${Math.round(safeAmount)} g`,
    };
  }

  if (unit === 'ml') {
    if (safeAmount >= 1000) {
      const inL = safeAmount / 1000;
      const formattedL = Number.isInteger(inL)
        ? inL.toString()
        : inL.toFixed(2).replace(/\.?0+$/, '');
      return {
        amount: inL,
        unit: 'L',
        displayText: `${formattedL} L`,
      };
    }
    return {
      amount: safeAmount,
      unit: 'ml',
      displayText: `${Math.round(safeAmount)} ml`,
    };
  }

  if (unit === 'und') {
    const rounded = Math.round(safeAmount * 10) / 10;
    return {
      amount: rounded,
      unit: 'und',
      displayText: rounded === 1 ? '1 und.' : `${rounded} unds.`,
    };
  }

  if (unit === 'dientes') {
    return {
      amount: safeAmount,
      unit: 'dientes',
      displayText: safeAmount === 1 ? '1 diente' : `${safeAmount} dientes`,
    };
  }

  return {
    amount: safeAmount,
    unit,
    displayText: `${safeAmount} ${unit}`,
  };
}

/**
 * Normaliza dos cantidades a una unidad común si son compatibles (g con kg, ml con L).
 */
export function convertToBaseUnit(amount: number, unit: UnitType): { amount: number; baseUnit: UnitType } {
  if (unit === 'kg') {
    return { amount: amount * 1000, baseUnit: 'g' };
  }
  if (unit === 'L') {
    return { amount: amount * 1000, baseUnit: 'ml' };
  }
  return { amount, baseUnit: unit };
}
