import { describe, it, expect } from 'vitest';
import {
  calculateStockBalance,
  detectPurchaseShortages,
  consumeMealIngredients,
} from '@/lib/domain/inventory';
import { StockItem, ExecutedPurchase, PlannedItem } from '@/types/purchase';
import { PlannedMeal } from '@/types/menu';
import { Dish } from '@/types/dish';

describe('inventory', () => {
  const platoLentejas: Dish = {
    id: 'p-1',
    name: 'Lentejas con arroz',
    category: 'Criollo',
    moments: ['almuerzo'],
    prepTimeMinutes: 40,
    basePortions: 1,
    priceRefPerPlate: 5.5,
    imageSvgKey: 'lentejas',
    description: '',
    ingredients: [
      { ingredientId: 'ing-lenteja', ingredientName: 'Lentejas', category: 'Víveres', amountForOne: 100, unit: 'g' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 75, unit: 'g' },
      { ingredientId: 'ing-papa', ingredientName: 'Papa blanca', category: 'Verduras', amountForOne: 100, unit: 'g', wastePercentage: 10 }, // 10% merma
    ],
  };

  it('detecta faltantes cuando se compra menos de lo planificado', () => {
    const planned: PlannedItem[] = [
      {
        ingredientId: 'ing-lenteja',
        name: 'Lentejas',
        category: 'Víveres',
        neededAmount: 500,
        unit: 'g',
        coveredByStock: 0,
        netToBuyAmount: 500,
        displayNeeded: '500 g',
        displayNetToBuy: '500 g',
        estimatedCost: 3.5,
      },
    ];

    // Solo se compraron 300g
    const executed: ExecutedPurchase[] = [
      {
        id: 'ep-1',
        ingredientId: 'ing-lenteja',
        ingredientName: 'Lentejas',
        category: 'Víveres',
        purchasedAmount: 300,
        unit: 'g',
        realPriceTotal: 2.5,
        storeLocation: 'Mercado Surquillo',
        purchaseDate: '2026-10-21',
      },
    ];

    const shortages = detectPurchaseShortages(planned, executed);
    expect(shortages.length).toBe(1);
    expect(shortages[0].ingredientName).toBe('Lentejas');
    expect(shortages[0].missingAmount).toBe(200);
  });

  it('reduce el saldo en la cantidad exacta al marcar un plato como preparado (incluyendo mermas)', () => {
    const meal: PlannedMeal = {
      id: 'm-101',
      day: 'lunes',
      moment: 'almuerzo',
      dishId: platoLentejas.id,
      dish: platoLentejas,
      plateCount: 4, // 4 platos
      status: 'planificado',
    };

    // Al preparar 4 platos:
    // Lentejas: 4 * 100 = 400g
    // Arroz: 4 * 75 = 300g
    // Papa: 4 * 100 = 400g + 10% merma (40g) = 440g
    const movements = consumeMealIngredients(meal, '2026-10-21T12:00:00Z');
    expect(movements.length).toBe(3);

    const papaMov = movements.find((m) => m.ingredientId === 'ing-papa')!;
    expect(papaMov.amount).toBe(440);

    // Verificamos que se descuente del stock
    const initialStock: StockItem[] = [
      { ingredientId: 'ing-lenteja', ingredientName: 'Lentejas', category: 'Víveres', currentAmount: 1000, unit: 'g', lastUpdated: '' },
      { ingredientId: 'ing-papa', ingredientName: 'Papa blanca', category: 'Verduras', currentAmount: 1000, unit: 'g', lastUpdated: '' },
    ];

    const finalStock = calculateStockBalance(initialStock, [], movements);

    const lentejasStock = finalStock.find((s) => s.ingredientId === 'ing-lenteja')!;
    expect(lentejasStock.currentAmount).toBe(600); // 1000 - 400 = 600g

    const papaStock = finalStock.find((s) => s.ingredientId === 'ing-papa')!;
    expect(papaStock.currentAmount).toBe(560); // 1000 - 440 = 560g
  });

  it('calcula la fórmula exacta: Saldo = Stock anterior + Comprado - Consumido', () => {
    const initialStock: StockItem[] = [
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', currentAmount: 200, unit: 'g', lastUpdated: '' },
    ];

    const purchases: ExecutedPurchase[] = [
      {
        id: 'ep-arroz',
        ingredientId: 'ing-arroz',
        ingredientName: 'Arroz extra',
        category: 'Víveres',
        purchasedAmount: 1000, // 1 kg
        unit: 'g',
        realPriceTotal: 4.8,
        storeLocation: 'Bodega Don Pepe',
        purchaseDate: '2026-10-21',
      },
    ];

    const consumptions = [
      {
        id: 'c-1',
        ingredientId: 'ing-arroz',
        amount: 300,
        unit: 'g' as const,
        type: 'consumo_receta' as const,
        date: '2026-10-21',
      },
    ];

    // Saldo = 200 (inicial) + 1000 (comprado) - 300 (consumido) = 900g
    const updated = calculateStockBalance(initialStock, purchases, consumptions);
    const arroz = updated.find((s) => s.ingredientId === 'ing-arroz')!;
    expect(arroz.currentAmount).toBe(900);
  });
});
