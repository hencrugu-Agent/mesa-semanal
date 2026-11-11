export type IngredientCategory =
  | 'Víveres'
  | 'Verduras'
  | 'Frutas'
  | 'Carnes y Aves'
  | 'Pescados y Mariscos'
  | 'Lácteos y Huevos'
  | 'Especias y Condimentos'
  | 'Otros';

export type UnitType = 'g' | 'kg' | 'ml' | 'L' | 'und' | 'dientes' | 'atado' | 'lata' | 'taza' | 'cda';

export interface Ingredient {
  id: string;
  name: string;
  normalizedName: string;
  category: IngredientCategory;
  baseUnit: UnitType;
  commercialPackage?: {
    name: string; // ej. "Bolsa 500g", "Atado", "Lata 410g", "Kilo"
    unit: UnitType;
    quantityInBaseUnit: number; // ej. 500 para 500g
  };
  priceRefPerBaseUnit: number; // precio en Soles por unidad base (ej. S/ 0.006 por gramo = S/ 6 por kg)
  notes?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  category: IngredientCategory;
  amountForOne: number; // Cantidad exacta requerida para 1 plato/porción
  unit: UnitType;
  wastePercentage?: number; // % de merma estimada (ej. 15% para pelado de papa)
}
