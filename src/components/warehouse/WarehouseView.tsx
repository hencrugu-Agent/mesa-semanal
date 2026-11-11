'use client';

import React, { useState, useRef, useEffect } from 'react';
import { WarehouseItem, WarehouseItemOrigin, PurchaseHistoryEntry } from '@/types/purchase';
import { useToast } from '@/components/ui/Toast';
import {
  Warehouse,
  Plus,
  Trash2,
  Share2,
  Printer,
  Search,
  Gift,
  ShoppingBag,
  ArrowDownToLine,
  Filter,
  FileSpreadsheet,
  History,
  Check,
  ChevronDown,
  Clock,
} from 'lucide-react';

interface WarehouseViewProps {
  items: WarehouseItem[];
  history?: PurchaseHistoryEntry[];
  onAddItem: (item: Omit<WarehouseItem, 'id' | 'dateAdded'>) => void;
  onUpdateItemQuantity: (id: string, newQuantity: number) => void;
  onUpdateItemUnit: (id: string, newUnit: string) => void;
  onUpdateItemCategory: (id: string, newCategory: string) => void;
  onToggleItemOrigin: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onExportExcel: () => void;
  onImportFromPurchased?: () => void;
  purchasedAvailableToImportCount?: number;
  currencySymbol?: string;
}

// Opciones preestablecidas precargadas para la sugerencia de unidades
const PRESET_UNITS = [
  'kg',
  'und',
  'cabezas',
  'paquete',
  'tronco',
  'atado',
  'lata',
  'saco',
  'L',
  'g',
  'docena',
  'manojo',
  'botella',
  'litro',
  'gramo',
  'kilo',
  'caja',
  'balde',
];

export const CATEGORIES = [
  'Víveres',
  'Verduras',
  'Frutas',
  'Carnes y Aves',
  'Pescados y Mariscos',
  'Lácteos y Huevos',
  'Especias y Condimentos',
  'Otros',
];

export function WarehouseView({
  items,
  history = [],
  onAddItem,
  onUpdateItemQuantity,
  onUpdateItemUnit,
  onUpdateItemCategory,
  onToggleItemOrigin,
  onRemoveItem,
  onExportExcel,
  onImportFromPurchased,
  purchasedAvailableToImportCount = 0,
}: WarehouseViewProps) {
  const { showToast } = useToast();

  // Estados del casillero de ingreso manual
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitInput, setUnitInput] = useState<string>('kg');
  const [isUnitSuggestionsOpen, setIsUnitSuggestionsOpen] = useState<boolean>(false);
  const [origin, setOrigin] = useState<WarehouseItemOrigin>('comprado');
  const [category, setCategory] = useState<string>('Víveres');
  const [notes, setNotes] = useState<string>('');

  // Selector inline de categoría activo en la tabla
  const [editingCategoryItemId, setEditingCategoryItemId] = useState<string | null>(null);

  // Pestaña activa: Inventario o Historial de Compras
  const [activeTab, setActiveTab] = useState<'inventario' | 'historial'>('inventario');

  // Filtros de visualización
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOrigin, setFilterOrigin] = useState<'todos' | 'comprado' | 'donado'>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');

  const unitInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filtrar sugerencias de unidades al escribir la primera letra
  const filteredUnitSuggestions = PRESET_UNITS.filter((u) => {
    if (!unitInput.trim()) return true;
    return u.toLowerCase().startsWith(unitInput.trim().toLowerCase()) ||
           u.toLowerCase().includes(unitInput.trim().toLowerCase());
  });

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        unitInputRef.current &&
        !unitInputRef.current.contains(event.target as Node)
      ) {
        setIsUnitSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejo de registro de nuevo ítem
  const handleRegisterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Ingresa el nombre del insumo o alimento', 'error');
      return;
    }

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      showToast('Ingresa una cantidad válida mayor a cero', 'error');
      return;
    }

    const finalUnit = unitInput.trim() || 'und';

    onAddItem({
      name: name.trim(),
      quantity: numQty,
      unit: finalUnit,
      origin,
      category,
      notes: notes.trim() || undefined,
    });

    setName('');
    setQuantity('1');
    setNotes('');
    setIsUnitSuggestionsOpen(false);

    showToast(`¡"${name.trim()}" registrado en el almacén como ${origin.toUpperCase()}!`);
  };

  // Filtrado de la tabla de inventario
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrigin = filterOrigin === 'todos' || item.origin === filterOrigin;
    const matchesCategory = filterCategory === 'Todos' || item.category === filterCategory;

    return matchesSearch && matchesOrigin && matchesCategory;
  });

  // Métricas generales
  const totalCount = items.length;
  const boughtCount = items.filter((i) => i.origin === 'comprado').length;
  const donatedCount = items.filter((i) => i.origin === 'donado').length;

  // Totales acumulados por unidades principales
  const totalKg = items
    .filter((i) => i.unit.toLowerCase() === 'kg' || i.unit.toLowerCase() === 'kilogramos')
    .reduce((sum, i) => sum + i.quantity, 0);

  const totalUnd = items
    .filter((i) => i.unit.toLowerCase() === 'und' || i.unit.toLowerCase() === 'unidades')
    .reduce((sum, i) => sum + i.quantity, 0);

  // Compartir inventario a WhatsApp
  const handleShareWhatsApp = () => {
    let text = `📦 *MESA SEMANAL — INVENTARIO DE ALMACÉN*\n`;
    text += `📊 Total de insumos: ${totalCount} (${boughtCount} Comprados · ${donatedCount} Donados)\n`;
    if (totalKg > 0) text += `⚖️ Total acumulado en peso: ${totalKg.toFixed(2)} kg\n`;
    if (totalUnd > 0) text += `🔢 Total acumulado en unidades: ${totalUnd} und\n\n`;

    const boughtList = items.filter((i) => i.origin === 'comprado');
    if (boughtList.length > 0) {
      text += `🛒 *INSUMOS COMPRADOS:*\n`;
      boughtList.forEach((i) => {
        const noteStr = i.notes ? ` _(${i.notes})_` : '';
        text += `• ${i.name}: *${i.quantity} ${i.unit}* [${i.category || 'General'}]${noteStr}\n`;
      });
      text += `\n`;
    }

    const donatedList = items.filter((i) => i.origin === 'donado');
    if (donatedList.length > 0) {
      text += `🎁 *INSUMOS DONADOS:*\n`;
      donatedList.forEach((i) => {
        const noteStr = i.notes ? ` _(Donante: ${i.notes})_` : '';
        text += `• ${i.name}: *${i.quantity} ${i.unit}* [${i.category || 'General'}]${noteStr}\n`;
      });
      text += `\n`;
    }

    text += `_Generado con Mesa Semanal — Módulo Almacén & Historial_`;

    navigator.clipboard.writeText(text);
    showToast('¡Inventario de almacén copiado para WhatsApp!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-6 pb-28 space-y-5 pt-2">
      {/* CABECERA PRINCIPAL CON MÉTRICAS Y BOTÓN EXCEL */}
      <div className="bg-white dark:bg-[#111526] rounded-[28px] p-5 border border-[#F0E6D8] dark:border-[#1E2840] shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D] dark:text-[#00FF66] bg-[#DCFCE7] dark:bg-[#00FF66]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-transparent dark:border-[#00FF66]/30">
              <Warehouse className="w-3 h-3 text-[#15803D] dark:text-[#00FF66]" />
              <span>Control de Existencias & Historial</span>
            </span>
            <span className="text-xs text-[#8A8A99] dark:text-[#8E9DBA] font-mono-numbers">
              {totalCount} insumos · IndexedDB activa
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#1E1E2D] dark:text-[#00FF66] tracking-tight mt-1">
            Almacén & Despensa
          </h2>
          <p className="text-xs text-[#8A8A99] dark:text-[#8E9DBA] mt-0.5">
            Registra alimentos comprados o donados con autocompletado de unidades, edición rápida de categorías y descarga de historial en Excel.
          </p>
        </div>

        {/* Métricas y Acciones Principales */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Conteo de Comprados vs Donados */}
          <div className="bg-[#FAF7F2] dark:bg-[#13182B] border border-[#E5E0D8] dark:border-[#202A44] rounded-2xl px-3.5 py-2 flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-[#1E1E2D] dark:text-[#FF8800]">
              <ShoppingBag className="w-4 h-4 text-[#FF6B2C] dark:text-[#FF8800]" />
              <span>{boughtCount} Comprados</span>
            </div>
            <div className="w-px h-4 bg-[#D1D1DB] dark:bg-[#202A44]" />
            <div className="flex items-center gap-1.5 text-[#581C87] dark:text-[#D946EF]">
              <Gift className="w-4 h-4 text-[#9333EA] dark:text-[#D946EF]" />
              <span>{donatedCount} Donados</span>
            </div>
          </div>

          {/* Botón Destacado: Descargar Historial en Excel */}
          <button
            onClick={onExportExcel}
            className="bg-[#107C41] hover:bg-[#0b5c30] text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 border border-[#107C41]/30"
            title="Descargar el inventario actual y todo el historial de compras en formato Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Descargar Historial Excel</span>
          </button>

          {/* Pasar compras si hay disponibles */}
          {onImportFromPurchased && purchasedAvailableToImportCount > 0 && (
            <button
              onClick={onImportFromPurchased}
              className="bg-[#15803D] dark:bg-[#00FF66] hover:bg-[#166534] dark:hover:bg-[#00CC55] text-white dark:text-black px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Cargar las compras registradas en Acumulados directamente al almacén"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="hidden sm:inline">Pasar Compras ({purchasedAvailableToImportCount})</span>
            </button>
          )}

          {/* WhatsApp & Imprimir */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareWhatsApp}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Copiar inventario a WhatsApp"
              aria-label="Copiar a WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="bg-[#1E1E2D] dark:bg-[#1A2238] hover:bg-black dark:hover:bg-[#232F4C] text-white p-2.5 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer border border-transparent dark:border-[#2A3758]"
              title="Imprimir inventario"
              aria-label="Imprimir inventario"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CASILLERO SIMPLIFICADO DE REGISTRO MANUAL */}
      <div className="bg-white dark:bg-[#111526] rounded-[28px] p-5 border border-[#F0E6D8] dark:border-[#1E2840] shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#F0E6D8] dark:border-[#1E2840] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FFF0E6] dark:bg-[#00FF66]/20 flex items-center justify-center text-[#FF6B2C] dark:text-[#00FF66]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1E1E2D] dark:text-[#00FF66] uppercase tracking-wider">
                Casillero de Ingreso Simplificado al Almacén
              </h3>
              <p className="text-[11px] text-[#8A8A99] dark:text-[#8E9DBA]">
                Solo un casillero de unidad: escribe la primera letra para ver sugerencias (kg, cabezas, tronco, paquete...).
              </p>
            </div>
          </div>

          {/* Selector de Tipo: COMPRADO vs DONADO */}
          <div className="flex items-center bg-[#F5F5FA] dark:bg-[#13182B] p-1 rounded-2xl border border-[#EBEBF2] dark:border-[#202A44]">
            <button
              type="button"
              onClick={() => setOrigin('comprado')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                origin === 'comprado'
                  ? 'bg-[#1E1E2D] dark:bg-[#FF8800] text-white dark:text-black shadow-xs'
                  : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#1E1E2D] dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#FF6B2C] dark:text-black" />
              <span>🛒 Comprado</span>
            </button>
            <button
              type="button"
              onClick={() => setOrigin('donado')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                origin === 'donado'
                  ? 'bg-[#7E22CE] dark:bg-[#D946EF] text-white shadow-xs'
                  : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#7E22CE] dark:hover:text-[#D946EF]'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-[#FFAE68] dark:text-white" />
              <span>🎁 Donado</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleRegisterItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Casillero 1: Nombre del Insumo */}
            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-black uppercase text-[#8A8A99] dark:text-[#8E9DBA] tracking-wider block">
                Nombre del Insumo / Alimento *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Papa blanca, Cebolla, Ajo, Pollo, Zapallo..."
                className="w-full bg-[#FAF7F2] dark:bg-[#0C101D] border border-[#E5E0D8] dark:border-[#223050] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#1E1E2D] dark:text-[#00FF88] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] outline-none transition-all placeholder:text-[#8A8A99] dark:placeholder:text-[#556783]"
              />
            </div>

            {/* Casillero 2: Cantidad */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-black uppercase text-[#8A8A99] dark:text-[#8E9DBA] tracking-wider block">
                Cantidad *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#FAF7F2] dark:bg-[#0C101D] border border-[#E5E0D8] dark:border-[#223050] rounded-2xl px-3.5 py-2.5 text-xs font-bold font-mono-numbers text-[#1E1E2D] dark:text-[#00FF88] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] outline-none transition-all"
              />
            </div>

            {/* Casillero 3: UN SOLO CASILLERO DE UNIDAD CON AUTOCOMPLETADO */}
            <div className="md:col-span-4 space-y-1 relative">
              <label className="text-[10px] font-black uppercase text-[#8A8A99] dark:text-[#8E9DBA] tracking-wider block">
                Unidad de Medida (digita para sugerir) *
              </label>
              <div className="relative">
                <input
                  ref={unitInputRef}
                  type="text"
                  value={unitInput}
                  onChange={(e) => {
                    setUnitInput(e.target.value);
                    setIsUnitSuggestionsOpen(true);
                  }}
                  onFocus={() => setIsUnitSuggestionsOpen(true)}
                  placeholder="kg, und, cabezas, tronco, paquete..."
                  className="w-full bg-[#FAF7F2] dark:bg-[#0C101D] border border-[#E5E0D8] dark:border-[#223050] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#1E1E2D] dark:text-[#00FF88] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsUnitSuggestionsOpen(!isUnitSuggestionsOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A99] hover:text-[#1E1E2D] dark:hover:text-[#00FF66]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Menú flotante con sugerencias de unidades al escribir */}
              {isUnitSuggestionsOpen && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-[#13182B] border border-[#E5E0D8] dark:border-[#223050] rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1.5 divide-y divide-gray-100 dark:divide-gray-800"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-[#8A8A99] dark:text-[#8E9DBA] uppercase">
                    Opciones sugeridas:
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {filteredUnitSuggestions.length > 0 ? (
                      filteredUnitSuggestions.map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => {
                            setUnitInput(unit);
                            setIsUnitSuggestionsOpen(false);
                          }}
                          className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                            unitInput.toLowerCase() === unit.toLowerCase()
                              ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black'
                              : 'hover:bg-[#FAF7F2] dark:hover:bg-[#1E263F] text-[#1E1E2D] dark:text-[#D1FFD7]'
                          }`}
                        >
                          <span>{unit}</span>
                          {unitInput.toLowerCase() === unit.toLowerCase() && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 px-2 py-1.5 text-xs text-[#8A8A99] italic">
                        Pulsa Enter para registrar como &quot;{unitInput}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fila 2: Categoría, Notas y Botón de Ingreso */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-black uppercase text-[#8A8A99] dark:text-[#8E9DBA] tracking-wider block">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-[#0C101D] border border-[#E5E0D8] dark:border-[#223050] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#1E1E2D] dark:text-[#00FF88] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-black uppercase text-[#8A8A99] dark:text-[#8E9DBA] tracking-wider block">
                Notas / Donante / Procedencia (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={origin === 'donado' ? 'Ej. Parroquia, Vecino, Huerto' : 'Ej. Mercado Central, Parada, Puesto 14'}
                className="w-full bg-[#FAF7F2] dark:bg-[#0C101D] border border-[#E5E0D8] dark:border-[#223050] rounded-2xl px-3.5 py-2.5 text-xs text-[#1E1E2D] dark:text-[#D1FFD7] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] outline-none placeholder:text-[#8A8A99] dark:placeholder:text-[#556783]"
              />
            </div>

            <div className="md:col-span-3 pt-2 sm:pt-4">
              <button
                type="submit"
                className="w-full bg-[#FF6B2C] dark:bg-[#00FF66] hover:bg-[#FA5A2A] dark:hover:bg-[#00CC55] text-white dark:text-black py-2.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ingresar al Almacén</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* PESTAÑAS: INVENTARIO ACTUAL vs HISTORIAL DE MOVIMIENTOS */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#F0E6D8] dark:border-[#1E2840] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventario'
                ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black shadow-xs'
                : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:bg-[#FAF7F2] dark:hover:bg-[#13182B]'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Existencias Actuales ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'historial'
                ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black shadow-xs'
                : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:bg-[#FAF7F2] dark:hover:bg-[#13182B]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial Completo ({history.length})</span>
          </button>
        </div>

        {/* Botón rápido de exportación a Excel */}
        <button
          onClick={onExportExcel}
          className="text-xs font-bold text-[#107C41] dark:text-[#00FF66] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Exportar Historial Completo a Excel (.xlsx)</span>
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑA: INVENTARIO */}
      {activeTab === 'inventario' && (
        <div className="space-y-4">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="bg-white dark:bg-[#111526] rounded-[24px] p-4 border border-[#F0E6D8] dark:border-[#1E2840] shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A99] dark:text-[#8E9DBA]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar insumo por nombre, unidad o notas..."
                className="w-full bg-[#FAF7F2] dark:bg-[#0C101D] pl-10 pr-4 py-2 rounded-xl border border-[#E5E0D8] dark:border-[#223050] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] text-xs text-[#1E1E2D] dark:text-[#D1FFD7] outline-none"
              />
            </div>

            {/* Filtro por Origen */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#0C101D] p-1 rounded-xl border border-[#E5E0D8] dark:border-[#223050] text-xs font-bold">
              <button
                onClick={() => setFilterOrigin('todos')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterOrigin === 'todos'
                    ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black'
                    : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#1E1E2D]'
                }`}
              >
                Todos ({items.length})
              </button>
              <button
                onClick={() => setFilterOrigin('comprado')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterOrigin === 'comprado'
                    ? 'bg-[#FF6B2C] dark:bg-[#FF8800] text-white dark:text-black'
                    : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#1E1E2D]'
                }`}
              >
                🛒 Comprados ({boughtCount})
              </button>
              <button
                onClick={() => setFilterOrigin('donado')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterOrigin === 'donado'
                    ? 'bg-[#7E22CE] dark:bg-[#D946EF] text-white'
                    : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#7E22CE]'
                }`}
              >
                🎁 Donados ({donatedCount})
              </button>
            </div>

            {/* Filtro por Categoría */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#8A8A99] dark:text-[#8E9DBA]" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#FAF7F2] dark:bg-[#0C101D] border border-[#E5E0D8] dark:border-[#223050] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1E1E2D] dark:text-[#00FF88] outline-none"
              >
                <option value="Todos">Todas las categorías</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLA PRINCIPAL DE EXISTENCIAS */}
          {filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-[#111526] rounded-[28px] p-12 text-center border border-[#F0E6D8] dark:border-[#1E2840] space-y-3">
              <div className="w-16 h-16 bg-[#FAF7F2] dark:bg-[#13182B] rounded-full flex items-center justify-center mx-auto text-[#8A8A99] dark:text-[#00FF66]">
                <Warehouse className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[#1E1E2D] dark:text-[#00FF66]">
                No hay insumos registrados con los filtros seleccionados
              </h4>
              <p className="text-xs text-[#8A8A99] dark:text-[#8E9DBA] max-w-sm mx-auto">
                Usa el casillero superior para registrar alimentos o presiona el botón para descargar el Excel.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111526] rounded-[28px] border border-[#F0E6D8] dark:border-[#1E2840] shadow-sm overflow-hidden print-card transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[720px]">
                  <thead>
                    <tr className="bg-[#FAF7F2] dark:bg-[#0B0E1A] border-b border-[#EFE8DD] dark:border-[#1E2840] text-[10px] font-black uppercase tracking-wider text-[#8A8A99] dark:text-[#8E9DBA]">
                      <th className="p-4 w-12 text-center">Tipo (Clic cambia)</th>
                      <th className="p-4">Insumo / Alimento</th>
                      <th className="p-4">Categoría (Clic cambia)</th>
                      <th className="p-4 w-44 text-center">Cantidad en Stock</th>
                      <th className="p-4">Unidad</th>
                      <th className="p-4">Notas / Procedencia</th>
                      <th className="p-4 w-16 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5FA] dark:divide-[#182035]">
                    {filteredItems.map((item) => {
                      const isDonated = item.origin === 'donado';
                      const isEditingCategory = editingCategoryItemId === item.id;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-[#FAF7F2]/60 dark:hover:bg-[#161D32] transition-colors ${
                            isDonated ? 'bg-[#FAF5FF]/30 dark:bg-[#201530]/20' : ''
                          }`}
                        >
                          {/* Columna 1: Tipo con toggle interactivo COMPRADO <-> DONADO */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                onToggleItemOrigin(item.id);
                                showToast(
                                  `Insumo "${item.name}" cambiado a ${
                                    item.origin === 'comprado' ? 'DONADO 🎁' : 'COMPRADO 🛒'
                                  }`
                                );
                              }}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-2xs ${
                                isDonated
                                  ? 'bg-[#F3E8FF] dark:bg-[#3B1754] text-[#6B21A8] dark:text-[#E9D5FF] hover:bg-[#E9D5FF] border border-[#D8B4FE] dark:border-[#9333EA]'
                                  : 'bg-[#FFF0E6] dark:bg-[#3D1E0B] text-[#FF6B2C] dark:text-[#FFAE68] hover:bg-[#FFE0CC] border border-[#FFD2B3] dark:border-[#FF7700]'
                              }`}
                              title="Toca para cambiar entre Comprado y Donado (queda registrado)"
                            >
                              {isDonated ? (
                                <>
                                  <Gift className="w-3 h-3 text-[#9333EA] dark:text-[#D946EF]" />
                                  <span>Donado</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3 text-[#FF6B2C]" />
                                  <span>Comprado</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Columna 2: Nombre del Alimento */}
                          <td className="p-4 font-bold text-sm text-[#1E1E2D] dark:text-[#00FF88]">
                            <span>{item.name}</span>
                            <span className="block text-[10px] text-[#8A8A99] dark:text-[#8E9DBA] font-normal">
                              Registrado: {item.dateAdded}
                            </span>
                          </td>

                          {/* Columna 3: Categoría con cambio al hacer clic */}
                          <td className="p-4 text-xs">
                            {isEditingCategory ? (
                              <div className="flex items-center gap-1">
                                <select
                                  autoFocus
                                  value={item.category || 'Víveres'}
                                  onChange={(e) => {
                                    onUpdateItemCategory(item.id, e.target.value);
                                    setEditingCategoryItemId(null);
                                    showToast(`Categoría de "${item.name}" cambiada a "${e.target.value}"`);
                                  }}
                                  onBlur={() => setEditingCategoryItemId(null)}
                                  className="bg-white dark:bg-[#0C101D] border border-[#FF6B2C] dark:border-[#00FF66] rounded-lg px-2 py-1 text-xs font-bold text-[#1E1E2D] dark:text-[#00FF88] outline-none shadow-sm"
                                >
                                  {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingCategoryItemId(item.id)}
                                className="bg-[#FAF7F2] dark:bg-[#0C101D] hover:bg-[#EFE8DD] dark:hover:bg-[#1C263F] border border-[#E5E0D8] dark:border-[#223050] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#8A8A99] dark:text-[#00FF88] transition-all cursor-pointer flex items-center gap-1 group"
                                title="Haz clic para cambiar la categoría de este insumo"
                              >
                                <span>{item.category || 'Víveres'}</span>
                                <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                              </button>
                            )}
                          </td>

                          {/* Columna 4: Cantidad Editable */}
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onUpdateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                                className="w-7 h-7 bg-[#FAF7F2] dark:bg-[#13182B] hover:bg-[#EBEBF2] dark:hover:bg-[#1E263F] text-[#1E1E2D] dark:text-[#00FF66] font-bold rounded-lg flex items-center justify-center cursor-pointer transition-colors border border-[#E5E0D8] dark:border-[#202A44]"
                                title="Disminuir 1"
                              >
                                -
                              </button>

                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  onUpdateItemQuantity(item.id, val);
                                }}
                                className="w-20 text-center py-1.5 px-2 bg-white dark:bg-[#0C101D] border border-[#E5E0D8] dark:border-[#223050] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] rounded-xl text-xs font-black font-mono-numbers text-[#1E1E2D] dark:text-[#00FF88] outline-none"
                              />

                              <button
                                type="button"
                                onClick={() => onUpdateItemQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 bg-[#FAF7F2] dark:bg-[#13182B] hover:bg-[#EBEBF2] dark:hover:bg-[#1E263F] text-[#1E1E2D] dark:text-[#00FF66] font-bold rounded-lg flex items-center justify-center cursor-pointer transition-colors border border-[#E5E0D8] dark:border-[#202A44]"
                                title="Aumentar 1"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Columna 5: Unidad de Medida */}
                          <td className="p-4 text-xs font-bold text-[#1E1E2D] dark:text-[#D1FFD7]">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => onUpdateItemUnit(item.id, e.target.value)}
                              className="w-24 bg-transparent hover:bg-white dark:hover:bg-[#0C101D] border border-transparent hover:border-[#E5E0D8] dark:hover:border-[#223050] focus:border-[#FF6B2C] dark:focus:border-[#00FF66] rounded-lg px-2 py-1 text-xs font-bold text-[#1E1E2D] dark:text-[#00FF88] outline-none transition-colors"
                              title="Toca para editar la unidad directamente"
                            />
                          </td>

                          {/* Columna 6: Notas / Procedencia */}
                          <td className="p-4 text-xs text-[#8A8A99] dark:text-[#8E9DBA]">
                            {item.notes ? (
                              <span className="italic">{item.notes}</span>
                            ) : (
                              <span className="text-[#D1D1DB] dark:text-[#414E68]">—</span>
                            )}
                          </td>

                          {/* Columna 7: Acción Eliminar */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Retirar "${item.name}" del almacén?`)) {
                                  onRemoveItem(item.id);
                                  showToast('Insumo retirado del almacén');
                                }
                              }}
                              className="text-[#8A8A99] hover:text-[#DC2626] dark:hover:text-[#FF3366] p-1.5 rounded-xl transition-colors cursor-pointer"
                              title="Eliminar insumo del almacén"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resumen inferior de métricas acumuladas */}
          <div className="bg-[#FAF7F2] dark:bg-[#0B0E1A] rounded-2xl p-4 border border-[#EFE8DD] dark:border-[#1E2840] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8A8A99] dark:text-[#8E9DBA]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-[#1E1E2D] dark:text-[#00FF66]">Totales en Almacén:</span>
              {totalKg > 0 && (
                <span className="bg-white dark:bg-[#13182B] px-3 py-1 rounded-full border border-[#E5E0D8] dark:border-[#202A44] font-mono-numbers font-bold text-[#1E1E2D] dark:text-[#00FF88]">
                  ⚖️ {totalKg.toFixed(2)} kg
                </span>
              )}
              {totalUnd > 0 && (
                <span className="bg-white dark:bg-[#13182B] px-3 py-1 rounded-full border border-[#E5E0D8] dark:border-[#202A44] font-mono-numbers font-bold text-[#1E1E2D] dark:text-[#00FF88]">
                  🔢 {totalUnd} und
                </span>
              )}
              <span className="bg-white dark:bg-[#13182B] px-3 py-1 rounded-full border border-[#E5E0D8] dark:border-[#202A44] font-mono-numbers font-bold text-[#1E1E2D] dark:text-[#00FF88]">
                📦 {items.length} ítems registrados
              </span>
            </div>

            <span className="text-[11px]">
              💡 Haz clic sobre el tipo para alternar 🛒 Comprado / 🎁 Donado o sobre la categoría para cambiarla al instante.
            </span>
          </div>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA: HISTORIAL COMPLETO */}
      {activeTab === 'historial' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111526] rounded-[24px] p-5 border border-[#F0E6D8] dark:border-[#1E2840] shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#F0E6D8] dark:border-[#1E2840] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#107C41] dark:text-[#00FF66]" />
                <div>
                  <h3 className="text-sm font-black text-[#1E1E2D] dark:text-[#00FF66] uppercase tracking-wider">
                    Historial de Compras y Movimientos (Auditoría IndexedDB)
                  </h3>
                  <p className="text-[11px] text-[#8A8A99] dark:text-[#8E9DBA]">
                    Cada ingreso, modificación de cantidad, cambio de Comprado a Donado o cambio de categoría queda registrado.
                  </p>
                </div>
              </div>

              <button
                onClick={onExportExcel}
                className="bg-[#107C41] hover:bg-[#0b5c30] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Descargar Historial Excel</span>
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-[#8A8A99]">
                <History className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">No hay registros aún en el historial.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="bg-[#FAF7F2] dark:bg-[#0B0E1A] border-b border-[#EFE8DD] dark:border-[#1E2840] text-[10px] font-black uppercase tracking-wider text-[#8A8A99] dark:text-[#8E9DBA]">
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">Acción</th>
                      <th className="p-3">Insumo</th>
                      <th className="p-3">Cantidad</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Detalle / Procedencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5FA] dark:divide-[#182035] text-xs">
                    {history.map((h) => {
                      const isDonated = h.origin === 'donado';
                      return (
                        <tr key={h.id} className="hover:bg-[#FAF7F2]/50 dark:hover:bg-[#161D32]">
                          <td className="p-3 font-mono-numbers text-[#8A8A99] dark:text-[#8E9DBA]">
                            {h.dateStr}
                          </td>
                          <td className="p-3">
                            <span className="bg-[#FAF7F2] dark:bg-[#13182B] border border-[#E5E0D8] dark:border-[#202A44] px-2 py-0.5 rounded text-[10px] font-bold text-[#1E1E2D] dark:text-[#00FF88]">
                              {h.action.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-[#1E1E2D] dark:text-[#00FF66]">
                            {h.name}
                          </td>
                          <td className="p-3 font-mono-numbers font-bold">
                            {h.quantity} {h.unit}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isDonated
                                  ? 'bg-[#F3E8FF] dark:bg-[#3B1754] text-[#6B21A8] dark:text-[#E9D5FF]'
                                  : 'bg-[#FFF0E6] dark:bg-[#3D1E0B] text-[#FF6B2C] dark:text-[#FFAE68]'
                              }`}
                            >
                              {isDonated ? 'Donado 🎁' : 'Comprado 🛒'}
                            </span>
                          </td>
                          <td className="p-3 text-[#8A8A99] dark:text-[#8E9DBA]">
                            {h.category}
                          </td>
                          <td className="p-3 text-[#8A8A99] dark:text-[#8E9DBA] italic">
                            {h.notes || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
