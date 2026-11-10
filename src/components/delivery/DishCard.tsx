'use client';

import React, { useState } from 'react';
import { Dish, MealMoment } from '@/types/dish';
import { DayOfWeek } from '@/types/menu';
import { DishIllustration } from '@/components/ui/DishIllustration';
import { Clock, Plus, Minus, Check, ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { formatQuantityWithUnit } from '@/lib/domain/unit-conversion';

interface DishCardProps {
  dish: Dish;
  targetDay: DayOfWeek;
  targetMoment: MealMoment;
  defaultQuantity: number;
  onAddDish: (dish: Dish, day: DayOfWeek, moment: MealMoment, quantity: number) => void;
  isAlreadyInWeek?: boolean;
}

export function DishCard({
  dish,
  targetDay,
  targetMoment,
  defaultQuantity,
  onAddDish,
  isAlreadyInWeek,
}: DishCardProps) {
  const [localQuantity, setLocalQuantity] = useState<number | null>(null);
  const [showAllIngredients, setShowAllIngredients] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Cantidad efectiva: si el usuario no ha modificado el contador de la tarjeta, toma defaultQuantity
  const currentQuantity = localQuantity !== null ? localQuantity : defaultQuantity;

  const handleAdd = () => {
    setIsAdding(true);
    onAddDish(dish, targetDay, targetMoment, currentQuantity);
    setTimeout(() => {
      setIsAdding(false);
    }, 400);
  };

  const visibleIngredients = showAllIngredients
    ? dish.ingredients
    : dish.ingredients.slice(0, 4);

  const hasMore = dish.ingredients.length > 4;
  const totalCardEstimatedPrice = (dish.priceRefPerPlate * currentQuantity).toFixed(2);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Encabezado e Imagen del Plato */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5EFE6]">
          <DishIllustration
            imageKey={dish.imageSvgKey}
            alt={dish.name}
            className="w-full h-full"
          />

          {/* Badge de Tiempo */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#FBBF24]" />
            <span>{dish.prepTimeMinutes} min</span>
          </div>

          {/* Badge de Ya en Semana si corresponde */}
          {isAlreadyInWeek && (
            <div className="absolute top-2.5 right-2.5 bg-[#15803D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Check className="w-3 h-3" />
              <span>En Menú</span>
            </div>
          )}

          {/* Tag de Categoría */}
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#9A3412] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E5E0D8]">
            {dish.category}
          </div>
        </div>

        {/* Información del Plato */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif-gastronomy text-base font-bold text-[#1F2937] leading-snug group-hover:text-[#C2410C] transition-colors">
              {dish.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="font-mono-numbers text-xs font-semibold text-[#D97706] block">
                S/ {dish.priceRefPerPlate.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#9CA3AF] block -mt-0.5">por plato</span>
            </div>
          </div>

          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
            {dish.description}
          </p>

          {/* SECCIÓN OBLIGATORIA: Ingredientes calculados para 1 plato */}
          <div className="bg-[#FAF7F2] rounded-xl p-2.5 border border-[#EFE8DD] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#78350F]">
              <span className="flex items-center gap-1">
                <Utensils className="w-3 h-3 text-[#D97706]" />
                Insumos para 1 plato:
              </span>
              <span className="text-[10px] text-[#9CA3AF]">
                ({dish.ingredients.length} items)
              </span>
            </div>

            {/* Chips de ingredientes individuales con cantidades exactas para 1 plato */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {visibleIngredients.map((ing, idx) => {
                const formatted = formatQuantityWithUnit(ing.amountForOne, ing.unit);
                return (
                  <span
                    key={`${ing.ingredientId}-${idx}`}
                    className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#E5E0D8] text-[#374151]"
                  >
                    <span className="font-medium">{ing.ingredientName}:</span>
                    <span className="font-mono-numbers font-semibold text-[#C2410C]">
                      {formatted.displayText}
                    </span>
                  </span>
                );
              })}
            </div>

            {hasMore && (
              <button
                onClick={() => setShowAllIngredients(!showAllIngredients)}
                className="text-[10px] text-[#D97706] hover:text-[#9A3412] font-semibold flex items-center gap-0.5 pt-0.5 cursor-pointer"
              >
                {showAllIngredients ? (
                  <>
                    <span>Ver menos</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>+ {dish.ingredients.length - 4} insumos más</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controles de Acción Inferiores: Stepper y Botón Agregar */}
      <div className="p-3.5 pt-0 border-t border-[#F5EFE6] mt-1 space-y-2">
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span>Porciones a servir:</span>
          <span className="font-mono-numbers font-bold text-[#1F2937]">
            Total est.: S/ {totalCardEstimatedPrice}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stepper contador + / - */}
          <div className="flex items-center bg-[#F5EFE6] rounded-xl border border-[#D5C5B2] p-0.5 shrink-0">
            <button
              onClick={() => setLocalQuantity(Math.max(1, currentQuantity - 1))}
              disabled={currentQuantity <= 1}
              className="p-1.5 text-[#1F2937] hover:bg-white rounded-lg disabled:opacity-30 transition-all cursor-pointer"
              aria-label="Disminuir plato"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-numbers font-bold text-xs text-[#1F2937] px-2 min-w-6 text-center">
              {currentQuantity}
            </span>
            <button
              onClick={() => setLocalQuantity(currentQuantity + 1)}
              className="p-1.5 text-[#1F2937] hover:bg-white rounded-lg transition-all cursor-pointer"
              aria-label="Aumentar plato"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botón Principal: Agregar a Día y Momento */}
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs text-white shadow-xs transition-all cursor-pointer ${
              isAdding
                ? 'bg-[#15803D] scale-95'
                : 'bg-[#C2410C] hover:bg-[#9A3412] active:scale-98'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>
                  Agregar a {targetDay.slice(0, 3)}. ({currentQuantity} {currentQuantity === 1 ? 'plato' : 'platos'})
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
