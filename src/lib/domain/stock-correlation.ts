import { WarehouseItem } from '@/types/purchase';
import { RecipeIngredient } from '@/types/ingredient';
import { normalizeString } from './normalizer';

/**
 * Normaliza cualquier unidad (texto libre o formal) a una clave base de comparación:
 * - 'kg', 'kilos', 'kilogramos' -> 'kg'
 * - 'g', 'gramos', 'gr', 'grs' -> 'g'
 * - 'l', 'lt', 'litros' -> 'L'
 * - 'ml', 'mililitros', 'cc' -> 'ml'
 * - 'und', 'unidades', 'unidad', 'cabezas', 'paquete', 'tronco', etc.
 */
export function normalizeUnitKey(unitStr: string): string {
  if (!unitStr) return 'und';
  const u = unitStr.toLowerCase().replace(/[^a-záéíóú0-9]/g, '').trim();
  if (['g', 'gr', 'grs', 'gramo', 'gramos'].includes(u)) return 'g';
  if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(u)) return 'kg';
  if (['ml', 'mls', 'mililitro', 'mililitros', 'cc'].includes(u)) return 'ml';
  if (['l', 'lt', 'lts', 'litro', 'litros'].includes(u)) return 'l';
  if (['diente', 'dientes'].includes(u)) return 'dientes';
  return u;
}

/**
 * Convierte una cantidad de `fromUnit` a `toUnit` si son compatibles (ej. g <-> kg, ml <-> L).
 * Si no son convertibles directamente, devuelve null.
 */
export function convertQuantityBetweenUnits(
  amount: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const fromKey = normalizeUnitKey(fromUnit);
  const toKey = normalizeUnitKey(toUnit);

  if (fromKey === toKey) return amount;

  // Peso: g y kg
  if (fromKey === 'g' && toKey === 'kg') return amount / 1000;
  if (fromKey === 'kg' && toKey === 'g') return amount * 1000;

  // Volumen: ml y l
  if (fromKey === 'ml' && toKey === 'l') return amount / 1000;
  if (fromKey === 'l' && toKey === 'ml') return amount * 1000;

  return null;
}

/**
 * Busca si un ingrediente de una receta coincide con algún ítem del almacén.
 * Compara por nombre normalizado (ej. "Papa blanca", "Pechuga de pollo", etc.).
 */
export function findMatchingWarehouseItem(
  ingredientName: string,
  warehouseItems: WarehouseItem[]
): WarehouseItem | undefined {
  const targetNorm = normalizeString(ingredientName);
  
  // 1. Coincidencia exacta normalizada
  const exact = warehouseItems.find((w) => normalizeString(w.name) === targetNorm);
  if (exact) return exact;

  // 2. Coincidencia por contención (ej. "Pechuga de pollo fresca" <-> "Pechuga de pollo")
  const partial = warehouseItems.find((w) => {
    const wNorm = normalizeString(w.name);
    return targetNorm.includes(wNorm) || wNorm.includes(targetNorm);
  });

  return partial;
}

/**
 * Suma una compra de ingrediente al Almacén (ECUACIÓN MATEMÁTICA: Sumar al comprar o donar).
 * Si el ítem ya existe en el almacén, suma la cantidad (respetando/convirtiendo unidades compatibles).
 * Si no existe, crea un nuevo ítem en el almacén con la categoría y unidad correspondientes.
 */
export function addOrMergeWarehouseStock(
  currentItems: WarehouseItem[],
  newItemData: {
    name: string;
    quantity: number;
    unit: string;
    origin: 'comprado' | 'donado';
    category?: string;
    notes?: string;
  }
): { updatedItems: WarehouseItem[]; affectedItem: WarehouseItem; isNew: boolean } {
  const today = new Date().toLocaleDateString('es-PE');
  const existing = findMatchingWarehouseItem(newItemData.name, currentItems);

  if (existing) {
    // Convertir unidades si es necesario (ej. compra en kg pero stock en g o viceversa)
    const convertedQty = convertQuantityBetweenUnits(newItemData.quantity, newItemData.unit, existing.unit);
    const addedAmount = convertedQty !== null ? convertedQty : newItemData.quantity;

    const updatedItem: WarehouseItem = {
      ...existing,
      quantity: Math.round((existing.quantity + addedAmount) * 1000) / 1000,
      lastUpdated: today,
      notes: newItemData.notes || existing.notes,
    };

    const updatedItems = currentItems.map((item) => (item.id === existing.id ? updatedItem : item));
    return { updatedItems, affectedItem: updatedItem, isNew: false };
  }

  // Si no existe, crear un nuevo ítem en el almacén
  const createdItem: WarehouseItem = {
    id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: newItemData.name,
    quantity: Math.round(newItemData.quantity * 1000) / 1000,
    unit: newItemData.unit,
    origin: newItemData.origin,
    category: newItemData.category || 'Víveres',
    notes: newItemData.notes,
    dateAdded: today,
    lastUpdated: today,
  };

  return {
    updatedItems: [createdItem, ...currentItems],
    affectedItem: createdItem,
    isNew: true,
  };
}

/**
 * Descuenta del Almacén los ingredientes requeridos al preparar un plato (ECUACIÓN MATEMÁTICA: Restar).
 * Por cada ingrediente de la receta multiplicado por `portions`:
 * Stock_Nuevo = max(0, Stock_Actual - Cantidad_Utilizada)
 */
export function deductIngredientsFromWarehouse(
  currentItems: WarehouseItem[],
  dishName: string,
  ingredients: RecipeIngredient[],
  portions: number
): {
  updatedItems: WarehouseItem[];
  deductions: {
    ingredientName: string;
    warehouseItemId: string;
    warehouseItemName: string;
    previousQty: number;
    deductedQty: number;
    newQty: number;
    unit: string;
  }[];
  unmatchedIngredients: string[];
} {
  const today = new Date().toLocaleDateString('es-PE');
  let itemsCopy = [...currentItems];
  const deductions: {
    ingredientName: string;
    warehouseItemId: string;
    warehouseItemName: string;
    previousQty: number;
    deductedQty: number;
    newQty: number;
    unit: string;
  }[] = [];
  const unmatchedIngredients: string[] = [];

  for (const recipeIng of ingredients) {
    const totalRequired = recipeIng.amountForOne * portions;
    const match = findMatchingWarehouseItem(recipeIng.ingredientName, itemsCopy);

    if (match) {
      // Intentar convertir la unidad de la receta a la unidad del almacén
      // Ej: receta pide 600g de pollo, en almacén está en kg -> convertir a 0.6 kg
      const convertedRequired = convertQuantityBetweenUnits(totalRequired, recipeIng.unit, match.unit);
      const amountToDeduct = convertedRequired !== null ? convertedRequired : totalRequired;

      const previousQty = match.quantity;
      const newQty = Math.max(0, Math.round((previousQty - amountToDeduct) * 1000) / 1000);

      itemsCopy = itemsCopy.map((item) =>
        item.id === match.id
          ? {
              ...item,
              quantity: newQty,
              lastUpdated: today,
            }
          : item
      );

      deductions.push({
        ingredientName: recipeIng.ingredientName,
        warehouseItemId: match.id,
        warehouseItemName: match.name,
        previousQty,
        deductedQty: Math.round(amountToDeduct * 1000) / 1000,
        newQty,
        unit: match.unit,
      });
    } else {
      unmatchedIngredients.push(recipeIng.ingredientName);
    }
  }

  return {
    updatedItems: itemsCopy,
    deductions,
    unmatchedIngredients,
  };
}
