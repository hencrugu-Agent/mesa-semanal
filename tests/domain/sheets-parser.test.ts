import { describe, it, expect } from 'vitest';
import { parseIngredientsString, parseGoogleSheetsCSV } from '@/lib/sheets/google-sheets-fetcher';

describe('Free-text ingredients parser', () => {
  it('parsea formato "Cantidad Unidad Nombre" (ej. 150g pechuga de pollo)', () => {
    const raw = '150g pechuga de pollo, 75g arroz extra, 1 huevo, 1/2 cebolla roja';
    const parsed = parseIngredientsString(raw);

    expect(parsed.length).toBe(4);
    expect(parsed[0].ingredientName.toLowerCase()).toContain('pechuga de pollo');
    expect(parsed[0].amountForOne).toBe(150);
    expect(parsed[0].unit).toBe('g');

    expect(parsed[1].ingredientName.toLowerCase()).toContain('arroz extra');
    expect(parsed[1].amountForOne).toBe(75);
    expect(parsed[1].unit).toBe('g');

    expect(parsed[2].ingredientName.toLowerCase()).toContain('huevo');
    expect(parsed[2].amountForOne).toBe(1);
    expect(parsed[2].unit).toBe('und');

    expect(parsed[3].ingredientName.toLowerCase()).toContain('cebolla roja');
    expect(parsed[3].amountForOne).toBe(0.5);
    expect(parsed[3].unit).toBe('und');
  });

  it('parsea formato "Nombre Cantidad Unidad" (ej. Pechuga de pollo 150g)', () => {
    const raw = 'Pechuga de pollo 150g, Arroz extra: 75g, Papa amarilla (150 g)';
    const parsed = parseIngredientsString(raw);

    expect(parsed.length).toBe(3);
    expect(parsed[0].ingredientName.toLowerCase()).toContain('pechuga de pollo');
    expect(parsed[0].amountForOne).toBe(150);
    expect(parsed[0].unit).toBe('g');

    expect(parsed[1].ingredientName.toLowerCase()).toContain('arroz extra');
    expect(parsed[1].amountForOne).toBe(75);
    expect(parsed[1].unit).toBe('g');

    expect(parsed[2].ingredientName.toLowerCase()).toContain('papa amarilla');
    expect(parsed[2].amountForOne).toBe(150);
    expect(parsed[2].unit).toBe('g');
  });

  it('parsea ingredientes separados por saltos de línea y viñetas', () => {
    const raw = `- 200g carne de res\n* 1 taza arroz\n• 2 dientes de ajo\n1/4 kg papa canchan`;
    const parsed = parseIngredientsString(raw);

    expect(parsed.length).toBe(4);
    expect(parsed[0].ingredientName.toLowerCase()).toContain('carne de res');
    expect(parsed[0].amountForOne).toBe(200);

    expect(parsed[1].ingredientName.toLowerCase()).toContain('arroz');
    expect(parsed[1].amountForOne).toBe(1);
    expect(parsed[1].unit).toBe('taza');

    expect(parsed[2].ingredientName.toLowerCase()).toContain('ajo');
    expect(parsed[2].amountForOne).toBe(2);
    expect(parsed[2].unit).toBe('dientes');

    expect(parsed[3].ingredientName.toLowerCase()).toContain('papa canchan');
    expect(parsed[3].amountForOne).toBe(0.25);
    expect(parsed[3].unit).toBe('kg');
  });

  it('parsea CSV con celdas multilínea con comillas', () => {
    const csv = `Plato,Categoria,Tiempo,Precio,Imagen,Descripcion,Ingredientes
"Lentejas Criollas","Criollo",35,6.5,"lentejas","Deliciosas lentejas caseras","100g lentejas
75g arroz
1 huevo"
"Ají de Gallina","Criollo",40,8.5,"aji-gallina","Clásico criollo","150g pechuga de pollo, 50ml leche evaporada"`;

    const dishes = parseGoogleSheetsCSV(csv);
    expect(dishes.length).toBe(2);

    expect(dishes[0].name).toBe('Lentejas Criollas');
    expect(dishes[0].ingredients.length).toBe(3);
    expect(dishes[0].ingredients[0].amountForOne).toBe(100);
    expect(dishes[0].ingredients[0].unit).toBe('g');

    expect(dishes[1].name).toBe('Ají de Gallina');
    expect(dishes[1].ingredients.length).toBe(2);
  });
});
