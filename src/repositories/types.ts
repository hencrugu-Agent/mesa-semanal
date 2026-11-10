import { Dish } from '@/types/dish';
import { Ingredient } from '@/types/ingredient';
import { PlannedMeal } from '@/types/menu';
import { ExecutedPurchase, StockItem, InventoryMovement } from '@/types/purchase';

export interface AppConfig {
  householdName: string;
  defaultDiners: number;
  currencySymbol: string;
  daysMode: 5 | 7;
  storageMode: 'local' | 'sheets';
  openRouterApiKey?: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'administrador' | 'editor' | 'lector';
}

export interface IMealRepository {
  // Platos
  getDishes(): Promise<Dish[]>;
  saveDish(dish: Dish): Promise<void>;
  deleteDish(dishId: string): Promise<void>;

  // Ingredientes
  getIngredients(): Promise<Ingredient[]>;
  saveIngredient(ingredient: Ingredient): Promise<void>;

  // Menú Semanal
  getPlannedMeals(): Promise<PlannedMeal[]>;
  savePlannedMeal(meal: PlannedMeal): Promise<void>;
  deletePlannedMeal(mealId: string): Promise<void>;
  clearPlannedMeals(): Promise<void>;

  // Compras y Stock
  getExecutedPurchases(): Promise<ExecutedPurchase[]>;
  saveExecutedPurchase(purchase: ExecutedPurchase): Promise<void>;
  deleteExecutedPurchase(purchaseId: string): Promise<void>;

  getStock(): Promise<StockItem[]>;
  saveStockItem(item: StockItem): Promise<void>;

  getMovements(): Promise<InventoryMovement[]>;
  saveMovement(movement: InventoryMovement): Promise<void>;

  // Configuración y Usuarios
  getConfig(): Promise<AppConfig>;
  saveConfig(config: Partial<AppConfig>): Promise<void>;
  getUsers(): Promise<AppUser[]>;
}
