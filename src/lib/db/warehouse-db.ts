import { WarehouseItem, PurchaseHistoryEntry } from '@/types/purchase';
import * as XLSX from 'xlsx';

const DB_NAME = 'MesaSemanal_AlmacenDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'warehouse_items';
const STORE_HISTORY = 'purchase_history';

export const INITIAL_PRELOADED_WAREHOUSE_ITEMS: WarehouseItem[] = [
  { id: 'wh-1', name: 'Papa blanca', quantity: 15, unit: 'kg', origin: 'comprado', category: 'Verduras', notes: 'Mercado de Productores', dateAdded: '04/11/2026', lastUpdated: '04/11/2026' },
  { id: 'wh-2', name: 'Arroz costeño', quantity: 10, unit: 'kg', origin: 'comprado', category: 'Víveres', notes: 'Saco 10kg', dateAdded: '04/11/2026', lastUpdated: '04/11/2026' },
  { id: 'wh-3', name: 'Aceite vegetal', quantity: 3, unit: 'L', origin: 'donado', category: 'Víveres', notes: 'Donación Parroquia San José', dateAdded: '04/11/2026', lastUpdated: '04/11/2026' },
  { id: 'wh-4', name: 'Cebolla roja', quantity: 8, unit: 'kg', origin: 'comprado', category: 'Verduras', notes: 'Malla fresca', dateAdded: '04/11/2026', lastUpdated: '04/11/2026' },
  { id: 'wh-5', name: 'Ajo entero', quantity: 5, unit: 'cabezas', origin: 'donado', category: 'Verduras', notes: 'Huerto familiar', dateAdded: '04/11/2026', lastUpdated: '04/11/2026' },
  { id: 'wh-6', name: 'Canela y clavo', quantity: 2, unit: 'paquete', origin: 'donado', category: 'Especias y Condimentos', notes: 'Donación vecinal', dateAdded: '04/11/2026', lastUpdated: '04/11/2026' },
  { id: 'wh-7', name: 'Yuca fresca', quantity: 1, unit: 'tronco', origin: 'comprado', category: 'Verduras', notes: 'Tronco entero para trozar', dateAdded: '04/11/2026', lastUpdated: '04/11/2026' },
];

/**
 * Abre la conexión a IndexedDB creando los almacenes e índices necesarios
 */
export function openWarehouseDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Almacén de existencias actuales
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        const itemStore = db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
        itemStore.createIndex('by_origin', 'origin', { unique: false });
        itemStore.createIndex('by_category', 'category', { unique: false });
        itemStore.createIndex('by_name', 'name', { unique: false });
      }

      // 2. Almacén de historial completo de compras y movimientos
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const historyStore = db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        historyStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        historyStore.createIndex('by_origin', 'origin', { unique: false });
        historyStore.createIndex('by_action', 'action', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Inicializa y migra datos existentes (desde localStorage o precargados) a IndexedDB
 */
export async function initWarehouseDB(): Promise<{ items: WarehouseItem[]; history: PurchaseHistoryEntry[] }> {
  try {
    const db = await openWarehouseDB();

    // Obtener items actuales de IndexedDB
    const items = await getItemsFromDB(db);

    if (items.length === 0) {
      // Verificar si hay datos previos en localStorage
      let initialToLoad = INITIAL_PRELOADED_WAREHOUSE_ITEMS;
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mesa_semanal_warehouse_items_v2');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialToLoad = parsed;
            }
          } catch {
            // fallback a INITIAL_PRELOADED_WAREHOUSE_ITEMS
          }
        }
      }

      // Guardar elementos iniciales precargados en IndexedDB
      const tx = db.transaction([STORE_ITEMS, STORE_HISTORY], 'readwrite');
      const itemStore = tx.objectStore(STORE_ITEMS);
      const historyStore = tx.objectStore(STORE_HISTORY);

      for (const item of initialToLoad) {
        itemStore.put(item);
        const historyEntry: PurchaseHistoryEntry = {
          id: `hist-init-${item.id}`,
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          origin: item.origin,
          category: item.category || 'Víveres',
          notes: item.notes || 'Insumo precargado en almacén',
          timestamp: Date.now(),
          dateStr: item.dateAdded || new Date().toLocaleDateString('es-PE'),
          action: 'registro_almacen',
        };
        historyStore.put(historyEntry);
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      return {
        items: initialToLoad,
        history: await getHistoryFromDB(db),
      };
    }

    const history = await getHistoryFromDB(db);
    return { items, history };
  } catch (err) {
    console.warn('Fallback a modo memoria/localStorage para almacén:', err);
    return {
      items: INITIAL_PRELOADED_WAREHOUSE_ITEMS,
      history: [],
    };
  }
}

function getItemsFromDB(db: IDBDatabase): Promise<WarehouseItem[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ITEMS, 'readonly');
    const store = tx.objectStore(STORE_ITEMS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function getHistoryFromDB(db: IDBDatabase): Promise<PurchaseHistoryEntry[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_HISTORY, 'readonly');
    const store = tx.objectStore(STORE_HISTORY);
    const request = store.getAll();
    request.onsuccess = () => {
      const results: PurchaseHistoryEntry[] = request.result || [];
      // Ordenar por fecha y hora descendente (más recientes primero)
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Guarda o actualiza un ítem en IndexedDB y añade registro al historial
 */
export async function saveItemToDB(
  item: WarehouseItem,
  action: PurchaseHistoryEntry['action'] = 'registro_almacen',
  details?: string
): Promise<void> {
  try {
    const db = await openWarehouseDB();
    const tx = db.transaction([STORE_ITEMS, STORE_HISTORY], 'readwrite');
    const itemStore = tx.objectStore(STORE_ITEMS);
    const historyStore = tx.objectStore(STORE_HISTORY);

    itemStore.put(item);

    const historyEntry: PurchaseHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      origin: item.origin,
      category: item.category || 'Víveres',
      notes: details || item.notes,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString('es-PE'),
      action,
    };
    historyStore.put(historyEntry);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error guardando en IndexedDB:', err);
  }
}

/**
 * Elimina un ítem de IndexedDB y registra la baja en el historial
 */
export async function deleteItemFromDB(item: WarehouseItem): Promise<void> {
  try {
    const db = await openWarehouseDB();
    const tx = db.transaction([STORE_ITEMS, STORE_HISTORY], 'readwrite');
    const itemStore = tx.objectStore(STORE_ITEMS);
    const historyStore = tx.objectStore(STORE_HISTORY);

    itemStore.delete(item.id);

    const historyEntry: PurchaseHistoryEntry = {
      id: `hist-del-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      origin: item.origin,
      category: item.category || 'Víveres',
      notes: `Insumo retirado del almacén (${item.notes || 'sin notas adicionales'})`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString('es-PE'),
      action: 'eliminacion',
    };
    historyStore.put(historyEntry);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error eliminando de IndexedDB:', err);
  }
}

/**
 * Obtiene el historial completo de compras y movimientos
 */
export async function getFullHistory(): Promise<PurchaseHistoryEntry[]> {
  try {
    const db = await openWarehouseDB();
    return await getHistoryFromDB(db);
  } catch {
    return [];
  }
}

/**
 * Exporta el inventario y todo el historial de compras a un archivo Excel (.xlsx)
 */
export function exportWarehouseToExcel(items: WarehouseItem[], history: PurchaseHistoryEntry[]) {
  const wb = XLSX.utils.book_new();

  // 1. Hoja: Inventario de Existencias Actuales
  const inventoryData = items.map((i, idx) => ({
    'N°': idx + 1,
    'Alimento / Insumo': i.name,
    'Tipo': i.origin === 'donado' ? 'DONADO 🎁' : 'COMPRADO 🛒',
    'Cantidad': i.quantity,
    'Unidad de Medida': i.unit,
    'Categoría': i.category || 'General',
    'Lugar / Donante / Notas': i.notes || '',
    'Fecha de Registro': i.dateAdded || '',
    'Última Modificación': i.lastUpdated || i.dateAdded || '',
  }));
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);

  // Anchos de columna recomendados para Inventario
  wsInventory['!cols'] = [
    { wch: 5 },  // N°
    { wch: 28 }, // Alimento
    { wch: 15 }, // Tipo
    { wch: 12 }, // Cantidad
    { wch: 16 }, // Unidad
    { wch: 22 }, // Categoría
    { wch: 35 }, // Notas
    { wch: 18 }, // Fecha Registro
    { wch: 18 }, // Última Modificación
  ];

  XLSX.utils.book_append_sheet(wb, wsInventory, 'Existencias Almacén');

  // 2. Hoja: Historial Completo de Compras y Movimientos
  const actionLabels: Record<PurchaseHistoryEntry['action'], string> = {
    registro_almacen: 'Ingreso Nuevo',
    edicion_cantidad: 'Ajuste de Cantidad',
    edicion_unidad: 'Cambio de Unidad',
    cambio_origen: 'Cambio Comprado/Donado',
    cambio_categoria: 'Cambio de Categoría',
    eliminacion: 'Retiro / Consumo',
    compra_acumulados: 'Ingreso desde Compras',
    consumo_plato_preparado: 'Consumo por Plato Hecho',
    reversion_plato_preparado: 'Reversión Plato Hecho',
  };

  const historyData = history.map((h, idx) => ({
    'N°': idx + 1,
    'Fecha y Hora': h.dateStr,
    'Acción': actionLabels[h.action] || h.action,
    'Insumo': h.name,
    'Tipo': h.origin === 'donado' ? 'DONADO 🎁' : 'COMPRADO 🛒',
    'Cantidad': h.quantity,
    'Unidad': h.unit,
    'Categoría': h.category,
    'Detalle / Notas': h.notes || '',
  }));
  const wsHistory = XLSX.utils.json_to_sheet(historyData);

  wsHistory['!cols'] = [
    { wch: 5 },  // N°
    { wch: 22 }, // Fecha y Hora
    { wch: 24 }, // Acción
    { wch: 28 }, // Insumo
    { wch: 15 }, // Tipo
    { wch: 12 }, // Cantidad
    { wch: 14 }, // Unidad
    { wch: 22 }, // Categoría
    { wch: 38 }, // Detalle
  ];

  XLSX.utils.book_append_sheet(wb, wsHistory, 'Historial de Compras');

  // Nombre de archivo con fecha actual
  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `Mesa_Semanal_Historial_Almacen_${todayStr}.xlsx`;

  // Descarga directa en el navegador
  XLSX.writeFile(wb, filename);
}
