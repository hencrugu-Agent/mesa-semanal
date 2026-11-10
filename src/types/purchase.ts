import { IngredientCategory, UnitType } from './ingredient';

export interface PlannedItem {
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  neededAmount: number;
  unit: UnitType;
  commercialRecommendation?: {
    packageName: string;
    packageCount: number;
    totalAmount: number;
    surplus: number;
  };
  estimatedCost: number;
  coveredByStock: number;
  netToBuyAmount: number; // neededAmount - coveredByStock
  displayNeeded: string;
  displayNetToBuy: string;
  isChecked?: boolean;
}

export interface ExecutedPurchase {
  id: string;
  ingredientId: string;
  ingredientName: string;
  category: IngredientCategory;
  purchasedAmount: number;
  unit: UnitType;
  realPriceTotal: number; // en Soles (S/)
  storeLocation: string; // ej. Mercado Central, Parada, Supermercado
  purchaseDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface StockItem {
  ingredientId: string;
  ingredientName: string;
  category: IngredientCategory;
  currentAmount: number;
  unit: UnitType;
  minAlertThreshold?: number;
  lastUpdated: string;
}

export interface InventoryMovement {
  id: string;
  ingredientId: string;
  amount: number;
  unit: UnitType;
  type: 'compra' | 'consumo_receta' | 'merma' | 'ajuste_manual';
  date: string;
  relatedMealId?: string;
  notes?: string;
}

export interface ExtraPurchasedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedCost?: number;
  isPurchased?: boolean;
}

export type WarehouseItemOrigin = 'comprado' | 'donado';

export interface WarehouseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // "kg", "und", "cabezas", "paquete", "tronco", etc.
  origin: WarehouseItemOrigin;
  category?: string;
  notes?: string;
  dateAdded: string;
  lastUpdated?: string;
}

export interface PurchaseHistoryEntry {
  id: string;
  itemId?: string;
  name: string;
  quantity: number;
  unit: string;
  origin: WarehouseItemOrigin;
  category: string;
  notes?: string;
  timestamp: number;
  dateStr: string;
  action:
    | 'registro_almacen'
    | 'edicion_cantidad'
    | 'edicion_unidad'
    | 'cambio_origen'
    | 'cambio_categoria'
    | 'eliminacion'
    | 'compra_acumulados'
    | 'consumo_plato_preparado'
    | 'reversion_plato_preparado';
}


