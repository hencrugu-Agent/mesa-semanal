import { PlannedMeal } from '@/types/menu';
import { PlannedItem, StockItem } from '@/types/purchase';
import { Ingredient } from '@/types/ingredient';
import { normalizeString } from './normalizer';
import { formatQuantityWithUnit, convertToBaseUnit } from './unit-conversion';
import { calculateCommercialRounding } from './commercial-rounding';

/**
 * Totaliza y consolida todos los ingredientes requeridos para los platos de la semana.
 * - Multiplica cada ingrediente por la cantidad de platos asignados.
 * - Consolida ingredientes idénticos sin duplicar (insensible a mayúsculas y tildes).
 * - Descuenta el stock actual disponible en la despensa.
 * - Formatea cantidades comerciales (ej. g a kg).
 */
export function totalizePlannedIngredients(
  meals: PlannedMeal[],
  pantryStock: StockItem[] = [],
  catalogIngredients: Ingredient[] = []
): PlannedItem[] {
  // Mapa agrupador por nombre normalizado
  const aggregatedMap = new Map<
    string,
    {
      originalId: string;
      displayName: string;
      category: PlannedItem['category'];
      totalBaseAmount: number;
      baseUnit: PlannedItem['unit'];
      refPricePerUnit: number;
    }
  >();

  // Iterar por cada comida planificada
  for (const meal of meals) {
    if (meal.status === 'cancelado') continue;
    const plateCount = Math.max(0, meal.plateCount || 1);

    for (const recipeIng of meal.dish.ingredients) {
      const normalizedKey = normalizeString(recipeIng.ingredientName);
      const converted = convertToBaseUnit(recipeIng.amountForOne * plateCount, recipeIng.unit);

      // Buscar datos de catálogo para enriquecer precio referencial
      const catalogInfo = catalogIngredients.find(
        (ci) => normalizeString(ci.name) === normalizedKey || ci.id === recipeIng.ingredientId
      );

      const priceRef = catalogInfo?.priceRefPerBaseUnit || 0;

      if (!aggregatedMap.has(normalizedKey)) {
        aggregatedMap.set(normalizedKey, {
          originalId: recipeIng.ingredientId,
          displayName: recipeIng.ingredientName,
          category: recipeIng.category,
          totalBaseAmount: converted.amount,
          baseUnit: converted.baseUnit,
          refPricePerUnit: priceRef,
        });
      } else {
        const current = aggregatedMap.get(normalizedKey)!;
        current.totalBaseAmount += converted.amount;
      }
    }
  }

  // Mapa de stock actual por nombre normalizado
  const stockMap = new Map<string, number>();
  for (const item of pantryStock) {
    const key = normalizeString(item.ingredientName);
    const converted = convertToBaseUnit(item.currentAmount, item.unit);
    const current = stockMap.get(key) || 0;
    stockMap.set(key, current + converted.amount);
  }

  // Construir lista de items planificados
  const result: PlannedItem[] = [];

  for (const [key, item] of aggregatedMap.entries()) {
    const stockAvailable = stockMap.get(key) || 0;
    const needed = item.totalBaseAmount;
    const coveredByStock = Math.min(needed, stockAvailable);
    const netToBuy = Math.max(0, needed - coveredByStock);

    const displayNeededObj = formatQuantityWithUnit(needed, item.baseUnit);
    const displayNetToBuyObj = formatQuantityWithUnit(netToBuy, item.baseUnit);

    // Buscar recomendación comercial
    const catalogInfo = catalogIngredients.find(
      (ci) => normalizeString(ci.name) === key || ci.id === item.originalId
    );
    const commercialRec = catalogInfo?.commercialPackage
      ? calculateCommercialRounding(netToBuy, item.baseUnit, catalogInfo.commercialPackage)
      : undefined;

    const estimatedCost = netToBuy * item.refPricePerUnit;

    result.push({
      ingredientId: item.originalId,
      name: item.displayName,
      category: item.category,
      neededAmount: needed,
      unit: item.baseUnit,
      coveredByStock,
      netToBuyAmount: netToBuy,
      displayNeeded: displayNeededObj.displayText,
      displayNetToBuy: displayNetToBuyObj.displayText,
      commercialRecommendation: commercialRec
        ? {
            packageName: commercialRec.packageName,
            packageCount: commercialRec.packageCount,
            totalAmount: commercialRec.totalAmountInBaseUnit,
            surplus: commercialRec.surplusInBaseUnit,
          }
        : undefined,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      isChecked: false,
    });
  }

  // Ordenar por categoría y luego alfabéticamente
  return result.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}
