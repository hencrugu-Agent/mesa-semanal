'use client';

import React, { useState } from 'react';
import { PlannedMeal, DayOfWeek } from '@/types/menu';
import { MealMoment } from '@/types/dish';
import { DishIllustration } from '@/components/ui/DishIllustration';
import {
  Calendar,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface WeeklyBoardProps {
  meals: PlannedMeal[];
  onUpdatePlateCount: (mealId: string, count: number) => void;
  onDeleteMeal: (mealId: string) => void;
  onToggleStatus: (mealId: string, status: 'planificado' | 'preparado' | 'cancelado') => void;
  onGoToCatalog: (day: DayOfWeek, moment: MealMoment) => void;
  onGoToShopping: () => void;
  onClearWeek: () => void;
  currencySymbol?: string;
}

const DAYS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'lunes', label: 'Lunes', short: 'Lun' },
  { id: 'martes', label: 'Martes', short: 'Mar' },
  { id: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { id: 'jueves', label: 'Jueves', short: 'Jue' },
  { id: 'viernes', label: 'Viernes', short: 'Vie' },
  { id: 'sabado', label: 'Sábado', short: 'Sáb' },
  { id: 'domingo', label: 'Domingo', short: 'Dom' },
];

const MOMENTS: { id: MealMoment; label: string; emoji: string }[] = [
  { id: 'desayuno', label: 'Desayuno', emoji: '🌅' },
  { id: 'media_manana', label: 'Media Mañana', emoji: '🍎' },
  { id: 'almuerzo', label: 'Almuerzo', emoji: '🍲' },
  { id: 'media_tarde', label: 'Media Tarde', emoji: '☕' },
  { id: 'cena', label: 'Cena', emoji: '🌙' },
];

export function WeeklyBoard({
  meals,
  onUpdatePlateCount,
  onDeleteMeal,
  onToggleStatus,
  onGoToCatalog,
  onGoToShopping,
  onClearWeek,
  currencySymbol = 'S/',
}: WeeklyBoardProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>('lunes');

  // Calcular totales
  const totalWeeklyCost = meals.reduce(
    (sum, m) => sum + (m.status !== 'cancelado' ? m.dish.priceRefPerPlate * m.plateCount : 0),
    0
  );

  const totalMealsCount = meals.filter((m) => m.status !== 'cancelado').length;

  const getMealsForDayAndMoment = (day: DayOfWeek, moment: MealMoment) => {
    return meals.filter((m) => m.day === day && m.moment === moment);
  };

  const getDayCost = (day: DayOfWeek) => {
    return meals
      .filter((m) => m.day === day && m.status !== 'cancelado')
      .reduce((sum, m) => sum + m.dish.priceRefPerPlate * m.plateCount, 0);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-3 md:px-6 pb-24">
      {/* Barra de Resumen Semanal Superior */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-gastronomy text-xl font-bold text-[#1F2937]">
              Plan Semanal Gráfico
            </h2>
            <span className="bg-[#FEF3C7] text-[#B45309] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
              {totalMealsCount} comidas agendadas
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Organiza tus 7 días y 5 momentos del día. Los platos agregados alimentan tu lista de compras automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#9CA3AF] block uppercase tracking-wide">
              Presupuesto Semanal
            </span>
            <span className="font-mono-numbers text-lg font-bold text-[#C2410C]">
              {currencySymbol} {totalWeeklyCost.toFixed(2)}
            </span>
          </div>

          <button
            onClick={onGoToShopping}
            className="flex items-center gap-1.5 bg-[#15803D] hover:bg-[#166534] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Ver Compras</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selector de Días de la Semana (Pestañas móviles y de escritorio) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#F5EFE6] p-1.5 rounded-2xl border border-[#E5E0D8]">
        {DAYS.map((d) => {
          const isSelected = activeDay === d.id;
          const dayCost = getDayCost(d.id);
          const dayMealsCount = meals.filter((m) => m.day === d.id).length;

          return (
            <button
              key={d.id}
              onClick={() => setActiveDay(d.id)}
              className={`flex-1 min-w-[75px] py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-[#1F2937] shadow-sm font-bold border border-[#D5C5B2]'
                  : 'text-[#4B5563] hover:bg-white/60 font-medium'
              }`}
            >
              <div className="text-xs">{d.label}</div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                {dayMealsCount > 0 ? (
                  <span className="font-mono-numbers text-[10px] text-[#C2410C] font-semibold">
                    {currencySymbol} {dayCost.toFixed(0)}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#9CA3AF]">Vacío</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenedor del Día Seleccionado con sus 5 Franjas de Momento */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D97706]" />
            <h3 className="font-serif-gastronomy text-lg font-bold text-[#1F2937] capitalize">
              {DAYS.find((d) => d.id === activeDay)?.label}
            </h3>
          </div>
          <span className="font-mono-numbers text-sm font-semibold text-[#6B7280]">
            Costo del día: <strong className="text-[#C2410C]">{currencySymbol} {getDayCost(activeDay).toFixed(2)}</strong>
          </span>
        </div>

        {/* Las 5 franjas horarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOMENTS.map((m) => {
            const momentMeals = getMealsForDayAndMoment(activeDay, m.id);

            return (
              <div
                key={m.id}
                className="bg-[#FAF7F2] rounded-xl p-3 border border-[#EFE8DD] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#78350F] flex items-center gap-1.5">
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </span>
                    <button
                      onClick={() => onGoToCatalog(activeDay, m.id)}
                      className="text-[11px] font-semibold text-[#D97706] hover:text-[#9A3412] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar</span>
                    </button>
                  </div>

                  {/* Lista de platos en este momento */}
                  {momentMeals.length === 0 ? (
                    <div
                      onClick={() => onGoToCatalog(activeDay, m.id)}
                      className="border border-dashed border-[#D5C5B2] rounded-xl p-4 text-center cursor-pointer hover:bg-white/80 transition-colors"
                    >
                      <p className="text-xs text-[#9CA3AF]">
                        Sin plato asignado
                      </p>
                      <span className="text-[10px] text-[#D97706] font-semibold mt-1 inline-block">
                        + Elegir del catálogo
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {momentMeals.map((meal) => {
                        const isPrepared = meal.status === 'preparado';
                        const mealTotal = (meal.dish.priceRefPerPlate * meal.plateCount).toFixed(2);

                        return (
                          <div
                            key={meal.id}
                            className={`bg-white rounded-xl p-2.5 border transition-all ${
                              isPrepared
                                ? 'border-[#BBF7D0] bg-[#F0FDF4]/60'
                                : 'border-[#E5E0D8] shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Miniatura SVG */}
                              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#E5E0D8]">
                                <DishIllustration
                                  imageKey={meal.dish.imageSvgKey}
                                  alt={meal.dish.name}
                                  className="w-full h-full"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="font-serif-gastronomy text-xs font-bold text-[#1F2937] truncate">
                                    {meal.dish.name}
                                  </h4>
                                  <button
                                    onClick={() => onDeleteMeal(meal.id)}
                                    className="p-1 text-[#9CA3AF] hover:text-[#DC2626] rounded-md transition-colors"
                                    title="Quitar del menú"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-1">
                                  <span className="font-mono-numbers">
                                    {currencySymbol} {mealTotal}
                                  </span>
                                  <span className="text-[10px] text-[#9CA3AF]">
                                    ({currencySymbol} {meal.dish.priceRefPerPlate.toFixed(2)} c/u)
                                  </span>
                                </div>

                                {/* Controles de Porción y Estado */}
                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F5EFE6]">
                                  {/* Stepper de cantidad */}
                                  <div className="flex items-center gap-1 bg-[#F5EFE6] rounded-lg p-0.5">
                                    <button
                                      onClick={() => onUpdatePlateCount(meal.id, Math.max(1, meal.plateCount - 1))}
                                      disabled={meal.plateCount <= 1}
                                      className="p-1 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono-numbers font-bold text-xs px-1 text-[#1F2937]">
                                      {meal.plateCount} {meal.plateCount === 1 ? 'plato' : 'platos'}
                                    </span>
                                    <button
                                      onClick={() => onUpdatePlateCount(meal.id, meal.plateCount + 1)}
                                      className="p-1 hover:bg-white rounded cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Botón de estado Preparado */}
                                  <button
                                    onClick={() =>
                                      onToggleStatus(
                                        meal.id,
                                        isPrepared ? 'planificado' : 'preparado'
                                      )
                                    }
                                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isPrepared
                                        ? 'bg-[#15803D] text-white'
                                        : 'bg-[#F5EFE6] text-[#4B5563] hover:text-[#15803D]'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{isPrepared ? 'Preparado' : 'Marcar'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de Limpieza y Sugerencia */}
      <div className="flex items-center justify-between text-xs text-[#9CA3AF] px-1">
        <span>Consejo: Puedes arrastrar o planificar hasta 5 comidas al día para toda la semana.</span>
        {meals.length > 0 && (
          <button
            onClick={onClearWeek}
            className="text-[#DC2626] hover:underline font-semibold cursor-pointer"
          >
            Limpiar todo el menú de la semana
          </button>
        )}
      </div>
    </div>
  );
}
