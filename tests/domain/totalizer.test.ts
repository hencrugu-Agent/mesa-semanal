import { describe, it, expect } from 'vitest';
import { totalizePlannedIngredients } from '@/lib/domain/totalizer';
import { PlannedMeal } from '@/types/menu';
import { Dish } from '@/types/dish';
import { StockItem } from '@/types/purchase';

describe('totalizer', () => {
  const platoLentejas: Dish = {
    id: 'p-1',
    name: 'Lentejas con arroz y huevo',
    category: 'Criollo',
    moments: ['almuerzo'],
    prepTimeMinutes: 40,
    basePortions: 1,
    priceRefPerPlate: 5.5,
    imageSvgKey: 'lentejas',
    description: 'Lentejas caseras con arroz blanco',
    ingredients: [
      { ingredientId: 'ing-lenteja', ingredientName: 'Lentejas', category: 'Víveres', amountForOne: 100, unit: 'g' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 75, unit: 'g' },
      { ingredientId: 'ing-huevo', ingredientName: 'Huevos frescos', category: 'Lácteos y Huevos', amountForOne: 1, unit: 'und' },
    ],
  };

  const platoAjiGallina: Dish = {
    id: 'p-2',
    name: 'Ají de gallina',
    category: 'Criollo',
    moments: ['almuerzo', 'cena'],
    prepTimeMinutes: 45,
    basePortions: 1,
    priceRefPerPlate: 7.5,
    imageSvgKey: 'aji-gallina',
    description: 'Ají de gallina con arroz y papa',
    ingredients: [
      { ingredientId: 'ing-pollo', ingredientName: 'Pechuga de pollo', category: 'Carnes y Aves', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz Extra', category: 'Víveres', amountForOne: 75, unit: 'g' }, // Arroz repetido con mayúscula
      { ingredientId: 'ing-huevo', ingredientName: 'Huevos Frescos', category: 'Lácteos y Huevos', amountForOne: 0.5, unit: 'und' }, // Huevo repetido
    ],
  };

  const platoLomoSaltado: Dish = {
    id: 'p-3',
    name: 'Lomo saltado',
    category: 'Criollo',
    moments: ['almuerzo'],
    prepTimeMinutes: 25,
    basePortions: 1,
    priceRefPerPlate: 12.0,
    imageSvgKey: 'lomo-saltado',
    description: 'Lomo fino saltado al wok con arroz',
    ingredients: [
      { ingredientId: 'ing-lomo', ingredientName: 'Carne de res', category: 'Carnes y Aves', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-arroz', ingredientName: 'arroz extra', category: 'Víveres', amountForOne: 75, unit: 'g' }, // Arroz repetido en minúsculas
    ],
  };

  it('suma correctamente ingredientes repetidos entre 3 platos con diferentes porciones', () => {
    // Supuesto:
    // Lentejas para 4 platos -> Arroz = 4 * 75 = 300g
    // Ají de Gallina para 4 platos -> Arroz = 4 * 75 = 300g
    // Lomo Saltado para 2 platos -> Arroz = 2 * 75 = 150g
    // Total arroz esperado: 300 + 300 + 150 = 750g
    const meals: PlannedMeal[] = [
      { id: 'm1', day: 'lunes', moment: 'almuerzo', dishId: platoLentejas.id, dish: platoLentejas, plateCount: 4, status: 'planificado' },
      { id: 'm2', day: 'martes', moment: 'almuerzo', dishId: platoAjiGallina.id, dish: platoAjiGallina, plateCount: 4, status: 'planificado' },
      { id: 'm3', day: 'miercoles', moment: 'almuerzo', dishId: platoLomoSaltado.id, dish: platoLomoSaltado, plateCount: 2, status: 'planificado' },
    ];

    const result = totalizePlannedIngredients(meals, []);

    const arrozItem = result.find((item) => item.name.toLowerCase().includes('arroz'));
    expect(arrozItem).toBeDefined();
    expect(arrozItem?.neededAmount).toBe(750);
    expect(arrozItem?.netToBuyAmount).toBe(750);

    const huevosItem = result.find((item) => item.name.toLowerCase().includes('huevo'));
    // Huevos: 4 * 1 (Lentejas) + 4 * 0.5 (Ají) = 4 + 2 = 6 unds
    expect(huevosItem?.neededAmount).toBe(6);

    const lentejasItem = result.find((item) => item.name.toLowerCase().includes('lentejas'));
    // Lentejas: 4 * 100g = 400g
    expect(lentejasItem?.neededAmount).toBe(400);
  });

  it('descuenta el stock existente para nunca pedir comprar lo que ya hay en despensa', () => {
    const meals: PlannedMeal[] = [
      { id: 'm1', day: 'lunes', moment: 'almuerzo', dishId: platoLentejas.id, dish: platoLentejas, plateCount: 4, status: 'planificado' },
    ];

    // Necesitamos 300g de arroz (4 * 75g) y 400g de lentejas (4 * 100g)
    // Supongamos que en despensa ya tenemos 500g de arroz y 100g de lentejas
    const pantryStock: StockItem[] = [
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz Extra', category: 'Víveres', currentAmount: 500, unit: 'g', lastUpdated: '' },
      { ingredientId: 'ing-lenteja', ingredientName: 'Lentejas', category: 'Víveres', currentAmount: 100, unit: 'g', lastUpdated: '' },
    ];

    const result = totalizePlannedIngredients(meals, pantryStock);

    const arrozItem = result.find((item) => item.name.toLowerCase().includes('arroz'))!;
    expect(arrozItem.neededAmount).toBe(300);
    expect(arrozItem.coveredByStock).toBe(300);
    expect(arrozItem.netToBuyAmount).toBe(0); // CERO a comprar porque el stock cubre todo

    const lentejasItem = result.find((item) => item.name.toLowerCase().includes('lentejas'))!;
    expect(lentejasItem.neededAmount).toBe(400);
    expect(lentejasItem.coveredByStock).toBe(100);
    expect(lentejasItem.netToBuyAmount).toBe(300); // Solo pide comprar la diferencia faltante (300g)
  });
});
