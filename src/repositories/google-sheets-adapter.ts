import { IMealRepository, AppConfig, AppUser } from './types';
import { Dish } from '@/types/dish';
import { Ingredient } from '@/types/ingredient';
import { PlannedMeal } from '@/types/menu';
import { ExecutedPurchase, StockItem, InventoryMovement } from '@/types/purchase';
import { LocalStorageAdapter } from './local-storage-adapter';

/**
 * Adaptador de Google Sheets API v4.
 * En el cliente, delega en la ruta API segura de servidor `/api/sheets`,
 * manteniendo las credenciales estrictamente del lado del servidor.
 * Si la hoja o las credenciales no están configuradas, hace fallback
 * transparente a LocalStorageAdapter.
 */
export class GoogleSheetsAdapter implements IMealRepository {
  private fallback: LocalStorageAdapter;

  constructor() {
    this.fallback = new LocalStorageAdapter();
  }

  private async fetchApi<T>(action: string, payload?: unknown): Promise<T | null> {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) {
        throw new Error(`Sheets API responded with ${response.status}`);
      }

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Sheets API error');
      }

      return json.data as T;
    } catch (error) {
      console.warn(`[GoogleSheetsAdapter] Falling back to local storage due to:`, error);
      return null;
    }
  }

  async getDishes(): Promise<Dish[]> {
    const data = await this.fetchApi<Dish[]>('getDishes');
    return data ?? this.fallback.getDishes();
  }

  async saveDish(dish: Dish): Promise<void> {
    const res = await this.fetchApi<boolean>('saveDish', dish);
    if (!res) await this.fallback.saveDish(dish);
  }

  async deleteDish(dishId: string): Promise<void> {
    const res = await this.fetchApi<boolean>('deleteDish', { dishId });
    if (!res) await this.fallback.deleteDish(dishId);
  }

  async getIngredients(): Promise<Ingredient[]> {
    const data = await this.fetchApi<Ingredient[]>('getIngredients');
    return data ?? this.fallback.getIngredients();
  }

  async saveIngredient(ingredient: Ingredient): Promise<void> {
    const res = await this.fetchApi<boolean>('saveIngredient', ingredient);
    if (!res) await this.fallback.saveIngredient(ingredient);
  }

  async getPlannedMeals(): Promise<PlannedMeal[]> {
    const data = await this.fetchApi<PlannedMeal[]>('getPlannedMeals');
    return data ?? this.fallback.getPlannedMeals();
  }

  async savePlannedMeal(meal: PlannedMeal): Promise<void> {
    const res = await this.fetchApi<boolean>('savePlannedMeal', meal);
    if (!res) await this.fallback.savePlannedMeal(meal);
  }

  async deletePlannedMeal(mealId: string): Promise<void> {
    const res = await this.fetchApi<boolean>('deletePlannedMeal', { mealId });
    if (!res) await this.fallback.deletePlannedMeal(mealId);
  }

  async clearPlannedMeals(): Promise<void> {
    const res = await this.fetchApi<boolean>('clearPlannedMeals');
    if (!res) await this.fallback.clearPlannedMeals();
  }

  async getExecutedPurchases(): Promise<ExecutedPurchase[]> {
    const data = await this.fetchApi<ExecutedPurchase[]>('getExecutedPurchases');
    return data ?? this.fallback.getExecutedPurchases();
  }

  async saveExecutedPurchase(purchase: ExecutedPurchase): Promise<void> {
    const res = await this.fetchApi<boolean>('saveExecutedPurchase', purchase);
    if (!res) await this.fallback.saveExecutedPurchase(purchase);
  }

  async deleteExecutedPurchase(purchaseId: string): Promise<void> {
    const res = await this.fetchApi<boolean>('deleteExecutedPurchase', { purchaseId });
    if (!res) await this.fallback.deleteExecutedPurchase(purchaseId);
  }

  async getStock(): Promise<StockItem[]> {
    const data = await this.fetchApi<StockItem[]>('getStock');
    return data ?? this.fallback.getStock();
  }

  async saveStockItem(item: StockItem): Promise<void> {
    const res = await this.fetchApi<boolean>('saveStockItem', item);
    if (!res) await this.fallback.saveStockItem(item);
  }

  async getMovements(): Promise<InventoryMovement[]> {
    const data = await this.fetchApi<InventoryMovement[]>('getMovements');
    return data ?? this.fallback.getMovements();
  }

  async saveMovement(movement: InventoryMovement): Promise<void> {
    const res = await this.fetchApi<boolean>('saveMovement', movement);
    if (!res) await this.fallback.saveMovement(movement);
  }

  async getConfig(): Promise<AppConfig> {
    const data = await this.fetchApi<AppConfig>('getConfig');
    return data ?? this.fallback.getConfig();
  }

  async saveConfig(config: Partial<AppConfig>): Promise<void> {
    const res = await this.fetchApi<boolean>('saveConfig', config);
    if (!res) await this.fallback.saveConfig(config);
  }

  async getUsers(): Promise<AppUser[]> {
    const data = await this.fetchApi<AppUser[]>('getUsers');
    return data ?? this.fallback.getUsers();
  }
}
