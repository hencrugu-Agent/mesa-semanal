'use client';

import React from 'react';
import { PlannedMeal, DayOfWeek } from '@/types/menu';
import { MealMoment } from '@/types/dish';
import {
  Trash2,
  Printer,
  ArrowRight,
  Plus,
  Share2,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface WeeklyDiagramViewProps {
  meals: PlannedMeal[];
  onRemoveMeal: (mealId: string) => void;
  onToggleMealPrepared?: (mealId: string) => void;
  onClearWeek: () => void;
  onSelectSlotToAssign: (day: DayOfWeek, moment: MealMoment) => void;
  onGoToShopping: () => void;
  currencySymbol?: string;
}

const MOMENTS: { id: MealMoment; label: string }[] = [
  { id: 'desayuno', label: 'DESAYUNO' },
  { id: 'media_manana', label: 'MEDIA MAÑANA' },
  { id: 'almuerzo', label: 'ALMUERZO' },
  { id: 'media_tarde', label: 'MEDIA TARDE' },
  { id: 'cena', label: 'CENA' },
];

const DAYS: { id: DayOfWeek; label: string; full: string }[] = [
  { id: 'lunes', label: 'LUN', full: 'Lunes' },
  { id: 'martes', label: 'MAR', full: 'Martes' },
  { id: 'miercoles', label: 'MIE', full: 'Miércoles' },
  { id: 'jueves', label: 'JUE', full: 'Jueves' },
  { id: 'viernes', label: 'VIE', full: 'Viernes' },
  { id: 'sabado', label: 'SAB', full: 'Sábado' },
  { id: 'domingo', label: 'DOM', full: 'Domingo' },
];

export function WeeklyDiagramView({
  meals,
  onRemoveMeal,
  onToggleMealPrepared,
  onClearWeek,
  onSelectSlotToAssign,
  onGoToShopping,
  currencySymbol = 'S/',
}: WeeklyDiagramViewProps) {
  const { showToast } = useToast();

  const getMeal = (day: DayOfWeek, moment: MealMoment): PlannedMeal | undefined => {
    return meals.find((m) => m.day === day && m.moment === moment && m.status !== 'cancelado');
  };

  const totalAssigned = meals.filter((m) => m.status !== 'cancelado').length;
  const totalPrepared = meals.filter((m) => m.status === 'preparado').length;
  const totalCost = meals.reduce(
    (sum, m) => sum + (m.status !== 'cancelado' ? m.dish.priceRefPerPlate * m.plateCount : 0),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let text = `📅 *MESA SEMANAL — DIAGRAMA DE MENÚ*\n\n`;

    DAYS.forEach((d) => {
      text += `📍 *${d.full.toUpperCase()}*\n`;
      let count = 0;
      MOMENTS.forEach((m) => {
        const meal = getMeal(d.id, m.id);
        if (meal) {
          count++;
          const check = meal.status === 'preparado' ? '✅ [HECHO]' : '▫️';
          text += `  • *${m.label}:* ${check} ${meal.dish.name} (${meal.plateCount} porc.)\n`;
        }
      });
      if (count === 0) text += `  _(Sin platos asignados)_\n`;
      text += `\n`;
    });

    text += `💰 *Presupuesto estimado:* ${currencySymbol} ${totalCost.toFixed(2)}\n`;
    text += `🍳 *Progreso de preparación:* ${totalPrepared}/${totalAssigned} platos preparados\n`;
    text += `_Generado con Mesa Semanal_`;

    navigator.clipboard.writeText(text);
    showToast('¡Diagrama semanal copiado para WhatsApp!');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-6 pb-28 space-y-4 pt-2">
      {/* Barra Superior con Controles del Diagrama */}
      <div className="bg-white dark:bg-[#111526] rounded-[28px] p-5 border border-[#F0E6D8] dark:border-[#1E2840] shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B2C] dark:text-[#00FF66] bg-[#FFF0E6] dark:bg-[#00FF66]/15 px-2.5 py-0.5 rounded-full border border-transparent dark:border-[#00FF66]/30">
              Cuadro Semanal Organizado
            </span>
            <span className="text-xs text-[#8A8A99] dark:text-[#8E9DBA] font-mono-numbers">
              {totalAssigned} de 35 casillas asignadas · {totalPrepared} preparados
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#1E1E2D] dark:text-[#00FF66] tracking-tight mt-1">
            Diagrama Semanal (Lunes a Domingo)
          </h2>
          <p className="text-xs text-[#8A8A99] dark:text-[#8E9DBA]">
            Usa el botón <strong className="text-[#15803D] dark:text-[#00FF66] font-black">HECHO</strong> en cada plato preparado para descontar automáticamente los ingredientes de tu Almacén.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="text-right mr-1">
            <span className="text-[10px] text-[#8A8A99] dark:text-[#8E9DBA] uppercase font-bold block">
              Costo Semanal
            </span>
            <span className="text-lg font-black font-mono-numbers text-[#1E1E2D] dark:text-[#00FF88]">
              {currencySymbol} {totalCost.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="p-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="Copiar diagrama a WhatsApp"
            aria-label="Copiar a WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-2xl bg-[#1E1E2D] dark:bg-[#1A2238] hover:bg-black dark:hover:bg-[#232F4C] text-white shadow-xs transition-transform active:scale-95 cursor-pointer border border-transparent dark:border-[#2A3758]"
            title="Imprimir diagrama"
            aria-label="Imprimir diagrama"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToShopping}
            className="flex items-center gap-1.5 bg-[#FF6B2C] dark:bg-[#00FF66] hover:bg-[#FA5A2A] dark:hover:bg-[#00CC55] text-white dark:text-black px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <span>Ver Acumulados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CUADRO / MATRIZ DE DIAGRAMA */}
      <div className="bg-white dark:bg-[#111526] rounded-[28px] border-2 border-[#1E1E2D] dark:border-[#1E2840] shadow-sm overflow-hidden print-card transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[780px]">
            <thead>
              <tr className="bg-[#FAF7F2] dark:bg-[#0B0E1A] border-b-2 border-[#1E1E2D] dark:border-[#1E2840]">
                {/* Celda superior izquierda vacía */}
                <th className="p-3 w-36 border-r-2 border-[#1E1E2D] dark:border-[#1E2840] text-xs font-black text-[#1E1E2D] dark:text-[#00FF66] tracking-wider uppercase bg-[#F0E6D8]/60 dark:bg-[#13182B] text-center">
                  MOMENTO / DÍA
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d.id}
                    className="p-3 border-r-2 border-[#1E1E2D] dark:border-[#1E2840] last:border-r-0 text-center text-xs font-black text-[#1E1E2D] dark:text-[#00FF66] tracking-widest uppercase bg-[#FAF7F2] dark:bg-[#0B0E1A]"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOMENTS.map((m, mIdx) => (
                <tr
                  key={m.id}
                  className={`border-b-2 border-[#1E1E2D] dark:border-[#1E2840] last:border-b-0 ${
                    mIdx % 2 === 0
                      ? 'bg-white dark:bg-[#111526]'
                      : 'bg-[#FDFAF6] dark:bg-[#0E1220]'
                  }`}
                >
                  {/* Encabezado de fila: DESAYUNO, MEDIA MAÑANA, ALMUERZO, MEDIA TARDE, CENA */}
                  <th className="p-3.5 border-r-2 border-[#1E1E2D] dark:border-[#1E2840] text-xs font-black text-[#1E1E2D] dark:text-[#00FF66] tracking-wider uppercase bg-[#FAF7F2] dark:bg-[#0B0E1A] text-left align-middle">
                    {m.label}
                  </th>

                  {/* 7 Celdas por día */}
                  {DAYS.map((d) => {
                    const meal = getMeal(d.id, m.id);
                    const isPrepared = meal?.status === 'preparado';

                    return (
                      <td
                        key={`${d.id}-${m.id}`}
                        className="p-2 border-r-2 border-[#1E1E2D] dark:border-[#1E2840] last:border-r-0 align-top relative group min-h-[85px] transition-colors hover:bg-[#FFF9F2] dark:hover:bg-[#161D32]"
                      >
                        {meal ? (
                          <div
                            className={`flex flex-col justify-between h-full border rounded-xl p-2 shadow-2xs group/card transition-all ${
                              isPrepared
                                ? 'bg-[#DCFCE7]/70 dark:bg-[#0E2A18] border-[#86EFAC] dark:border-[#00FF66]/50'
                                : 'bg-[#FFF0E6] dark:bg-[#20152B]/80 border-[#FF6B2C]/30 dark:border-[#FF7700]/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span
                                className={`text-xs font-bold leading-snug lowercase first-letter:uppercase ${
                                  isPrepared
                                    ? 'text-[#15803D] dark:text-[#00FF66] line-through decoration-[#15803D]/60'
                                    : 'text-[#1E1E2D] dark:text-[#D1FFD7]'
                                }`}
                              >
                                {meal.dish.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => onRemoveMeal(meal.id)}
                                className="opacity-60 group-hover/card:opacity-100 hover:text-[#DC2626] dark:hover:text-[#FF3366] text-[#8A8A99] p-0.5 rounded transition-colors cursor-pointer"
                                title="Quitar plato del diagrama"
                                aria-label="Quitar plato"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Porciones y precio */}
                            <div className="flex items-center justify-between text-[10px] text-[#8A8A99] dark:text-[#8E9DBA] mt-1.5 pt-1 border-t border-black/10 dark:border-white/10">
                              <span className="font-mono-numbers font-bold text-[#FF6B2C] dark:text-[#00FF88]">
                                {meal.plateCount} porc.
                              </span>
                              <span className="font-mono-numbers">
                                {currencySymbol} {(meal.dish.priceRefPerPlate * meal.plateCount).toFixed(1)}
                              </span>
                            </div>

                            {/* BOTÓN "HECHO" PARA CORRELACIÓN DIRECTA CON ALMACÉN */}
                            {onToggleMealPrepared && (
                              <div className="mt-2 pt-1 border-t border-black/10 dark:border-white/10">
                                {isPrepared ? (
                                  <button
                                    type="button"
                                    onClick={() => onToggleMealPrepared(meal.id)}
                                    className="w-full bg-[#15803D] dark:bg-[#00FF66] hover:bg-[#166534] dark:hover:bg-[#00CC55] text-white dark:text-black py-1 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                    title="Plato ya preparado. Haz clic para revertir y devolver los insumos al almacén"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>HECHO ✓</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onToggleMealPrepared(meal.id)}
                                    className="w-full bg-white dark:bg-[#13182B] hover:bg-[#15803D] dark:hover:bg-[#00FF66] text-[#15803D] dark:text-[#00FF66] hover:text-white dark:hover:text-black border border-[#15803D]/40 dark:border-[#00FF66]/40 py-1 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs group-hover/card:scale-102"
                                    title="Marcar como HECHO: descuenta automáticamente los ingredientes de este plato del Almacén"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>MARCAR HECHO</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectSlotToAssign(d.id, m.id)}
                            className="w-full h-16 border border-dashed border-transparent hover:border-[#FF6B2C]/60 dark:hover:border-[#00FF66]/60 rounded-xl flex items-center justify-center text-transparent hover:text-[#FF6B2C] dark:hover:text-[#00FF66] hover:bg-white dark:hover:bg-[#13182B] transition-all cursor-pointer group-hover:text-[#8A8A99]"
                            title={`Asignar plato a ${m.label} de ${d.full}`}
                          >
                            <Plus className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de Acción Inferiores */}
      <div className="flex items-center justify-between text-xs text-[#8A8A99] dark:text-[#8E9DBA] px-2 flex-wrap gap-2">
        <span>
          💡 Al pulsar <strong className="text-[#15803D] dark:text-[#00FF66]">MARCAR HECHO</strong>, la app descuenta automáticamente del módulo ALMACÉN los ingredientes exactos usados para las porciones preparadas.
        </span>
        {meals.length > 0 && (
          <button
            onClick={onClearWeek}
            className="text-[#DC2626] dark:text-[#FF3366] hover:underline font-bold cursor-pointer"
          >
            Limpiar todo el diagrama
          </button>
        )}
      </div>
    </div>
  );
}
