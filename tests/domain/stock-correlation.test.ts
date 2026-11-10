import { describe, it, expect } from 'vitest';
import {
  addOrMergeWarehouseStock,
  deductIngredientsFromWarehouse,
  convertQuantityBetweenUnits,
} from '@/lib/domain/stock-correlation';
import { WarehouseItem } from '@/types/purchase';
import { RecipeIngredient } from '@/types/ingredient';

describe('stock-correlation', () => {
  it('convierte correctamente entre g y kg o ml y l', () => {
    expect(convertQuantityBetweenUnits(1500, 'g', 'kg')).toBe(1.5);
    expect(convertQuantityBetweenUnits(2, 'kg', 'g')).toBe(2000);
    expect(convertQuantityBetweenUnits(500, 'ml', 'L')).toBe(0.5);
    expect(convertQuantityBetweenUnits(3, 'und', 'und')).toBe(3);
  });

  it('suma cantidad en almacén si el ingrediente ya existe', () => {
    const initialItems: WarehouseItem[] = [
      {
        id: 'wh-1',
        name: 'Papa blanca',
        quantity: 10,
        unit: 'kg',
        origin: 'comprado',
        category: 'Verduras',
        dateAdded: '01/01/2026',
      },
    ];

    const { updatedItems, affectedItem, isNew } = addOrMergeWarehouseStock(initialItems, {
      name: 'Papa blanca',
      quantity: 5,
      unit: 'kg',
      origin: 'comprado',
    });

    expect(isNew).toBe(false);
    expect(affectedItem.quantity).toBe(15);
    expect(updatedItems[0].quantity).toBe(15);
  });

  it('agrega nuevo ítem al almacén si no existía previamente', () => {
    const initialItems: WarehouseItem[] = [];
    const { updatedItems, affectedItem, isNew } = addOrMergeWarehouseStock(initialItems, {
      name: 'Cebolla roja',
      quantity: 3,
      unit: 'kg',
      origin: 'comprado',
      category: 'Verduras',
    });

    expect(isNew).toBe(true);
    expect(affectedItem.name).toBe('Cebolla roja');
    expect(affectedItem.quantity).toBe(3);
    expect(updatedItems.length).toBe(1);
  });

  it('resta del almacén los ingredientes cuando un plato es marcado como HECHO', () => {
    const initialItems: WarehouseItem[] = [
      {
        id: 'wh-papa',
        name: 'Papa blanca',
        quantity: 5,
        unit: 'kg',
        origin: 'comprado',
        category: 'Verduras',
        dateAdded: '01/01/2026',
      },
      {
        id: 'wh-pollo',
        name: 'Pechuga de pollo',
        quantity: 2,
        unit: 'kg',
        origin: 'comprado',
        category: 'Carnes y Aves',
        dateAdded: '01/01/2026',
      },
    ];

    const ingredients: RecipeIngredient[] = [
      // Para 1 porción: 250g papa blanca, 150g pechuga
      {
        ingredientId: 'ing-papa',
        ingredientName: 'Papa blanca',
        category: 'Verduras',
        amountForOne: 250,
        unit: 'g',
      },
      {
        ingredientId: 'ing-pollo',
        ingredientName: 'Pechuga de pollo',
        category: 'Carnes y Aves',
        amountForOne: 150,
        unit: 'g',
      },
    ];

    // Preparar 4 porciones: 4 * 250g = 1000g = 1 kg de papa; 4 * 150g = 600g = 0.6 kg de pollo
    const result = deductIngredientsFromWarehouse(initialItems, 'Ají de Gallina', ingredients, 4);

    expect(result.deductions.length).toBe(2);

    const papaItem = result.updatedItems.find((i) => i.id === 'wh-papa')!;
    expect(papaItem.quantity).toBe(4); // 5 - 1 = 4 kg

    const polloItem = result.updatedItems.find((i) => i.id === 'wh-pollo')!;
    expect(polloItem.quantity).toBe(1.4); // 2 - 0.6 = 1.4 kg
  });
});
