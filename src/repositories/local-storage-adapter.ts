import { IMealRepository, AppConfig, AppUser } from './types';
import { Dish } from '@/types/dish';
import { Ingredient } from '@/types/ingredient';
import { PlannedMeal } from '@/types/menu';
import { ExecutedPurchase, StockItem, InventoryMovement } from '@/types/purchase';
import { SEED_DISHES } from '@/data/seed/dishes';
import { SEED_INGREDIENTS } from '@/data/seed/ingredients';

const STORAGE_KEYS = {
  DISHES: 'mesa_semanal_dishes_v1',
  INGREDIENTS: 'mesa_semanal_ingredients_v1',
  MENU: 'mesa_semanal_menu_v1',
  PURCHASES: 'mesa_semanal_purchases_v1',
  STOCK: 'mesa_semanal_stock_v1',
  MOVEMENTS: 'mesa_semanal_movements_v1',
  CONFIG: 'mesa_semanal_config_v1',
  USERS: 'mesa_semanal_users_v1',
};

const DEFAULT_CONFIG: AppConfig = {
  householdName: 'Mi Hogar Criollo',
  defaultDiners: 4,
  currencySymbol: 'S/',
  daysMode: 7,
  storageMode: 'local',
};

const DEFAULT_USERS: AppUser[] = [
  { id: 'usr-1', email: 'admin@mesasemanal.pe', name: 'Administrador del Hogar', role: 'administrador' },
];

export class LocalStorageAdapter implements IMealRepository {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Error reading from localStorage key ${key}`, e);
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing to localStorage key ${key}`, e);
    }
  }

  constructor() {
    this.initSeeds();
  }

  private initSeeds(): void {
    if (!this.isBrowser()) return;

    // Sembrar platos si no existen
    if (!localStorage.getItem(STORAGE_KEYS.DISHES)) {
      this.setItem(STORAGE_KEYS.DISHES, SEED_DISHES);
    }

    // Sembrar ingredientes si no existen
    if (!localStorage.getItem(STORAGE_KEYS.INGREDIENTS)) {
      this.setItem(STORAGE_KEYS.INGREDIENTS, SEED_INGREDIENTS);
    }

    // Sembrar configuración
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      this.setItem(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    }

    // Sembrar usuarios
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
    }

    // Sembrar menú inicial de ejemplo (3 platos peruanos variados para arrancar con datos vivos)
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      const dishes = SEED_DISHES;
      const initialMenu: PlannedMeal[] = [
        {
          id: 'meal-seed-1',
          day: 'lunes',
          moment: 'almuerzo',
          dishId: dishes[0].id, // Lentejas
          dish: dishes[0],
          plateCount: 4,
          status: 'planificado',
        },
        {
          id: 'meal-seed-2',
          day: 'martes',
          moment: 'almuerzo',
          dishId: dishes[1].id, // Ají de gallina
          dish: dishes[1],
          plateCount: 4,
          status: 'planificado',
        },
        {
          id: 'meal-seed-3',
          day: 'miercoles',
          moment: 'almuerzo',
          dishId: dishes[2].id, // Lomo saltado
          dish: dishes[2],
          plateCount: 4,
          status: 'planificado',
        },
      ];
      this.setItem(STORAGE_KEYS.MENU, initialMenu);
    }

    // Sembrar stock inicial realista de despensa
    if (!localStorage.getItem(STORAGE_KEYS.STOCK)) {
      const initialStock: StockItem[] = [
        {
          ingredientId: 'ing-arroz',
          ingredientName: 'Arroz extra',
          category: 'Víveres',
          currentAmount: 500, // 500g ya en casa
          unit: 'g',
          lastUpdated: new Date().toISOString(),
        },
        {
          ingredientId: 'ing-aceite',
          ingredientName: 'Aceite vegetal',
          category: 'Víveres',
          currentAmount: 800,
          unit: 'ml',
          lastUpdated: new Date().toISOString(),
        },
        {
          ingredientId: 'ing-ajo',
          ingredientName: 'Ajo fresco morado',
          category: 'Especias y Condimentos',
          currentAmount: 8,
          unit: 'dientes',
          lastUpdated: new Date().toISOString(),
        },
      ];
      this.setItem(STORAGE_KEYS.STOCK, initialStock);
    }
  }

  // Platos
  async getDishes(): Promise<Dish[]> {
    return this.getItem<Dish[]>(STORAGE_KEYS.DISHES, SEED_DISHES);
  }

  async saveDish(dish: Dish): Promise<void> {
    const list = await this.getDishes();
    const index = list.findIndex((d) => d.id === dish.id);
    if (index >= 0) {
      list[index] = dish;
    } else {
      list.unshift(dish);
    }
    this.setItem(STORAGE_KEYS.DISHES, list);
  }

  async deleteDish(dishId: string): Promise<void> {
    const list = await this.getDishes();
    this.setItem(
      STORAGE_KEYS.DISHES,
      list.filter((d) => d.id !== dishId)
    );
  }

  // Ingredientes
  async getIngredients(): Promise<Ingredient[]> {
    return this.getItem<Ingredient[]>(STORAGE_KEYS.INGREDIENTS, SEED_INGREDIENTS);
  }

  async saveIngredient(ingredient: Ingredient): Promise<void> {
    const list = await this.getIngredients();
    const index = list.findIndex((i) => i.id === ingredient.id);
    if (index >= 0) {
      list[index] = ingredient;
    } else {
      list.push(ingredient);
    }
    this.setItem(STORAGE_KEYS.INGREDIENTS, list);
  }

  // Menú Semanal
  async getPlannedMeals(): Promise<PlannedMeal[]> {
    return this.getItem<PlannedMeal[]>(STORAGE_KEYS.MENU, []);
  }

  async savePlannedMeal(meal: PlannedMeal): Promise<void> {
    const list = await this.getPlannedMeals();
    const index = list.findIndex((m) => m.id === meal.id);
    if (index >= 0) {
      list[index] = meal;
    } else {
      list.push(meal);
    }
    this.setItem(STORAGE_KEYS.MENU, list);
  }

  async deletePlannedMeal(mealId: string): Promise<void> {
    const list = await this.getPlannedMeals();
    this.setItem(
      STORAGE_KEYS.MENU,
      list.filter((m) => m.id !== mealId)
    );
  }

  async clearPlannedMeals(): Promise<void> {
    this.setItem(STORAGE_KEYS.MENU, []);
  }

  // Compras y Stock
  async getExecutedPurchases(): Promise<ExecutedPurchase[]> {
    return this.getItem<ExecutedPurchase[]>(STORAGE_KEYS.PURCHASES, []);
  }

  async saveExecutedPurchase(purchase: ExecutedPurchase): Promise<void> {
    const list = await this.getExecutedPurchases();
    const index = list.findIndex((p) => p.id === purchase.id);
    if (index >= 0) {
      list[index] = purchase;
    } else {
      list.unshift(purchase);
    }
    this.setItem(STORAGE_KEYS.PURCHASES, list);
  }

  async deleteExecutedPurchase(purchaseId: string): Promise<void> {
    const list = await this.getExecutedPurchases();
    this.setItem(
      STORAGE_KEYS.PURCHASES,
      list.filter((p) => p.id !== purchaseId)
    );
  }

  async getStock(): Promise<StockItem[]> {
    return this.getItem<StockItem[]>(STORAGE_KEYS.STOCK, []);
  }

  async saveStockItem(item: StockItem): Promise<void> {
    const list = await this.getStock();
    const index = list.findIndex((s) => s.ingredientId === item.ingredientId);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
    this.setItem(STORAGE_KEYS.STOCK, list);
  }

  async getMovements(): Promise<InventoryMovement[]> {
    return this.getItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
  }

  async saveMovement(movement: InventoryMovement): Promise<void> {
    const list = await this.getMovements();
    list.unshift(movement);
    this.setItem(STORAGE_KEYS.MOVEMENTS, list);
  }

  // Configuración
  async getConfig(): Promise<AppConfig> {
    return this.getItem<AppConfig>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  }

  async saveConfig(config: Partial<AppConfig>): Promise<void> {
    const current = await this.getConfig();
    this.setItem(STORAGE_KEYS.CONFIG, { ...current, ...config });
  }

  async getUsers(): Promise<AppUser[]> {
    return this.getItem<AppUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }
}
