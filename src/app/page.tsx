'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dish, MealMoment } from '@/types/dish';
import { DayOfWeek, PlannedMeal } from '@/types/menu';
import { ExtraPurchasedItem, WarehouseItem, WarehouseItemOrigin, PurchaseHistoryEntry } from '@/types/purchase';
import { fetchDishesFromGoogleSheets } from '@/lib/sheets/google-sheets-fetcher';
import { normalizeString } from '@/lib/domain/normalizer';
import { totalizePlannedIngredients } from '@/lib/domain/totalizer';
import {
  initWarehouseDB,
  saveItemToDB,
  deleteItemFromDB,
  getFullHistory,
  exportWarehouseToExcel,
} from '@/lib/db/warehouse-db';
import {
  addOrMergeWarehouseStock,
  deductIngredientsFromWarehouse,
} from '@/lib/domain/stock-correlation';

import { ToastProvider, useToast } from '@/components/ui/Toast';
import { SimplifiedNavbar, SimplifiedActiveView } from '@/components/navigation/SimplifiedNavbar';
import { FoodDeliveryDishCard } from '@/components/delivery/FoodDeliveryDishCard';
import { WeeklyDiagramView } from '@/components/diagram/WeeklyDiagramView';
import { AccumulatedShoppingView } from '@/components/shopping/AccumulatedShoppingView';
import { WarehouseView } from '@/components/warehouse/WarehouseView';
import { GoogleSheetSyncModal } from '@/components/sheets/GoogleSheetSyncModal';
import { Search, X, Calendar, ShoppingCart, Warehouse } from 'lucide-react';

const STORAGE_KEYS = {
  MEALS: 'mesa_semanal_selected_meals_v2',
  PURCHASED: 'mesa_semanal_purchased_amounts_v2',
  EXTRAS: 'mesa_semanal_extra_purchases_v2',
  WAREHOUSE: 'mesa_semanal_warehouse_items_v2',
  SHEET_URL: 'mesa_semanal_custom_sheet_url_v2',
  LAST_SYNC: 'mesa_semanal_last_sync_v2',
  CACHED_DISHES: 'mesa_semanal_cached_dishes_v2',
};

const CATEGORIES = ['Todos', 'Criollo', 'Sopas', 'Entradas', 'Desayunos', 'Snacks y Postres', 'Cenas Ligeras', 'Marino'];

function SimplifiedAppContent() {
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState<SimplifiedActiveView>('platos');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [purchasedAmounts, setPurchasedAmounts] = useState<Record<string, number>>({});
  const [extraPurchases, setExtraPurchases] = useState<ExtraPurchasedItem[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [warehouseHistory, setWarehouseHistory] = useState<PurchaseHistoryEntry[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Google Sheets
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Carga inicial
  useEffect(() => {
    async function init() {
      try {
        const savedUrl = localStorage.getItem(STORAGE_KEYS.SHEET_URL) || '';
        const savedSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '';
        const cached = localStorage.getItem(STORAGE_KEYS.CACHED_DISHES);

        setSheetUrl(savedUrl);
        setLastSyncTime(savedSync);

        let activeDishes: Dish[] = [];

        if (cached) {
          try {
            activeDishes = JSON.parse(cached);
            setDishes(activeDishes);
          } catch {
            // ignore
          }
        }

        // Cargar platos desde Google Sheets si hay URL guardada, o catálogo semilla
        const res = await fetchDishesFromGoogleSheets(savedUrl);
        if (res.dishes && res.dishes.length > 0) {
          activeDishes = res.dishes;
          setDishes(res.dishes);
          try {
            localStorage.setItem(STORAGE_KEYS.CACHED_DISHES, JSON.stringify(res.dishes));
          } catch {
            // ignore
          }
        }

        // Cargar comidas seleccionadas o preseleccionar 1 plato por defecto
        const savedMeals = localStorage.getItem(STORAGE_KEYS.MEALS);
        let loadedMeals: PlannedMeal[] = [];
        if (savedMeals) {
          try {
            loadedMeals = JSON.parse(savedMeals);
          } catch {
            loadedMeals = [];
          }
        }

        // REQUISITO: Que por defecto quede seleccionado 1 plato
        if (loadedMeals.length === 0 && activeDishes.length > 0) {
          const defaultDish = activeDishes[0];
          const defaultMeal: PlannedMeal = {
            id: `meal-default-${defaultDish.id}`,
            day: 'lunes',
            moment: 'almuerzo',
            dishId: defaultDish.id,
            dish: defaultDish,
            plateCount: 4,
            status: 'planificado',
          };
          loadedMeals = [defaultMeal];
          try {
            localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(loadedMeals));
          } catch {
            // ignore
          }
        }
        setMeals(loadedMeals);

        // Cargar compras registradas y extras
        const savedPurchased = localStorage.getItem(STORAGE_KEYS.PURCHASED);
        if (savedPurchased) {
          try {
            setPurchasedAmounts(JSON.parse(savedPurchased));
          } catch {
            // ignore
          }
        }

        const savedExtras = localStorage.getItem(STORAGE_KEYS.EXTRAS);
        if (savedExtras) {
          try {
            setExtraPurchases(JSON.parse(savedExtras));
          } catch {
            // ignore
          }
        }

        // Cargar Almacén e Historial de compras desde IndexedDB (con precarga garantizada)
        try {
          const dbData = await initWarehouseDB();
          setWarehouseItems(dbData.items);
          setWarehouseHistory(dbData.history);
          try {
            localStorage.setItem(STORAGE_KEYS.WAREHOUSE, JSON.stringify(dbData.items));
          } catch {
            // ignore
          }
        } catch (dbErr) {
          console.warn('Error inicializando IndexedDB de almacén:', dbErr);
        }
      } catch (err) {
        console.warn('Error inicializando datos:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Guardar comidas en localStorage al cambiar
  const saveMeals = (newMeals: PlannedMeal[]) => {
    setMeals(newMeals);
    try {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(newMeals));
    } catch (e) {
      console.warn('Error guardando comidas en localStorage', e);
    }
  };

  // Guardar Almacén en estado y localStorage rápido
  const saveWarehouseItemsState = (items: WarehouseItem[]) => {
    setWarehouseItems(items);
    try {
      localStorage.setItem(STORAGE_KEYS.WAREHOUSE, JSON.stringify(items));
    } catch (e) {
      console.warn('Error guardando almacén en localStorage', e);
    }
  };

  // Asignar plato a Día + Momento específico del Diagrama
  const handleAssignDish = (
    dish: Dish,
    day: DayOfWeek,
    moment: MealMoment,
    portions: number
  ) => {
    const existingIndex = meals.findIndex(
      (m) => m.day === day && m.moment === moment && m.status !== 'cancelado'
    );

    const newMeal: PlannedMeal = {
      id:
        existingIndex >= 0
          ? meals[existingIndex].id
          : `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day,
      moment,
      dishId: dish.id,
      dish,
      plateCount: portions,
      status: 'planificado',
    };

    let updated: PlannedMeal[];
    if (existingIndex >= 0) {
      updated = [...meals];
      updated[existingIndex] = newMeal;
    } else {
      updated = [...meals, newMeal];
    }

    saveMeals(updated);

    const momentLabels: Record<MealMoment, string> = {
      desayuno: 'Desayuno',
      media_manana: 'Media Mañana',
      almuerzo: 'Almuerzo',
      media_tarde: 'Media Tarde',
      cena: 'Cena',
    };
    const dayLabels: Record<DayOfWeek, string> = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo',
    };

    showToast(
      `¡${dish.name} asignado a ${momentLabels[moment]} del ${dayLabels[day]}! (${portions} porciones)`
    );
  };

  // Retirar plato de una casilla del diagrama
  const handleRemoveMeal = (mealId: string) => {
    const updated = meals.filter((m) => m.id !== mealId);
    saveMeals(updated);
    showToast('Plato retirado del diagrama');
  };

  // Asignar casilla desde el diagrama
  const handleSelectSlotToAssign = (day: DayOfWeek, moment: MealMoment) => {
    setActiveView('platos');
    showToast(`Elige un plato para ${moment} del ${day}`);
  };

  // Limpiar semana completa
  const handleClearWeek = () => {
    if (window.confirm('¿Deseas reiniciar la semana y limpiar los platos del diagrama?')) {
      saveMeals([]);
      setPurchasedAmounts({});
      try {
        localStorage.removeItem(STORAGE_KEYS.PURCHASED);
      } catch (e) {
        console.warn(e);
      }
      showToast('Diagrama y lista de compras reiniciados');
    }
  };

  // Actualizar cantidad comprada de un ingrediente planificado y correlacionar automáticamente con ALMACÉN
  const handleUpdatePurchasedAmount = async (
    ingredientId: string,
    amount: number,
    itemInfo?: { name: string; unit: string; category: string }
  ) => {
    const prevAmount = purchasedAmounts[ingredientId] || 0;
    const newAmount = Math.max(0, amount);
    const addedDelta = newAmount - prevAmount;

    setPurchasedAmounts((prev) => {
      const next = { ...prev, [ingredientId]: newAmount };
      try {
        localStorage.setItem(STORAGE_KEYS.PURCHASED, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    // Si se aumentó la cantidad comprada y tenemos la información del insumo, SUMAR automáticamente al ALMACÉN
    if (addedDelta > 0 && itemInfo) {
      const { updatedItems, affectedItem } = addOrMergeWarehouseStock(warehouseItems, {
        name: itemInfo.name,
        quantity: addedDelta,
        unit: itemInfo.unit,
        origin: 'comprado',
        category: itemInfo.category,
        notes: 'Comprado según Acumulados',
      });

      saveWarehouseItemsState(updatedItems);
      await saveItemToDB(
        affectedItem,
        'compra_acumulados',
        `+${addedDelta} ${itemInfo.unit} ingresado desde compras de Acumulados`
      );
      const freshHistory = await getFullHistory();
      setWarehouseHistory(freshHistory);

      showToast(`📦 +${addedDelta} ${itemInfo.unit} de "${itemInfo.name}" ingresado a tu Almacén`);
    }
  };

  // Botón "HECHO" en el Diagrama: Marca el plato como preparado y RESTA automáticamente los ingredientes del Almacén
  const handleToggleMealPrepared = async (mealId: string) => {
    const targetMeal = meals.find((m) => m.id === mealId);
    if (!targetMeal) return;

    const willBePrepared = targetMeal.status !== 'preparado';
    const newStatus: PlannedMeal['status'] = willBePrepared ? 'preparado' : 'planificado';

    const updatedMeals = meals.map((m) =>
      m.id === mealId
        ? {
            ...m,
            status: newStatus,
            preparedAt: willBePrepared ? new Date().toISOString() : undefined,
          }
        : m
    );
    saveMeals(updatedMeals);

    if (willBePrepared) {
      // ECUACIÓN MATEMÁTICA: Restar ingredientes del Almacén
      const { updatedItems, deductions, unmatchedIngredients } = deductIngredientsFromWarehouse(
        warehouseItems,
        targetMeal.dish.name,
        targetMeal.dish.ingredients,
        targetMeal.plateCount
      );

      saveWarehouseItemsState(updatedItems);

      // Registrar deducciones en IndexedDB y en historial
      for (const d of deductions) {
        const itemInStore = updatedItems.find((i) => i.id === d.warehouseItemId);
        if (itemInStore) {
          await saveItemToDB(
            itemInStore,
            'consumo_plato_preparado',
            `Consumo de ${d.deductedQty} ${d.unit} para ${targetMeal.plateCount} porciones de "${targetMeal.dish.name}"`
          );
        }
      }

      const freshHistory = await getFullHistory();
      setWarehouseHistory(freshHistory);

      let msg = `✅ ¡"${targetMeal.dish.name}" marcado como HECHO! Se descontaron ${deductions.length} ingredientes del Almacén.`;
      if (unmatchedIngredients.length > 0) {
        msg += ` (${unmatchedIngredients.length} sin stock registrado en almacén)`;
      }
      showToast(msg);
    } else {
      // Revertir estado de preparado
      showToast(`Plato "${targetMeal.dish.name}" revertido a estado pendiente.`);
    }
  };

  // Agregar insumo extra / no programado (con correlación automática a Almacén si está marcado comprado)
  const handleAddExtraPurchase = async (item: Omit<ExtraPurchasedItem, 'id'>) => {
    const newItem: ExtraPurchasedItem = {
      ...item,
      id: `extra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...extraPurchases, newItem];
    setExtraPurchases(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.EXTRAS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    if (item.isPurchased) {
      // Sumar al almacén automáticamente
      const { updatedItems, affectedItem } = addOrMergeWarehouseStock(warehouseItems, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        origin: 'comprado',
        category: item.category,
        notes: 'Insumo extra comprado en mercado',
      });
      saveWarehouseItemsState(updatedItems);
      await saveItemToDB(
        affectedItem,
        'compra_acumulados',
        `+${item.quantity} ${item.unit} (Insumo extra no programado)`
      );
      const freshHistory = await getFullHistory();
      setWarehouseHistory(freshHistory);
      showToast(`📦 "${item.name}" agregado a compras e ingresado al Almacén`);
    }
  };

  // Eliminar insumo extra
  const handleRemoveExtraPurchase = (id: string) => {
    const updated = extraPurchases.filter((e) => e.id !== id);
    setExtraPurchases(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.EXTRAS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    showToast('Insumo extra eliminado');
  };

  // Alternar estado comprado de un insumo extra y reflejar en Almacén
  const handleToggleExtraPurchased = async (id: string) => {
    const target = extraPurchases.find((e) => e.id === id);
    if (!target) return;

    const willBePurchased = !target.isPurchased;
    const updated = extraPurchases.map((e) =>
      e.id === id ? { ...e, isPurchased: willBePurchased } : e
    );
    setExtraPurchases(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.EXTRAS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    if (willBePurchased) {
      const { updatedItems, affectedItem } = addOrMergeWarehouseStock(warehouseItems, {
        name: target.name,
        quantity: target.quantity,
        unit: target.unit,
        origin: 'comprado',
        category: target.category,
        notes: 'Insumo extra marcado como comprado',
      });
      saveWarehouseItemsState(updatedItems);
      await saveItemToDB(
        affectedItem,
        'compra_acumulados',
        `+${target.quantity} ${target.unit} de insumo extra marcado comprado`
      );
      const freshHistory = await getFullHistory();
      setWarehouseHistory(freshHistory);
      showToast(`📦 "${target.name}" sumado al Almacén (+${target.quantity} ${target.unit})`);
    }
  };

  // --- HANDLERS DEL MÓDULO ALMACÉN CON INDEXEDDB & HISTORIAL ---
  const handleWarehouseAddItem = async (item: Omit<WarehouseItem, 'id' | 'dateAdded'>) => {
    const today = new Date().toLocaleDateString('es-PE');
    const newItem: WarehouseItem = {
      ...item,
      id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dateAdded: today,
      lastUpdated: today,
    };
    const updated = [newItem, ...warehouseItems];
    saveWarehouseItemsState(updated);
    await saveItemToDB(newItem, 'registro_almacen');
    const freshHistory = await getFullHistory();
    setWarehouseHistory(freshHistory);
  };

  const handleWarehouseUpdateQuantity = async (id: string, newQuantity: number) => {
    const target = warehouseItems.find((i) => i.id === id);
    if (!target) return;

    const updatedItem: WarehouseItem = {
      ...target,
      quantity: Math.max(0, newQuantity),
      lastUpdated: new Date().toLocaleDateString('es-PE'),
    };
    const updated = warehouseItems.map((item) => (item.id === id ? updatedItem : item));
    saveWarehouseItemsState(updated);
    await saveItemToDB(updatedItem, 'edicion_cantidad', `Ajuste de cantidad a ${updatedItem.quantity} ${updatedItem.unit}`);
    const freshHistory = await getFullHistory();
    setWarehouseHistory(freshHistory);
  };

  const handleWarehouseUpdateUnit = async (id: string, newUnit: string) => {
    const target = warehouseItems.find((i) => i.id === id);
    if (!target) return;

    const updatedItem: WarehouseItem = {
      ...target,
      unit: newUnit.trim() || target.unit,
      lastUpdated: new Date().toLocaleDateString('es-PE'),
    };
    const updated = warehouseItems.map((item) => (item.id === id ? updatedItem : item));
    saveWarehouseItemsState(updated);
    await saveItemToDB(updatedItem, 'edicion_unidad', `Unidad actualizada a "${updatedItem.unit}"`);
    const freshHistory = await getFullHistory();
    setWarehouseHistory(freshHistory);
  };

  const handleWarehouseUpdateCategory = async (id: string, newCategory: string) => {
    const target = warehouseItems.find((i) => i.id === id);
    if (!target) return;

    const updatedItem: WarehouseItem = {
      ...target,
      category: newCategory,
      lastUpdated: new Date().toLocaleDateString('es-PE'),
    };
    const updated = warehouseItems.map((item) => (item.id === id ? updatedItem : item));
    saveWarehouseItemsState(updated);
    await saveItemToDB(updatedItem, 'cambio_categoria', `Categoría cambiada de "${target.category}" a "${newCategory}"`);
    const freshHistory = await getFullHistory();
    setWarehouseHistory(freshHistory);
  };

  const handleWarehouseToggleOrigin = async (id: string) => {
    const target = warehouseItems.find((i) => i.id === id);
    if (!target) return;

    const newOrigin: WarehouseItemOrigin = target.origin === 'comprado' ? 'donado' : 'comprado';
    const updatedItem: WarehouseItem = {
      ...target,
      origin: newOrigin,
      lastUpdated: new Date().toLocaleDateString('es-PE'),
    };
    const updated = warehouseItems.map((item) => (item.id === id ? updatedItem : item));
    saveWarehouseItemsState(updated);
    await saveItemToDB(updatedItem, 'cambio_origen', `Origen cambiado a ${newOrigin.toUpperCase()}`);
    const freshHistory = await getFullHistory();
    setWarehouseHistory(freshHistory);
  };

  const handleWarehouseRemoveItem = async (id: string) => {
    const target = warehouseItems.find((i) => i.id === id);
    if (!target) return;

    const updated = warehouseItems.filter((item) => item.id !== id);
    saveWarehouseItemsState(updated);
    await deleteItemFromDB(target);
    const freshHistory = await getFullHistory();
    setWarehouseHistory(freshHistory);
  };

  // Descarga del historial e inventario en Excel
  const handleExportWarehouseExcel = () => {
    try {
      exportWarehouseToExcel(warehouseItems, warehouseHistory);
      showToast('¡Inventario e historial de compras exportados a Excel (.xlsx)!');
    } catch (e) {
      console.error(e);
      showToast('Error generando archivo Excel', 'error');
    }
  };

  // Cargar compras realizadas en Acumulados al Almacén
  const plannedItems = totalizePlannedIngredients(meals, []);
  const boughtPlannedItems = plannedItems.filter((i) => (purchasedAmounts[i.ingredientId] || 0) > 0);
  const boughtExtraItems = extraPurchases.filter((e) => e.isPurchased);
  const totalBoughtAvailableToImport = boughtPlannedItems.length + boughtExtraItems.length;

  const handleWarehouseImportFromPurchased = async () => {
    const newItems: WarehouseItem[] = [];
    const today = new Date().toLocaleDateString('es-PE');

    boughtPlannedItems.forEach((p) => {
      const purchasedQty = purchasedAmounts[p.ingredientId] || 0;
      newItems.push({
        id: `wh-imp-${Date.now()}-${p.ingredientId}`,
        name: p.name,
        quantity: purchasedQty,
        unit: p.unit,
        origin: 'comprado',
        category: p.category,
        notes: 'Comprado según menú semanal',
        dateAdded: today,
        lastUpdated: today,
      });
    });

    boughtExtraItems.forEach((extra) => {
      newItems.push({
        id: `wh-imp-${Date.now()}-${extra.id}`,
        name: extra.name,
        quantity: extra.quantity,
        unit: extra.unit,
        origin: 'comprado',
        category: extra.category,
        notes: 'Insumo extra de mercado',
        dateAdded: today,
        lastUpdated: today,
      });
    });

    if (newItems.length > 0) {
      const merged = [...newItems, ...warehouseItems];
      saveWarehouseItemsState(merged);

      for (const item of newItems) {
        await saveItemToDB(item, 'compra_acumulados', 'Importado desde módulo de Acumulados');
      }

      const freshHistory = await getFullHistory();
      setWarehouseHistory(freshHistory);

      showToast(`¡${newItems.length} insumos comprados se cargaron al almacén e IndexedDB!`);
    } else {
      showToast('No hay insumos marcados como comprados para traspasar', 'error');
    }
  };

  // Sincronizar Google Sheets en vivo
  const handleSyncSheet = useCallback(
    async (urlOrId: string): Promise<boolean> => {
      setIsRefreshing(true);
      try {
        const res = await fetchDishesFromGoogleSheets(urlOrId);
        if (res.dishes && res.dishes.length > 0) {
          setDishes(res.dishes);

          setMeals((prevMeals) => {
            const updated = prevMeals.map((m) => {
              const freshDish = res.dishes.find(
                (d) =>
                  d.id === m.dishId ||
                  normalizeString(d.name) === normalizeString(m.dish.name)
              );
              if (freshDish) {
                return {
                  ...m,
                  dishId: freshDish.id,
                  dish: freshDish,
                };
              }
              return m;
            });

            try {
              localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          });

          const now = new Date().toLocaleString('es-PE', {
            dateStyle: 'short',
            timeStyle: 'short',
          });
          setSheetUrl(urlOrId);
          setLastSyncTime(now);

          try {
            localStorage.setItem(STORAGE_KEYS.SHEET_URL, urlOrId);
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
            localStorage.setItem(
              STORAGE_KEYS.CACHED_DISHES,
              JSON.stringify(res.dishes)
            );
          } catch {
            // ignore
          }

          const totalIngs = res.dishes.reduce(
            (sum, d) => sum + d.ingredients.length,
            0
          );
          showToast(
            `¡Sincronizado! Se actualizaron ${res.dishes.length} platos y ${totalIngs} ingredientes.`
          );
          return true;
        }
        return false;
      } catch {
        showToast('Error conectando a Google Sheets', 'error');
        return false;
      } finally {
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  const handleQuickRefresh = () => {
    if (sheetUrl) {
      handleSyncSheet(sheetUrl);
    } else {
      setIsSheetsModalOpen(true);
    }
  };

  // Filtrado de platos
  const filteredDishes = dishes.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      normalizeString(d.name).includes(normalizeString(searchQuery)) ||
      d.ingredients.some((i) =>
        normalizeString(i.ingredientName).includes(normalizeString(searchQuery))
      );

    const matchesCategory =
      selectedCategory === 'Todos' || d.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] dark:bg-[#07090F]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#FF6B2C] dark:border-[#00FF66] border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-black text-[#1E1E2D] dark:text-[#00FF66]">
            Cargando Mesa Semanal...
          </h2>
          <p className="text-xs text-[#8A8A99] dark:text-[#8E9DBA]">
            Conectando catálogo, IndexedDB de Almacén y tema de pantalla
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#07090F] transition-colors">
      {/* Barra de Navegación Simplificada */}
      <SimplifiedNavbar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        selectedDishesCount={meals.length}
        warehouseItemsCount={warehouseItems.length}
        isSheetsConnected={true}
        onQuickRefresh={handleQuickRefresh}
        isRefreshing={isRefreshing}
      />

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="flex-1">
        {/* MÓDULO 1: CATÁLOGO DE PLATOS */}
        {activeView === 'platos' && (
          <div className="max-w-5xl mx-auto px-4 py-5 pb-28 space-y-5">
            {/* Buscador grande y Filtro por Categorías */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A99] dark:text-[#8E9DBA]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar plato o ingrediente (lomo, ají, pollo, arroz...)"
                  className="w-full bg-white dark:bg-[#111526] pl-11 pr-10 py-3 rounded-full border border-[#F0E6D8] dark:border-[#1E2840] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] focus:ring-2 focus:ring-[#FF6B2C]/20 dark:focus:ring-[#00FF66]/20 text-sm text-[#1E1E2D] dark:text-[#D1FFD7] shadow-xs outline-none transition-all placeholder:text-[#8A8A99] dark:placeholder:text-[#556783]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#8A8A99] hover:text-[#1E1E2D] dark:hover:text-[#00FF66]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Chips de Categorías deslizable */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black shadow-xs font-black'
                          : 'bg-white dark:bg-[#111526] text-[#8A8A99] dark:text-[#8E9DBA] hover:bg-[#F5F5FA] dark:hover:bg-[#1C243B] hover:text-[#1E1E2D] dark:hover:text-[#00FF66] border border-[#F0E6D8] dark:border-[#1E2840]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner con accesos rápidos si ya hay platos programados */}
            {meals.length > 0 && (
              <div className="bg-gradient-to-r from-[#1E1E2D] to-[#2D2D42] dark:from-[#111827] dark:to-[#1F293D] text-white p-3.5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 border border-transparent dark:border-[#00FF66]/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B2C] dark:bg-[#00FF66] text-white dark:text-black flex items-center justify-center font-black text-xs">
                    {meals.length}
                  </div>
                  <div>
                    <span className="text-xs font-bold block dark:text-[#00FF66]">
                      {meals.length} {meals.length === 1 ? 'comida asignada' : 'comidas asignadas'} a la semana
                    </span>
                    <span className="text-[11px] text-white/70 dark:text-[#8E9DBA]">
                      Revisa tu diagrama organizado, lista de compras o existencias en almacén
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveView('diagrama')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#FFAE68] dark:text-[#00FF66]" />
                    <span>Ver Diagrama</span>
                  </button>
                  <button
                    onClick={() => setActiveView('acumulados')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-[#86EFAC] dark:text-[#00FF66]" />
                    <span>Ver Acumulados</span>
                  </button>
                  <button
                    onClick={() => setActiveView('almacen')}
                    className="bg-[#FF6B2C] dark:bg-[#00FF66] hover:bg-[#FA5A2A] dark:hover:bg-[#00CC55] text-white dark:text-black font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Warehouse className="w-3.5 h-3.5" />
                    <span>Ver Almacén →</span>
                  </button>
                </div>
              </div>
            )}

            {/* Grilla de Tarjetas de Platos con formato de 5 pasos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <FoodDeliveryDishCard
                  key={dish.id}
                  dish={dish}
                  assignedMeals={meals}
                  onAssignDish={handleAssignDish}
                />
              ))}
            </div>
          </div>
        )}

        {/* MÓDULO 2: DIAGRAMA SEMANAL ORGANIZADO */}
        {activeView === 'diagrama' && (
          <WeeklyDiagramView
            meals={meals}
            onRemoveMeal={handleRemoveMeal}
            onToggleMealPrepared={handleToggleMealPrepared}
            onClearWeek={handleClearWeek}
            onSelectSlotToAssign={handleSelectSlotToAssign}
            onGoToShopping={() => setActiveView('acumulados')}
          />
        )}

        {/* MÓDULO 3: ACUMULADOS & CONTROL DE COMPRAS */}
        {activeView === 'acumulados' && (
          <AccumulatedShoppingView
            meals={meals}
            extraPurchases={extraPurchases}
            purchasedAmounts={purchasedAmounts}
            onUpdatePurchasedAmount={handleUpdatePurchasedAmount}
            onAddExtraPurchase={handleAddExtraPurchase}
            onRemoveExtraPurchase={handleRemoveExtraPurchase}
            onToggleExtraPurchased={handleToggleExtraPurchased}
            onClearWeek={handleClearWeek}
            onGoToCatalog={() => setActiveView('platos')}
            onGoToDiagram={() => setActiveView('diagrama')}
          />
        )}

        {/* MÓDULO 4: ALMACÉN CON HISTORIAL & EXPORTACIÓN EXCEL */}
        {activeView === 'almacen' && (
          <WarehouseView
            items={warehouseItems}
            history={warehouseHistory}
            onAddItem={handleWarehouseAddItem}
            onUpdateItemQuantity={handleWarehouseUpdateQuantity}
            onUpdateItemUnit={handleWarehouseUpdateUnit}
            onUpdateItemCategory={handleWarehouseUpdateCategory}
            onToggleItemOrigin={handleWarehouseToggleOrigin}
            onRemoveItem={handleWarehouseRemoveItem}
            onExportExcel={handleExportWarehouseExcel}
            onImportFromPurchased={handleWarehouseImportFromPurchased}
            purchasedAvailableToImportCount={totalBoughtAvailableToImport}
          />
        )}
      </main>

      {/* Modal de Sincronización Google Sheets */}
      <GoogleSheetSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        currentSheetUrl={sheetUrl}
        onSyncSheet={handleSyncSheet}
        lastSyncTime={lastSyncTime}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <SimplifiedAppContent />
    </ToastProvider>
  );
}
