'use client';

import React, { useState } from 'react';
import { PlannedMeal } from '@/types/menu';
import { ExecutedPurchase, StockItem } from '@/types/purchase';
import { Ingredient } from '@/types/ingredient';
import { totalizePlannedIngredients } from '@/lib/domain/totalizer';
import { detectPurchaseShortages } from '@/lib/domain/inventory';
import { useToast } from '@/components/ui/Toast';
import {
  ShoppingCart,
  Receipt,
  Package,
  Share2,
  Printer,
  CheckSquare,
  Square,
  AlertTriangle,
  Plus,
  Trash2,
  Store,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface ShoppingManagerProps {
  meals: PlannedMeal[];
  stock: StockItem[];
  executedPurchases: ExecutedPurchase[];
  ingredientsCatalog: Ingredient[];
  onAddExecutedPurchase: (purchase: ExecutedPurchase) => void;
  onDeleteExecutedPurchase: (purchaseId: string) => void;
  onUpdateStockItem: (item: StockItem) => void;
  currencySymbol?: string;
}

export function ShoppingManager({
  meals,
  stock,
  executedPurchases,
  ingredientsCatalog,
  onAddExecutedPurchase,
  onDeleteExecutedPurchase,
  onUpdateStockItem,
  currencySymbol = 'S/',
}: ShoppingManagerProps) {
  const [activeTab, setActiveTab] = useState<'planificadas' | 'ejecutadas' | 'stock'>('planificadas');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  // Formulario de nueva compra ejecutada
  const [newPurchaseIngId, setNewPurchaseIngId] = useState<string>('');
  const [newPurchaseAmount, setNewPurchaseAmount] = useState<string>('');
  const [newPurchasePrice, setNewPurchasePrice] = useState<string>('');
  const [newPurchaseLocation, setNewPurchaseLocation] = useState<string>('Mercado Central');
  const [isAddingPurchase, setIsAddingPurchase] = useState<boolean>(false);

  // Formulario de nuevo item en stock
  const [newStockIngId, setNewStockIngId] = useState<string>('');
  const [newStockAmount, setNewStockAmount] = useState<string>('');
  const [isAddingStock, setIsAddingStock] = useState<boolean>(false);

  // Cálculo de items planificados con deducción de stock
  const plannedItems = totalizePlannedIngredients(meals, stock, ingredientsCatalog);

  // Detección de faltantes
  const shortageAlerts = detectPurchaseShortages(plannedItems, executedPurchases);

  // Totales
  const totalEstimatedCost = plannedItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalExecutedCost = executedPurchases.reduce((sum, p) => sum + p.realPriceTotal, 0);

  // Agrupación por categoría para la lista de compras
  const categoriesMap = new Map<string, typeof plannedItems>();
  for (const item of plannedItems) {
    if (!categoriesMap.has(item.category)) {
      categoriesMap.set(item.category, []);
    }
    categoriesMap.get(item.category)!.push(item);
  }

  const toggleCheck = (ingredientId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [ingredientId]: !prev[ingredientId],
    }));
  };

  // Copiar lista formateada para WhatsApp
  const handleCopyWhatsApp = () => {
    let text = `🛒 *LISTA DE COMPRAS — MESA SEMANAL*\n`;
    text += `📅 Semana: ${meals.length} comidas planificadas\n`;
    text += `💰 Presupuesto estimado: ${currencySymbol} ${totalEstimatedCost.toFixed(2)}\n\n`;

    categoriesMap.forEach((items, category) => {
      const itemsToBuy = items.filter((i) => i.netToBuyAmount > 0);
      if (itemsToBuy.length === 0) return;

      text += `📍 *${category.toUpperCase()}*\n`;
      itemsToBuy.forEach((item) => {
        const isChecked = checkedItems[item.ingredientId];
        const checkIcon = isChecked ? '✅' : '▫️';
        const rec = item.commercialRecommendation ? ` (${item.commercialRecommendation.packageName})` : '';
        text += `${checkIcon} ${item.name}: ${item.displayNetToBuy}${rec}\n`;
      });
      text += `\n`;
    });

    text += `_Generado con Mesa Semanal — Mercado Criollo_`;

    navigator.clipboard.writeText(text);
    showToast('¡Lista copiada con formato para WhatsApp!');
  };

  // Imprimir lista con estilos @media print
  const handlePrint = () => {
    window.print();
  };

  // Manejador para registrar compra ejecutada
  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogItem = ingredientsCatalog.find((i) => i.id === newPurchaseIngId);
    if (!catalogItem || !newPurchaseAmount || !newPurchasePrice) {
      showToast('Por favor completa todos los campos de la compra', 'error');
      return;
    }

    const purchase: ExecutedPurchase = {
      id: `pur-${Date.now()}`,
      ingredientId: catalogItem.id,
      ingredientName: catalogItem.name,
      category: catalogItem.category,
      purchasedAmount: parseFloat(newPurchaseAmount),
      unit: catalogItem.baseUnit,
      realPriceTotal: parseFloat(newPurchasePrice),
      storeLocation: newPurchaseLocation || 'Mercado Local',
      purchaseDate: new Date().toISOString().slice(0, 10),
    };

    onAddExecutedPurchase(purchase);
    showToast(`Compra de ${catalogItem.name} registrada`);
    setNewPurchaseAmount('');
    setNewPurchasePrice('');
    setIsAddingPurchase(false);
  };

  // Manejador para registrar o actualizar stock
  const handleCreateStock = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogItem = ingredientsCatalog.find((i) => i.id === newStockIngId);
    if (!catalogItem || !newStockAmount) {
      showToast('Completa los datos del ingrediente en despensa', 'error');
      return;
    }

    const item: StockItem = {
      ingredientId: catalogItem.id,
      ingredientName: catalogItem.name,
      category: catalogItem.category,
      currentAmount: parseFloat(newStockAmount),
      unit: catalogItem.baseUnit,
      lastUpdated: new Date().toISOString(),
    };

    onUpdateStockItem(item);
    showToast(`Stock de ${catalogItem.name} actualizado`);
    setNewStockAmount('');
    setIsAddingStock(false);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-3 md:px-6 pb-24">
      {/* Alerta de Faltantes si se compró menos de lo planificado */}
      {shortageAlerts.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl p-3.5 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-[#991B1B]">
            <strong className="font-bold block text-sm">
              Alerta de Faltantes en Compras ({shortageAlerts.length} items incompletos)
            </strong>
            <p className="mt-0.5">
              Has comprado menos cantidad de lo que tu menú semanal requiere. Verifica:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {shortageAlerts.map((alt, idx) => (
                <span
                  key={idx}
                  className="bg-white px-2.5 py-1 rounded-md border border-[#FCA5A5] font-semibold text-[11px]"
                >
                  {alt.ingredientName}: falta {alt.missingAmount} {alt.unit}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pestañas de los 3 Pilares */}
      <div className="bg-white rounded-2xl p-2 border border-[#E5E0D8] shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('planificadas')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'planificadas'
              ? 'bg-[#1F2937] text-white shadow-xs'
              : 'text-[#4B5563] hover:bg-[#F5EFE6]'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-[#D97706]" />
          <span>1. Planificadas ({plannedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ejecutadas')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'ejecutadas'
              ? 'bg-[#1F2937] text-white shadow-xs'
              : 'text-[#4B5563] hover:bg-[#F5EFE6]'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#16A34A]" />
          <span>2. Ejecutadas ({executedPurchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-[#1F2937] text-white shadow-xs'
              : 'text-[#4B5563] hover:bg-[#F5EFE6]'
          }`}
        >
          <Package className="w-4 h-4 text-[#C2410C]" />
          <span>3. En Stock / Saldo ({stock.length})</span>
        </button>
      </div>

      {/* CONTENIDO 1: COMPRAS PLANIFICADAS */}
      {activeTab === 'planificadas' && (
        <div className="space-y-4">
          {/* Barra de Acciones de Lista de Compras */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-gastronomy text-lg font-bold text-[#1F2937]">
                Lista de Compras Exacta
              </h3>
              <p className="text-xs text-[#6B7280]">
                Cantidades consolidadas de los platos de la semana, descontando lo que ya tienes en despensa.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-right mr-2">
                <span className="text-[10px] text-[#9CA3AF] block uppercase">Total Estimado</span>
                <span className="font-mono-numbers text-base font-bold text-[#C2410C]">
                  {currencySymbol} {totalEstimatedCost.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCopyWhatsApp}
                className="flex items-center gap-1.5 bg-[#15803D] hover:bg-[#166534] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Copiar lista formateada para WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar WhatsApp</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-[#F5EFE6] hover:bg-[#EAE1D2] text-[#1F2937] border border-[#D5C5B2] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Imprimir lista de compras"
              >
                <Printer className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {plannedItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#E5E0D8] text-center space-y-2">
              <ShoppingCart className="w-10 h-10 text-[#D5C5B2] mx-auto" />
              <h4 className="font-serif-gastronomy text-base font-bold text-[#1F2937]">
                Tu lista de compras está vacía
              </h4>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                Agrega platos en la pantalla principal o planifica tu semana para que los ingredientes se totalicen aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(categoriesMap.entries()).map(([category, items]) => {
                const itemsToBuy = items.filter((i) => i.netToBuyAmount > 0);
                const itemsFullyCovered = items.filter((i) => i.netToBuyAmount <= 0);

                return (
                  <div
                    key={category}
                    className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-xs print-card"
                  >
                    {/* Encabezado del Pasillo / Categoría */}
                    <div className="bg-[#FAF7F2] px-4 py-2.5 border-b border-[#EFE8DD] flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#78350F] uppercase tracking-wider">
                        {category} ({itemsToBuy.length} por comprar)
                      </h4>
                      <span className="font-mono-numbers text-xs font-semibold text-[#6B7280]">
                        Subtotal est.: {currencySymbol}{' '}
                        {items.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Lista de Insumos a Comprar */}
                    <div className="divide-y divide-[#F5EFE6]">
                      {itemsToBuy.map((item) => {
                        const isChecked = !!checkedItems[item.ingredientId];

                        return (
                          <div
                            key={item.ingredientId}
                            onClick={() => toggleCheck(item.ingredientId)}
                            className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-[#F0FDF4]/60 line-through text-[#9CA3AF]'
                                : 'hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="text-[#15803D] shrink-0"
                                aria-label="Marcar como comprado"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-[#15803D]" />
                                ) : (
                                  <Square className="w-4 h-4 text-[#9CA3AF]" />
                                )}
                              </button>

                              <div>
                                <span className={`text-sm font-semibold text-[#1F2937] ${isChecked ? 'line-through text-[#9CA3AF]' : ''}`}>
                                  {item.name}
                                </span>

                                {item.coveredByStock > 0 && (
                                  <span className="ml-2 text-[11px] text-[#15803D] font-medium bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                                    Cubierto en despensa: {item.coveredByStock} {item.unit}
                                  </span>
                                )}

                                {item.commercialRecommendation && (
                                  <div className="text-[11px] text-[#B45309] font-medium mt-0.5">
                                    🛒 Sugerencia mercado: {item.commercialRecommendation.packageCount} x{' '}
                                    {item.commercialRecommendation.packageName}
                                    {item.commercialRecommendation.surplus > 0 && (
                                      <span className="text-[#6B7280]">
                                        {' '}(sobrante: {item.commercialRecommendation.surplus} {item.unit})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono-numbers text-sm font-bold text-[#C2410C] block">
                                {item.displayNetToBuy}
                              </span>
                              <span className="font-mono-numbers text-[11px] text-[#9CA3AF] block">
                                est. {currencySymbol} {item.estimatedCost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Insumos cubiertos al 100% por stock en despensa */}
                      {itemsFullyCovered.length > 0 && (
                        <div className="p-3 bg-[#F0FDF4]/40 border-t border-[#BBF7D0]/40">
                          <span className="text-xs font-semibold text-[#15803D] flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ya cubierto en despensa (No necesitas comprar):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {itemsFullyCovered.map((cov) => (
                              <span
                                key={cov.ingredientId}
                                className="bg-white px-2 py-0.5 rounded-md border border-[#BBF7D0] text-[11px] text-[#166534]"
                              >
                                {cov.name} (en stock: {cov.coveredByStock} {cov.unit})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 2: COMPRAS EJECUTADAS */}
      {activeTab === 'ejecutadas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-gastronomy text-lg font-bold text-[#1F2937]">
                Compras Ejecutadas en el Mercado
              </h3>
              <p className="text-xs text-[#6B7280]">
                Registra lo que realmente pesaste y pagaste en el puesto o bodega para controlar tu gasto real.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-[#9CA3AF] block uppercase">Gasto Real Total</span>
                <span className="font-mono-numbers text-base font-bold text-[#166534]">
                  {currencySymbol} {totalExecutedCost.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => setIsAddingPurchase(!isAddingPurchase)}
                className="flex items-center gap-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Compra</span>
              </button>
            </div>
          </div>

          {/* Formulario de registro de compra */}
          {isAddingPurchase && (
            <form
              onSubmit={handleCreatePurchase}
              className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EFE8DD] shadow-xs space-y-3 animate-in slide-in-from-top-2 duration-200"
            >
              <h4 className="text-xs font-bold text-[#78350F] uppercase">
                Nueva Compra Real de Mercado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Ingrediente */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                    Ingrediente / Insumo
                  </label>
                  <select
                    value={newPurchaseIngId}
                    onChange={(e) => setNewPurchaseIngId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 text-xs text-[#1F2937] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="">Selecciona insumo...</option>
                    {ingredientsCatalog.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.baseUnit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                    Cantidad Real Comprada
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newPurchaseAmount}
                    onChange={(e) => setNewPurchaseAmount(e.target.value)}
                    placeholder="Ej. 1000 para 1kg"
                    required
                    className="w-full bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 text-xs text-[#1F2937] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                {/* Precio Pagado */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                    Precio Total Pagado ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPurchasePrice}
                    onChange={(e) => setNewPurchasePrice(e.target.value)}
                    placeholder="Ej. 8.50"
                    required
                    className="w-full bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 text-xs text-[#1F2937] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                {/* Lugar de Compra */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                    Puesto / Lugar
                  </label>
                  <input
                    type="text"
                    value={newPurchaseLocation}
                    onChange={(e) => setNewPurchaseLocation(e.target.value)}
                    placeholder="Ej. Puesto Doña Mary"
                    className="w-full bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 text-xs text-[#1F2937] focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPurchase(false)}
                  className="px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#1F2937]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#15803D] hover:bg-[#166534] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Guardar en Ejecutadas
                </button>
              </div>
            </form>
          )}

          {/* Tabla de Compras Ejecutadas */}
          {executedPurchases.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#E5E0D8] text-center space-y-2">
              <Receipt className="w-10 h-10 text-[#D5C5B2] mx-auto" />
              <h4 className="font-serif-gastronomy text-base font-bold text-[#1F2937]">
                Aún no has registrado compras reales
              </h4>
              <p className="text-xs text-[#6B7280]">
                Usa el botón &quot;Registrar Compra&quot; en el mercado para llevar el control de tus boletas y desembolsos.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-xs">
              <div className="divide-y divide-[#F5EFE6]">
                {executedPurchases.map((pur) => (
                  <div
                    key={pur.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1F2937]">
                          {pur.ingredientName}
                        </span>
                        <span className="text-[10px] bg-[#F5EFE6] text-[#78350F] px-2 py-0.5 rounded-md font-semibold">
                          {pur.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3 text-[#9CA3AF]" />
                          {pur.storeLocation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#9CA3AF]" />
                          {pur.purchaseDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono-numbers text-sm font-bold text-[#166534] block">
                          {currencySymbol} {pur.realPriceTotal.toFixed(2)}
                        </span>
                        <span className="font-mono-numbers text-xs text-[#6B7280] block">
                          {pur.purchasedAmount} {pur.unit}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteExecutedPurchase(pur.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                        title="Eliminar compra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 3: EN STOCK / SALDO */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-gastronomy text-lg font-bold text-[#1F2937]">
                Despensa e Inventario en Stock
              </h3>
              <p className="text-xs text-[#6B7280]">
                Saldo actual en tu hogar. Se descuenta automáticamente al preparar platos o registrar mermas.
              </p>
            </div>

            <button
              onClick={() => setIsAddingStock(!isAddingStock)}
              className="flex items-center gap-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajustar Stock</span>
            </button>
          </div>

          {/* Formulario para agregar stock a despensa */}
          {isAddingStock && (
            <form
              onSubmit={handleCreateStock}
              className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EFE8DD] shadow-xs space-y-3"
            >
              <h4 className="text-xs font-bold text-[#78350F] uppercase">
                Agregar Insumo a la Despensa
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                    Ingrediente
                  </label>
                  <select
                    value={newStockIngId}
                    onChange={(e) => setNewStockIngId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 text-xs text-[#1F2937]"
                  >
                    <option value="">Selecciona...</option>
                    {ingredientsCatalog.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.baseUnit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                    Cantidad Disponible en Despensa
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newStockAmount}
                    onChange={(e) => setNewStockAmount(e.target.value)}
                    placeholder="Ej. 500"
                    required
                    className="w-full bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 text-xs text-[#1F2937]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingStock(false)}
                  className="px-3 py-1.5 text-xs text-[#6B7280]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#15803D] text-white px-4 py-1.5 rounded-xl text-xs font-bold"
                >
                  Guardar en Despensa
                </button>
              </div>
            </form>
          )}

          {/* Lista de Stock Actual */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-xs">
            <div className="divide-y divide-[#F5EFE6]">
              {stock.map((stk) => {
                const isLow = stk.currentAmount < (stk.minAlertThreshold || 50);

                return (
                  <div
                    key={stk.ingredientId}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1F2937]">
                          {stk.ingredientName}
                        </span>
                        <span className="text-[10px] bg-[#F5EFE6] text-[#78350F] px-2 py-0.5 rounded-md font-semibold">
                          {stk.category}
                        </span>
                        {isLow && (
                          <span className="text-[10px] bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded-md font-bold">
                            Stock Bajo
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#9CA3AF] block mt-0.5">
                        Actualizado: {stk.lastUpdated ? stk.lastUpdated.slice(0, 10) : 'Hoy'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono-numbers text-base font-bold text-[#1F2937] block">
                        {stk.currentAmount} {stk.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
