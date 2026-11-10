import { UnitType } from '@/types/ingredient';

export interface CommercialRecommendation {
  packageName: string;
  packageCount: number;
  totalAmountInBaseUnit: number;
  surplusInBaseUnit: number;
  explanation: string;
}

/**
 * Redondea la cantidad requerida a la presentación comercial disponible en el mercado.
 * Ejemplo:
 * - Se requieren 450g de lentejas, la presentación es "Bolsa 500g" -> sugiere 1 bolsa (500g) y 50g excedente.
 * - Se requieren 1200g de arroz, presentación es "Bolsa 1 kg" -> sugiere 2 bolsas (2 kg) y 800g excedente.
 */
export function calculateCommercialRounding(
  neededAmount: number,
  unit: UnitType,
  packageInfo?: {
    name: string;
    quantityInBaseUnit: number;
    unit: UnitType;
  }
): CommercialRecommendation | undefined {
  if (!packageInfo || packageInfo.quantityInBaseUnit <= 0 || neededAmount <= 0) {
    return undefined;
  }

  const pkgSize = packageInfo.quantityInBaseUnit;
  const packagesNeeded = Math.ceil(neededAmount / pkgSize);
  const totalProvided = packagesNeeded * pkgSize;
  const surplus = Math.max(0, totalProvided - neededAmount);

  return {
    packageName: packageInfo.name,
    packageCount: packagesNeeded,
    totalAmountInBaseUnit: totalProvided,
    surplusInBaseUnit: surplus,
    explanation: `${packagesNeeded} x ${packageInfo.name} (${totalProvided} ${unit}) - Sobrante: ${surplus} ${unit} para saldo`,
  };
}
