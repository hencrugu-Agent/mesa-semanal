'use client';

import React, { useState } from 'react';
import { Dish, MealMoment } from '@/types/dish';
import { DayOfWeek, PlannedMeal } from '@/types/menu';
import { DishIllustration } from '@/components/ui/DishIllustration';
import { Check, Calendar, AlertCircle } from 'lucide-react';

interface FoodDeliveryDishCardProps {
  dish: Dish;
  assignedMeals: PlannedMeal[];
  onAssignDish: (dish: Dish, day: DayOfWeek, moment: MealMoment, portions: number) => void;
  currencySymbol?: string;
}

const MOMENTS: { id: MealMoment; label: string }[] = [
  { id: 'desayuno', label: 'DESAYUNO' },
  { id: 'media_manana', label: 'MEDIA MAÑANA' },
  { id: 'almuerzo', label: 'ALMUERZO' },
  { id: 'media_tarde', label: 'MEDIA TARDE' },
  { id: 'cena', label: 'CENA' },
];

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'lunes', label: 'Lu' },
  { id: 'martes', label: 'Mar' },
  { id: 'miercoles', label: 'Mie' },
  { id: 'jueves', label: 'Jue' },
  { id: 'viernes', label: 'Vie' },
  { id: 'sabado', label: 'Sab' },
  { id: 'domingo', label: 'Dom' },
];

const PORTION_OPTIONS = [1, 2, 4, 6];

export function FoodDeliveryDishCard({
  dish,
  assignedMeals,
  onAssignDish,
  currencySymbol = 'S/',
}: FoodDeliveryDishCardProps) {
  const [selectedMoment, setSelectedMoment] = useState<MealMoment>('almuerzo');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lunes');
  const [portions, setPortions] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Verificar si la combinación seleccionada (Día + Momento) ya está ocupada
  const currentSlotMeal = assignedMeals.find(
    (m) => m.day === selectedDay && m.moment === selectedMoment
  );

  const isCurrentSlotOccupiedByThisDish = currentSlotMeal?.dishId === dish.id;
  const isCurrentSlotOccupiedByOtherDish =
    currentSlotMeal && currentSlotMeal.dishId !== dish.id;

  // Días en los que ESTE plato ya está asignado en el momento seleccionado
  const daysWhereThisDishIsAssigned = assignedMeals
    .filter((m) => m.dishId === dish.id && m.moment === selectedMoment)
    .map((m) => m.day);

  // Días donde el momento seleccionado ya está ocupado por CUALQUIER plato
  const daysOccupiedForMoment = assignedMeals
    .filter((m) => m.moment === selectedMoment)
    .map((m) => m.day);

  const handleAssign = () => {
    setIsSaved(true);
    onAssignDish(dish, selectedDay, selectedMoment, portions);
    setTimeout(() => {
      setIsSaved(false);
    }, 600);
  };

  const totalPrice = (dish.priceRefPerPlate * portions).toFixed(2);

  return (
    <div className="bg-white rounded-[32px] border border-[#F0E6D8] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between max-w-sm w-full mx-auto">
      {/* IMAGEN DEL PLATO */}
      <div className="relative bg-gradient-to-b from-[#FFAE68] to-[#FF9344] p-5 pb-6 rounded-b-[36px] shadow-inner flex flex-col items-center">
        <div className="w-48 h-36 relative flex items-center justify-center filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.18)]">
          <DishIllustration
            imageKey={dish.imageSvgKey}
            alt={dish.name}
            className="w-full h-full object-contain rounded-2xl bg-transparent"
          />
        </div>

        {/* Badge si este plato está programado en algún momento de la semana */}
        {daysWhereThisDishIsAssigned.length > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 text-[#15803D] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Check className="w-3 h-3 text-[#15803D]" />
            <span>En Diagrama ({daysWhereThisDishIsAssigned.length})</span>
          </div>
        )}
      </div>

      {/* CONTENIDO DEBAJO DE LA IMAGEN EN ORDEN ESTRICTO */}
      <div className="p-5 space-y-4">
        {/* PRIMERO: EL NOMBRE */}
        <div>
          <h3 className="text-xl font-black text-[#1E1E2D] tracking-tight leading-tight">
            {dish.name}
          </h3>
          <div className="flex items-center justify-between mt-1 text-xs text-[#8A8A99] font-medium">
            <span>{dish.category} · {dish.prepTimeMinutes} min</span>
            <span className="font-mono-numbers text-xs font-bold text-[#FF6B2C]">
              {currencySymbol} {dish.priceRefPerPlate.toFixed(2)} / plato
            </span>
          </div>
        </div>

        {/* SEGUNDO: LA DESCRIPCIÓN DE LA COMIDA */}
        <p className="text-xs text-[#8A8A99] leading-relaxed line-clamp-2">
          {dish.description || 'Receta tradicional casera'}
        </p>

        {/* TERCERO: BOTONES DE MOMENTOS (DESAYUNO, MEDIA MAÑANA, ALMUERZO, MEDIA TARDE, CENA) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#1E1E2D] block">
            MOMENTO DEL DÍA:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
            {MOMENTS.map((m) => {
              const isSelected = selectedMoment === m.id;
              const hasAssignment = assignedMeals.some(
                (meal) => meal.moment === m.id && meal.dishId === dish.id
              );

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMoment(m.id)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-[#1E1E2D] text-white shadow-xs font-black'
                      : hasAssignment
                      ? 'bg-[#FFF0E6] text-[#FF6B2C] border border-[#FF6B2C]/30 hover:bg-[#FFE0CC]'
                      : 'bg-[#F5F5FA] text-[#8A8A99] hover:bg-[#EBEBF2] hover:text-[#1E1E2D]'
                  }`}
                  title={m.label}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CUARTO: LOS DÍAS DE LA SEMANA ABREVIADOS (Lu, Mar, Mie, Jue, Vie, Sab, Dom) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1E1E2D]">
              DÍA DE LA SEMANA:
            </span>
            <span className="text-[10px] text-[#8A8A99]">
              {currentSlotMeal
                ? isCurrentSlotOccupiedByThisDish
                  ? '✅ Asignado a este plato'
                  : `⚠️ Ocupado: ${currentSlotMeal.dish.name.slice(0, 16)}...`
                : 'Libre'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 justify-between">
            {DAYS.map((d) => {
              const isSelected = selectedDay === d.id;
              const isOccupiedByThisDish = daysWhereThisDishIsAssigned.includes(d.id);
              const isOccupiedByOther =
                daysOccupiedForMoment.includes(d.id) && !isOccupiedByThisDish;

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDay(d.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center relative ${
                    isSelected
                      ? 'bg-[#FF6B2C] text-white shadow-sm scale-105'
                      : isOccupiedByThisDish
                      ? 'bg-[#E6F4EA] text-[#137333] border border-[#34A853]'
                      : isOccupiedByOther
                      ? 'bg-[#FCE8E6] text-[#C5221F] border border-[#EA4335]/40'
                      : 'bg-[#F5F5FA] text-[#8A8A99] hover:bg-[#EBEBF2] hover:text-[#1E1E2D]'
                  }`}
                  title={`${d.label} - ${selectedMoment}`}
                >
                  <span>{d.label}</span>
                  {/* Señal de que ya ha sido seleccionado anteriormente */}
                  {isOccupiedByThisDish && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#137333] border-2 border-white" />
                  )}
                  {isOccupiedByOther && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EA4335] border-2 border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* QUINTO: LAS PORCIONES */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1E1E2D]">
              PORCIONES:
            </span>
            <span className="text-[11px] font-mono-numbers font-bold text-[#FF6B2C]">
              Total est.: {currencySymbol} {totalPrice}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {PORTION_OPTIONS.map((por) => {
              const isSelected = portions === por;
              return (
                <button
                  key={por}
                  type="button"
                  onClick={() => setPortions(por)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E1E2D] text-white shadow-xs'
                      : 'bg-[#F5F5FA] text-[#8A8A99] hover:bg-[#EBEBF2] hover:text-[#1E1E2D]'
                  }`}
                >
                  {por} {por === 1 ? 'plato' : 'platos'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTÓN DE ASIGNACIÓN A DIAGRAMA */}
      <div className="p-4 bg-[#FAF7F2] border-t border-[#F0E6D8] space-y-2">
        {/* Aviso si la casilla ya estaba ocupada */}
        {isCurrentSlotOccupiedByOtherDish && (
          <div className="text-[10px] text-[#C5221F] bg-[#FCE8E6] px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>Reemplazará a &quot;{currentSlotMeal?.dish.name}&quot; en el Diagrama</span>
          </div>
        )}

        <button
          onClick={handleAssign}
          disabled={isSaved}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-white ${
            isSaved
              ? 'bg-[#15803D] scale-98'
              : 'bg-[#FF6B2C] hover:bg-[#FA5A2A] active:scale-95'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>¡Asignado al Diagrama!</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>
                Asignar a {MOMENTS.find((m) => m.id === selectedMoment)?.label} ({DAYS.find((d) => d.id === selectedDay)?.label})
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
