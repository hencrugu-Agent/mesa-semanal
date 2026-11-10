'use client';

import React, { useState } from 'react';
import { PlannedMeal } from '@/types/menu';
import { ExtraPurchasedItem } from '@/types/purchase';
import { totalizePlannedIngredients } from '@/lib/domain/totalizer';
import { useToast } from '@/components/ui/Toast';
import {
  ShoppingCart,
  Share2,
  Printer,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ArrowRight,
  Calendar,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AccumulatedShoppingViewProps {
  meals: PlannedMeal[];
  extraPurchases: ExtraPurchasedItem[];
  purchasedAmounts: Record<string, number>;
  onUpdatePurchasedAmount: (ingredientId: string, amount: number, itemInfo?: { name: string; unit: string; category: string }) => void;
  onAddExtraPurchase: (item: Omit<ExtraPurchasedItem, 'id'>) => void;
  onRemoveExtraPurchase: (id: string) => void;
  onToggleExtraPurchased: (id: string) => void;
  onClearWeek: () => void;
  onGoToCatalog: () => void;
  onGoToDiagram: () => void;
  currencySymbol?: string;
}

const COMMON_UNITS = ['g', 'kg', 'ml', 'L', 'und', 'atado', 'lata', 'taza', 'cda', 'paquete'];
const COMMON_CATEGORIES = [
  'Víveres',
  'Verduras',
  'Frutas',
  'Carnes y Aves',
  'Pescados y Mariscos',
  'Lácteos y Huevos',
  'Especias y Condimentos',
  'Otros',
];

export function AccumulatedShoppingView({
  meals,
  extraPurchases,
  purchasedAmounts,
  onUpdatePurchasedAmount,
  onAddExtraPurchase,
  onRemoveExtraPurchase,
  onToggleExtraPurchased,
  onClearWeek,
  onGoToCatalog,
  onGoToDiagram,
  currencySymbol = 'S/',
}: AccumulatedShoppingViewProps) {
  const { showToast } = useToast();

  // Estado para el formulario de nuevo insumo no programado
  const [isAddingExtra, setIsAddingExtra] = useState<boolean>(false);
  const [extraName, setExtraName] = useState<string>('');
  const [extraQuantity, setExtraQuantity] = useState<string>('1');
  const [extraUnit, setExtraUnit] = useState<string>('und');
  const [extraCategory, setExtraCategory] = useState<string>('Víveres');
  const [extraCost, setExtraCost] = useState<string>('');

  // Totalizar ingredientes según los platos de la semana
  const plannedItems = totalizePlannedIngredients(meals, []);

  const totalEstimatedCost = plannedItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const extraTotalCost = extraPurchases.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const grandTotalEstimated = totalEstimatedCost + extraTotalCost;
  const totalPortions = meals.reduce((sum, m) => sum + m.plateCount, 0);

  // Agrupar por categoría
  const categoriesMap = new Map<string, typeof plannedItems>();
  for (const item of plannedItems) {
    if (!categoriesMap.has(item.category)) {
      categoriesMap.set(item.category, []);
    }
    categoriesMap.get(item.category)!.push(item);
  }

  // Progreso global de compras
  const totalPlannedCount = plannedItems.length;
  const completedPlannedCount = plannedItems.filter(
    (item) => (purchasedAmounts[item.ingredientId] || 0) >= item.neededAmount
  ).length;

  const handleQuickComplete = (item: typeof plannedItems[0]) => {
    onUpdatePurchasedAmount(item.ingredientId, item.neededAmount, {
      name: item.name,
      unit: item.unit,
      category: item.category,
    });
    showToast(`"${item.name}" marcado como comprado y sumado al Almacén`);
  };

  const handleQuickClear = (ingredientId: string) => {
    onUpdatePurchasedAmount(ingredientId, 0);
  };

  const handleMarkAllAsPurchased = () => {
    plannedItems.forEach((item) => {
      onUpdatePurchasedAmount(item.ingredientId, item.neededAmount, {
        name: item.name,
        unit: item.unit,
        category: item.category,
      });
    });
    showToast('¡Todos los ingredientes comprados se sumaron al Almacén!');
  };

  const handleResetPurchased = () => {
    if (window.confirm('¿Reiniciar las cantidades compradas a cero?')) {
      plannedItems.forEach((item) => {
        onUpdatePurchasedAmount(item.ingredientId, 0);
      });
      showToast('Cantidades compradas reiniciadas');
    }
  };

  const handleSaveExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraName.trim()) {
      showToast('Escribe el nombre del ingrediente', 'error');
      return;
    }

    const qty = parseFloat(extraQuantity) || 1;
    const cost = parseFloat(extraCost) || 0;

    onAddExtraPurchase({
      name: extraName.trim(),
      quantity: qty,
      unit: extraUnit,
      category: extraCategory,
      estimatedCost: cost,
      isPurchased: true,
    });

    setExtraName('');
    setExtraQuantity('1');
    setExtraCost('');
    setIsAddingExtra(false);
    showToast(`¡"${extraName.trim()}" agregado a las compras!`);
  };

  const handleCopyWhatsApp = () => {
    let text = `🛒 *MESA SEMANAL — LISTA DE COMPRAS Y CONTROL*\n`;
    text += `🍲 Platos: ${meals.length} comidas (${totalPortions} porciones)\n`;
    text += `💰 Presupuesto estimado: ${currencySymbol} ${grandTotalEstimated.toFixed(2)}\n`;
    text += `📊 Progreso de compras: ${completedPlannedCount}/${totalPlannedCount} insumos completados\n\n`;

    categoriesMap.forEach((items, category) => {
      text += `📍 *${category.toUpperCase()}*\n`;
      items.forEach((item) => {
        const purchased = purchasedAmounts[item.ingredientId] || 0;
        let status = '⚪ Pendiente';
        if (purchased >= item.neededAmount) {
          status = '✅ Comprado';
        } else if (purchased > 0) {
          status = `⚠️ Comprado: ${purchased} ${item.unit} (Falta ${item.neededAmount - purchased} ${item.unit})`;
        }
        text += `• ${item.name}: Requerido ${item.displayNeeded} — ${status}\n`;
      });
      text += `\n`;
    });

    if (extraPurchases.length > 0) {
      text += `🟣 *INSUMOS EXTRAS ADQUIRIDOS (NO PROGRAMADOS)*\n`;
      extraPurchases.forEach((extra) => {
        const check = extra.isPurchased ? '✅' : '▫️';
        const costStr = extra.estimatedCost ? ` (${currencySymbol} ${extra.estimatedCost.toFixed(2)})` : '';
        text += `${check} ${extra.name}: ${extra.quantity} ${extra.unit}${costStr}\n`;
      });
      text += `\n`;
    }

    text += `_Generado con Mesa Semanal — Mercado Criollo_`;

    navigator.clipboard.writeText(text);
    showToast('¡Lista completa copiada para WhatsApp!');
  };

  const handlePrint = () => {
    window.print();
  };

  if (meals.length === 0 && extraPurchases.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-[#FFF0E6] rounded-full flex items-center justify-center mx-auto text-[#FF6B2C]">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-[#1E1E2D]">
          Aún no has seleccionado platos para la semana
        </h3>
        <p className="text-xs text-[#8A8A99] max-w-sm mx-auto leading-relaxed">
          Ingresa al catálogo de platos y asígnalos a los días de la semana. Aquí se totalizarán automáticamente todos los insumos y podrás registrar lo comprado.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onGoToCatalog}
            className="bg-[#FF6B2C] hover:bg-[#FA5A2A] text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Ver Catálogo de Platos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onGoToDiagram}
            className="bg-[#1E1E2D] hover:bg-black text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#FF6B2C]" />
            <span>Ver Diagrama Semanal</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-6 pb-28 space-y-4 pt-2">
      {/* Resumen Superior */}
      <div className="bg-white rounded-[28px] p-5 border border-[#F0E6D8] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B2C] bg-[#FFF0E6] px-2.5 py-0.5 rounded-full">
              Módulo de Acumulados y Compras
            </span>
            <span className="text-xs text-[#8A8A99] font-mono-numbers">
              {completedPlannedCount} de {totalPlannedCount} comprados
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#1E1E2D] tracking-tight mt-1">
            Total a Comprar & Control de Insumos
          </h2>
          <p className="text-xs text-[#8A8A99] mt-0.5">
            {meals.length} platos · {totalPortions} porciones · {plannedItems.length} insumos requeridos
            {extraPurchases.length > 0 && ` · ${extraPurchases.length} extras`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#8A8A99] uppercase block font-medium">
              Gasto Estimado
            </span>
            <span className="text-xl font-black font-mono-numbers text-[#1E1E2D]">
              {currencySymbol} {grandTotalEstimated.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Copiar lista para WhatsApp"
              aria-label="Copiar lista para WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#1E1E2D] hover:bg-black text-white p-2.5 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Imprimir lista"
              aria-label="Imprimir lista"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Acciones Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EFE8DD]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingExtra(!isAddingExtra)}
            className="flex items-center gap-1.5 bg-[#FF6B2C] hover:bg-[#FA5A2A] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Agregar Insumo No Programado (Extra)</span>
          </button>

          <button
            onClick={handleMarkAllAsPurchased}
            className="hidden sm:flex items-center gap-1 bg-white hover:bg-[#F5F5FA] text-[#15803D] border border-[#BBF7D0] px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Marcar todo comprado</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={handleResetPurchased}
            className="text-[#8A8A99] hover:text-[#1E1E2D] font-medium transition-colors cursor-pointer"
          >
            Reiniciar compras
          </button>
          <span className="text-[#D1D1DB]">|</span>
          <button
            onClick={onClearWeek}
            className="text-[#DC2626] hover:underline font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Vaciar semana</span>
          </button>
        </div>
      </div>

      {/* Formulario Desplegable para Agregar Insumo Extra / No Programado */}
      {isAddingExtra && (
        <form
          onSubmit={handleSaveExtra}
          className="bg-white rounded-2xl p-4 border-2 border-[#FF6B2C] shadow-md space-y-3 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B2C]" />
              <h4 className="text-xs font-black text-[#1E1E2D] uppercase tracking-wider">
                Nuevo Insumo Extra (No Programado en el Menú)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingExtra(false)}
              className="text-[#8A8A99] hover:text-[#1E1E2D] text-xs font-bold"
            >
              Cerrar ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-[#8A8A99] uppercase">Nombre del Insumo</label>
              <input
                type="text"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                placeholder="Ej. Canela entera, Plátano bellaco, Detergente..."
                className="w-full bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1E1E2D] focus:border-[#FF6B2C] outline-none"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8A8A99] uppercase">Cantidad y Unidad</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={extraQuantity}
                  onChange={(e) => setExtraQuantity(e.target.value)}
                  className="w-20 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl px-2.5 py-2 text-xs font-bold text-[#1E1E2D] focus:border-[#FF6B2C] outline-none font-mono-numbers"
                />
                <select
                  value={extraUnit}
                  onChange={(e) => setExtraUnit(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl px-2 py-2 text-xs font-bold text-[#1E1E2D] focus:border-[#FF6B2C] outline-none flex-1"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8A8A99] uppercase">Precio / Costo ({currencySymbol})</label>
              <input
                type="number"
                step="any"
                min="0"
                value={extraCost}
                onChange={(e) => setExtraCost(e.target.value)}
                placeholder="0.00 (opcional)"
                className="w-full bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1E1E2D] focus:border-[#FF6B2C] outline-none font-mono-numbers"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#8A8A99] uppercase">Categoría:</span>
              <select
                value={extraCategory}
                onChange={(e) => setExtraCategory(e.target.value)}
                className="bg-[#FAF7F2] border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs font-medium text-[#1E1E2D] outline-none"
              >
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#FF6B2C] hover:bg-[#FA5A2A] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
            >
              Guardar Insumo Extra
            </button>
          </div>
        </form>
      )}

      {/* SECCIÓN DE INSUMOS EXTRAS (Si existen) */}
      {extraPurchases.length > 0 && (
        <div className="bg-[#FAF5FF] rounded-[24px] border border-[#E9D5FF] overflow-hidden shadow-xs">
          <div className="bg-[#F3E8FF] px-4 py-2.5 border-b border-[#E9D5FF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]" />
              <h4 className="text-xs font-black text-[#581C87] uppercase tracking-wider">
                Insumos Extras No Programados ({extraPurchases.length})
              </h4>
            </div>
            <span className="font-mono-numbers text-xs font-bold text-[#7E22CE]">
              Subtotal: {currencySymbol} {extraTotalCost.toFixed(2)}
            </span>
          </div>

          <div className="divide-y divide-[#F3E8FF]">
            {extraPurchases.map((extra) => (
              <div
                key={extra.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF5FF]/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleExtraPurchased(extra.id)}
                    className="cursor-pointer text-[#9333EA]"
                    title="Alternar comprado"
                  >
                    {extra.isPurchased ? (
                      <CheckCircle2 className="w-5 h-5 text-[#9333EA]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#C084FC]" />
                    )}
                  </button>

                  <div>
                    <span
                      className={`text-sm font-bold text-[#1E1E2D] ${
                        extra.isPurchased ? 'line-through text-[#8A8A99]' : ''
                      }`}
                    >
                      {extra.name}
                    </span>
                    <span className="inline-block ml-2 text-[10px] font-bold uppercase bg-[#E9D5FF] text-[#6B21A8] px-2 py-0.5 rounded-full">
                      {extra.category} · Extra
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono-numbers text-sm font-black text-[#1E1E2D] block">
                      {extra.quantity} {extra.unit}
                    </span>
                    {extra.estimatedCost ? (
                      <span className="font-mono-numbers text-[10px] text-[#8A8A99] block">
                        {currencySymbol} {extra.estimatedCost.toFixed(2)}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveExtraPurchase(extra.id)}
                    className="text-[#8A8A99] hover:text-[#DC2626] p-1 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar insumo extra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABLA PRINCIPAL DE INSUMOS TOTALIZADOS CON COLUMNA "COMPRADO" */}
      <div className="space-y-3">
        {Array.from(categoriesMap.entries()).map(([category, items]) => (
          <div
            key={category}
            className="bg-white rounded-[24px] border border-[#F0E6D8] overflow-hidden shadow-xs"
          >
            {/* Header de Categoría */}
            <div className="bg-[#FAF7F2] px-4 py-2.5 border-b border-[#EFE8DD] flex items-center justify-between">
              <h4 className="text-xs font-black text-[#1E1E2D] uppercase tracking-wider">
                {category} ({items.length})
              </h4>
              <span className="font-mono-numbers text-xs font-bold text-[#8A8A99]">
                Subtotal est.: {currencySymbol}{' '}
                {items.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}
              </span>
            </div>

            {/* Cabecera de columnas para pantallas medianas/grandes */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2 bg-[#FDFAF6] border-b border-[#F0E6D8] text-[10px] font-black uppercase tracking-wider text-[#8A8A99]">
              <div className="col-span-5">Ingrediente & Presentación</div>
              <div className="col-span-3 text-right">Cantidad Planificada</div>
              <div className="col-span-4 text-right">Comprado / Adquirido</div>
            </div>

            {/* Filas de Ingredientes */}
            <div className="divide-y divide-[#F5F5FA]">
              {items.map((item) => {
                const purchased = purchasedAmounts[item.ingredientId] || 0;
                const isComplete = purchased >= item.neededAmount;
                const isPartial = purchased > 0 && purchased < item.neededAmount;
                const diff = item.neededAmount - purchased;

                return (
                  <div
                    key={item.ingredientId}
                    className={`p-3.5 sm:grid sm:grid-cols-12 gap-3 items-center transition-colors ${
                      isComplete ? 'bg-[#F0FDF4]/50' : isPartial ? 'bg-[#FEFCE8]/40' : 'hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {/* Columna 1: Nombre y Presentación Comercial */}
                    <div className="sm:col-span-5 flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                        ) : isPartial ? (
                          <AlertCircle className="w-5 h-5 text-[#D97706]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#D1D1DB]" />
                        )}
                      </div>

                      <div>
                        <span
                          className={`text-sm font-bold text-[#1E1E2D] block ${
                            isComplete ? 'text-[#15803D]' : ''
                          }`}
                        >
                          {item.name}
                        </span>

                        {item.commercialRecommendation && (
                          <span className="text-[11px] text-[#FF6B2C] font-semibold block mt-0.5">
                            Sugerencia: {item.commercialRecommendation.packageCount} x{' '}
                            {item.commercialRecommendation.packageName}
                          </span>
                        )}

                        {/* Estado móvil */}
                        <div className="sm:hidden mt-1 flex items-center gap-2">
                          <span className="font-mono-numbers text-xs font-bold text-[#1E1E2D]">
                            Req: {item.displayNeeded}
                          </span>
                          {isComplete && (
                            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.2 rounded-full">
                              Completo
                            </span>
                          )}
                          {isPartial && (
                            <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.2 rounded-full">
                              Falta {diff} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Columna 2: Cantidad Planificada y Costo Estimado */}
                    <div className="hidden sm:block sm:col-span-3 text-right">
                      <span className="font-mono-numbers text-sm font-black text-[#1E1E2D] block">
                        {item.displayNeeded}
                      </span>
                      <span className="font-mono-numbers text-[10px] text-[#8A8A99] block">
                        est. {currencySymbol} {item.estimatedCost.toFixed(2)}
                      </span>
                    </div>

                    {/* Columna 3: Input de Comprado + Botón Rápido */}
                    <div className="sm:col-span-4 mt-2 sm:mt-0 flex items-center justify-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={purchased === 0 ? '' : purchased}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            onUpdatePurchasedAmount(item.ingredientId, val, {
                              name: item.name,
                              unit: item.unit,
                              category: item.category,
                            });
                          }}
                          className={`w-20 sm:w-24 px-2.5 py-1.5 rounded-xl border text-xs font-bold font-mono-numbers text-right outline-none transition-all ${
                            isComplete
                              ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                              : isPartial
                              ? 'bg-[#FEF3C7] border-[#FDE047] text-[#92400E]'
                              : 'bg-[#FAF7F2] border-[#E5E0D8] text-[#1E1E2D] focus:border-[#FF6B2C]'
                          }`}
                        />
                        <span className="text-xs font-bold text-[#8A8A99] w-7">
                          {item.unit}
                        </span>
                      </div>

                      {/* Botón rápido "Completar todo" */}
                      {!isComplete ? (
                        <button
                          type="button"
                          onClick={() => handleQuickComplete(item)}
                          className="bg-[#15803D] hover:bg-[#166534] text-white p-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-2xs"
                          title="Marcar cantidad exacta requerida y sumar al almacén"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickClear(item.ingredientId)}
                          className="text-[#8A8A99] hover:text-[#DC2626] p-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                          title="Reiniciar a 0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
