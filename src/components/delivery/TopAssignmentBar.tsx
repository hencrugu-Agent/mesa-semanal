'use client';

import React from 'react';
import { DayOfWeek } from '@/types/menu';
import { MealMoment } from '@/types/dish';
import { Search, Calendar, Clock, Users, X, Sparkles, ChefHat } from 'lucide-react';

interface TopAssignmentBarProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  selectedMoment: MealMoment;
  onSelectMoment: (moment: MealMoment) => void;
  plateQuantity: number;
  onSelectQuantity: (qty: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  mainDishesCount: number; // meta de 7 platos de la semana
  onOpenCustomDish: () => void;
  onOpenAiAssistant: () => void;
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
  { id: 'media_manana', label: 'M. Mañana', emoji: '🍎' },
  { id: 'almuerzo', label: 'Almuerzo', emoji: '🍲' },
  { id: 'media_tarde', label: 'M. Tarde', emoji: '☕' },
  { id: 'cena', label: 'Cena', emoji: '🌙' },
];

const CATEGORIES: string[] = [
  'Todos',
  'Criollo',
  'Sopas',
  'Entradas',
  'Desayunos',
  'Snacks y Postres',
  'Cenas Ligeras',
  'Marino',
];

export function TopAssignmentBar({
  selectedDay,
  onSelectDay,
  selectedMoment,
  onSelectMoment,
  plateQuantity,
  onSelectQuantity,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  mainDishesCount,
  onOpenCustomDish,
  onOpenAiAssistant,
}: TopAssignmentBarProps) {
  const goalProgress = Math.min(100, Math.round((mainDishesCount / 7) * 100));

  return (
    <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-sm pb-2 pt-3 px-3 md:px-6">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Fila 1: Meta semanal y Selectores desplegables superiores */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Indicador de meta 7 platos */}
          <div className="flex items-center gap-2 bg-[#F5EFE6] px-3 py-1.5 rounded-full border border-[#E5E0D8] text-xs font-medium text-[#1F2937]">
            <span className="font-bold text-[#C2410C]">
              {mainDishesCount}/7
            </span>
            <span>platos de la semana</span>
            <div className="w-14 h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#15803D] transition-all duration-300"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          {/* Grupo de Desplegables solicitados: Día, Momento y Cantidad de Platos */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Selector de Día */}
            <div className="flex items-center gap-1 bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 shadow-xs text-xs font-semibold text-[#1F2937]">
              <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
              <label htmlFor="daySelect" className="sr-only">Día</label>
              <select
                id="daySelect"
                value={selectedDay}
                onChange={(e) => onSelectDay(e.target.value as DayOfWeek)}
                className="bg-transparent focus:outline-none cursor-pointer capitalize font-medium text-xs text-[#1F2937]"
              >
                {DAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Momento del Día */}
            <div className="flex items-center gap-1 bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 shadow-xs text-xs font-semibold text-[#1F2937]">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              <label htmlFor="momentSelect" className="sr-only">Momento</label>
              <select
                id="momentSelect"
                value={selectedMoment}
                onChange={(e) => onSelectMoment(e.target.value as MealMoment)}
                className="bg-transparent focus:outline-none cursor-pointer font-medium text-xs text-[#1F2937]"
              >
                {MOMENTS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.emoji} {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Cantidad de Platos */}
            <div className="flex items-center gap-1 bg-white border border-[#D5C5B2] rounded-xl px-2.5 py-1.5 shadow-xs text-xs font-semibold text-[#1F2937]">
              <Users className="w-3.5 h-3.5 text-[#C2410C]" />
              <label htmlFor="quantitySelect" className="sr-only">Cantidad de platos</label>
              <select
                id="quantitySelect"
                value={plateQuantity}
                onChange={(e) => onSelectQuantity(Number(e.target.value))}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-xs text-[#C2410C]"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((q) => (
                  <option key={q} value={q}>
                    {q} {q === 1 ? 'plato' : 'platos'}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Armar mi propio plato */}
            <button
              onClick={onOpenCustomDish}
              className="flex items-center gap-1.5 bg-[#F5EFE6] hover:bg-[#EAE1D2] text-[#9A3412] border border-[#D5C5B2] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Crear Plato</span>
            </button>

            {/* Asistente IA */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] border border-[#F59E0B]/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Asistente de Recetas y Menú con IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Asistente IA</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Buscador Prominente estilo Rappi/LlamaFood */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar plato criollo, sopa, desayuno o insumo..."
            className="w-full bg-white pl-10 pr-9 py-2 rounded-xl border border-[#D5C5B2] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 text-sm placeholder:text-[#9CA3AF] text-[#1F2937] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#1F2937]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Fila 3: Carrusel de Chips de Categorías deslizable */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-medium">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F2937] text-white font-semibold shadow-xs'
                    : 'bg-[#F5EFE6] text-[#4B5563] hover:bg-[#EAE1D2] hover:text-[#1F2937]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
