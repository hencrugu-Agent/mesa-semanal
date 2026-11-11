import { RecipeIngredient } from './ingredient';

export type MealMoment = 'desayuno' | 'media_manana' | 'almuerzo' | 'media_tarde' | 'cena';
export type DishCategory = 'Criollo' | 'Sopas' | 'Entradas' | 'Desayunos' | 'Snacks y Postres' | 'Cenas Ligeras' | 'Marino';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  moments: MealMoment[];
  prepTimeMinutes: number;
  basePortions: number; // por defecto 1 para cálculo base
  priceRefPerPlate: number; // en Soles (S/)
  imageSvgKey: string; // clave del SVG local
  description: string;
  ingredients: RecipeIngredient[]; // ingredientes calculados para 1 plato
  isCustom?: boolean;
}
