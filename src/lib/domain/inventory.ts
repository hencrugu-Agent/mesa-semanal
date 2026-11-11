import { PlannedItem, ExecutedPurchase, StockItem, InventoryMovement } from '@/types/purchase';
import { PlannedMeal } from '@/types/menu';
import { normalizeString } from './normalizer';
import { convertToBaseUnit } from './unit-conversion';

export interface ShortageAlert {
  ingredientName: string;
  plannedAmount: number;
  purchasedAmount: number;
  missingAmount: number;
  unit: string;
}

/**
 * Calcula el saldo actual de cada ingrediente:
 * Saldo = Stock_Anterior + Total_Comprado - Total_Consumido
 */
export function calculateStockBalance(
  initialStock: StockItem[],
  purchases: ExecutedPurchase[],
  consumptions: InventoryMovement[]
): StockItem[] {
  const stockMap = new Map<
    string,
    {
      originalId: string;
      name: string;
      category: StockItem['category'];
      currentAmount: number;
      unit: StockItem['unit'];
      minThreshold?: number;
    }
  >();

  // 1. Cargar stock inicial
  for (const s of initialStock) {
    const key = normalizeString(s.ingredientName);
    const converted = convertToBaseUnit(s.currentAmount, s.unit);
    stockMap.set(key, {
      originalId: s.ingredientId,
      name: s.ingredientName,
      category: s.category,
      currentAmount: converted.amount,
      unit: converted.baseUnit,
      minThreshold: s.minAlertThreshold,
    });
  }

  // 2. Sumar compras ejecutadas
  for (const p of purchases) {
    const key = normalizeString(p.ingredientName);
    const converted = convertToBaseUnit(p.purchasedAmount, p.unit);

    if (stockMap.has(key)) {
      const item = stockMap.get(key)!;
      item.currentAmount += converted.amount;
    } else {
      stockMap.set(key, {
        originalId: p.ingredientId,
        name: p.ingredientName,
        category: p.category,
        currentAmount: converted.amount,
        unit: converted.baseUnit,
      });
    }
  }

  // 3. Restar consumos y mermas
  for (const c of consumptions) {
    if (c.type === 'consumo_receta' || c.type === 'merma') {
      // Buscar por ID o clave
      for (const [, item] of stockMap.entries()) {
        if (item.originalId === c.ingredientId) {
          const converted = convertToBaseUnit(c.amount, c.unit);
          item.currentAmount = Math.max(0, item.currentAmount - converted.amount);
          break;
        }
      }
    }
  }

  const now = new Date().toISOString();
  return Array.from(stockMap.values()).map((v) => ({
    ingredientId: v.originalId,
    ingredientName: v.name,
    category: v.category,
    currentAmount: Math.round(v.currentAmount * 100) / 100,
    unit: v.unit,
    minAlertThreshold: v.minThreshold,
    lastUpdated: now,
  }));
}

/**
 * Detecta faltantes comparando lo planificado contra lo comprado efectivamente.
 */
export function detectPurchaseShortages(
  planned: PlannedItem[],
  executed: ExecutedPurchase[]
): ShortageAlert[] {
  const executedMap = new Map<string, number>();

  for (const ep of executed) {
    const key = normalizeString(ep.ingredientName);
    const converted = convertToBaseUnit(ep.purchasedAmount, ep.unit);
    executedMap.set(key, (executedMap.get(key) || 0) + converted.amount);
  }

  const alerts: ShortageAlert[] = [];

  for (const p of planned) {
    if (p.netToBuyAmount <= 0) continue; // Ya cubierto por stock
    const key = normalizeString(p.name);
    const purchased = executedMap.get(key) || 0;

    if (purchased < p.netToBuyAmount) {
      alerts.push({
        ingredientName: p.name,
        plannedAmount: p.netToBuyAmount,
        purchasedAmount: purchased,
        missingAmount: Math.round((p.netToBuyAmount - purchased) * 100) / 100,
        unit: p.unit,
      });
    }
  }

  return alerts;
}

/**
 * Genera los movimientos de consumo al marcar un plato como "preparado".
 */
export function consumeMealIngredients(
  meal: PlannedMeal,
  now: string = new Date().toISOString()
): InventoryMovement[] {
  const movements: InventoryMovement[] = [];
  const plateCount = Math.max(1, meal.plateCount || 1);

  for (const ing of meal.dish.ingredients) {
    const rawAmount = ing.amountForOne * plateCount;
    const wastePct = (ing.wastePercentage || 0) / 100;
    const wasteAmount = rawAmount * wastePct;
    const totalConsumed = rawAmount + wasteAmount;

    movements.push({
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ingredientId: ing.ingredientId,
      amount: totalConsumed,
      unit: ing.unit,
      type: 'consumo_receta',
      date: now,
      relatedMealId: meal.id,
      notes: wastePct > 0 ? `Incluye ${ing.wastePercentage}% de merma` : undefined,
    });
  }

  return movements;
}
