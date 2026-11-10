import { Dish, MealMoment } from './dish';

export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface PlannedMeal {
  id: string;
  day: DayOfWeek;
  moment: MealMoment;
  dishId: string;
  dish: Dish;
  plateCount: number; // Cantidad de platos/porciones asignadas
  status: 'planificado' | 'preparado' | 'cancelado';
  preparedAt?: string;
}

export interface WeeklyPlan {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  meals: PlannedMeal[];
}
