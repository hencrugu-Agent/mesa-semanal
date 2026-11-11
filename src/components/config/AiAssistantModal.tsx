'use client';

import React, { useState } from 'react';
import { Dish } from '@/types/dish';
import { IngredientCategory, UnitType } from '@/types/ingredient';
import { useToast } from '@/components/ui/Toast';
import { Sparkles, X, Wand2, DollarSign, Loader2 } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDish: (dish: Dish) => void;
  currencySymbol?: string;
}

interface ParsedIngredientResponse {
  ingredientName: string;
  category?: string;
  amountForOne?: number;
  unit?: string;
}

export function AiAssistantModal({
  isOpen,
  onClose,
  onImportDish,
  currencySymbol = 'S/',
}: AiAssistantModalProps) {
  const [activeAiTab, setActiveAiTab] = useState<'recipe' | 'budget'>('recipe');
  const [recipeText, setRecipeText] = useState<string>('');
  const [budgetValue, setBudgetValue] = useState<number>(150);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsedPreview, setParsedPreview] = useState<Dish | null>(null);
  const [budgetResults, setBudgetResults] = useState<Dish[]>([]);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleParseRecipe = async () => {
    if (!recipeText.trim()) {
      showToast('Escribe o pega el texto de tu receta', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse_recipe', text: recipeText }),
      });
      const data = await res.json();
      if (data.success && data.parsed) {
        const p = data.parsed;
        const newDish: Dish = {
          id: `ai-dish-${Date.now()}`,
          name: p.name || 'Nuevo Plato con IA',
          category: p.category || 'Criollo',
          moments: p.moments || ['almuerzo'],
          prepTimeMinutes: p.prepTimeMinutes || 35,
          basePortions: 1,
          priceRefPerPlate: p.priceRefPerPlate || 7.5,
          imageSvgKey: 'lentejas',
          description: p.description || '',
          ingredients: p.ingredients.map((ing: ParsedIngredientResponse) => ({
            ingredientId: `ai-ing-${Math.random().toString(36).substring(2, 7)}`,
            ingredientName: ing.ingredientName,
            category: (ing.category as IngredientCategory) || 'Víveres',
            amountForOne: ing.amountForOne || 100,
            unit: (ing.unit as UnitType) || 'g',
          })),
        };
        setParsedPreview(newDish);
        showToast(
          data.engine === 'openrouter'
            ? '¡Receta interpretada por IA OpenRouter!'
            : '¡Receta procesada con motor heurístico local!'
        );
      }
    } catch {
      showToast('Error procesando receta con IA', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestBudget = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest_menu', budget: budgetValue }),
      });
      const data = await res.json();
      if (data.success && data.suggestedDishes) {
        setBudgetResults(data.suggestedDishes);
        showToast('¡Menú semanal sugerido según presupuesto!');
      }
    } catch {
      showToast('Error calculando menú por presupuesto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    onImportDish(parsedPreview);
    showToast(`"${parsedPreview.name}" guardado en tu catálogo.`);
    setParsedPreview(null);
    setRecipeText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E5E0D8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#FAF7F2] p-4 border-b border-[#EFE8DD] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-serif-gastronomy text-lg font-bold text-[#1F2937]">
              Asistente Culinario con IA
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#1F2937] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de modo IA */}
        <div className="flex border-b border-[#E5E0D8] text-xs font-bold">
          <button
            onClick={() => setActiveAiTab('recipe')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-colors ${
              activeAiTab === 'recipe'
                ? 'border-[#C2410C] text-[#C2410C] bg-[#FAF7F2]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Interpretar Receta en Texto Libre
          </button>
          <button
            onClick={() => setActiveAiTab('budget')}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-colors ${
              activeAiTab === 'budget'
                ? 'border-[#C2410C] text-[#C2410C] bg-[#FAF7F2]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Sugerir Menú por Presupuesto
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {activeAiTab === 'recipe' && (
            <div className="space-y-3">
              <p className="text-xs text-[#6B7280]">
                Escribe o pega una receta en lenguaje natural (ej. mensaje de WhatsApp o notas).
                El asistente extraerá el nombre, tiempo y calculará los insumos para 1 plato.
              </p>

              <textarea
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                placeholder="Ejemplo: Arroz tapado limeño. Lleva 150g de carne molida, 75g de arroz, media cebolla picadita, 1 huevo para montar y pasas. Se prepara en 25 minutos..."
                rows={5}
                className="w-full bg-[#FAF7F2] border border-[#D5C5B2] rounded-xl p-3 text-xs text-[#1F2937] focus:outline-none focus:border-[#D97706]"
              />

              <button
                onClick={handleParseRecipe}
                disabled={isLoading || !recipeText.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#D97706] hover:bg-[#B45309] disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Interpretando receta...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Analizar e interpretar ingredientes para 1 plato</span>
                  </>
                )}
              </button>

              {parsedPreview && (
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EFE8DD] space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-gastronomy text-sm font-bold text-[#1F2937]">
                      {parsedPreview.name}
                    </h4>
                    <span className="font-mono-numbers text-xs font-bold text-[#D97706]">
                      est. {currencySymbol} {parsedPreview.priceRefPerPlate.toFixed(2)} / plato
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#78350F] block">
                      Insumos calculados para 1 plato:
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {parsedPreview.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="bg-white px-2 py-0.5 rounded border border-[#E5E0D8] text-[#374151]"
                        >
                          {ing.ingredientName}: <strong>{ing.amountForOne} {ing.unit}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmImport}
                    className="w-full mt-2 bg-[#15803D] hover:bg-[#166534] text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Guardar este plato en mi catálogo
                  </button>
                </div>
              )}
            </div>
          )}

          {activeAiTab === 'budget' && (
            <div className="space-y-3">
              <p className="text-xs text-[#6B7280]">
                Indica cuánto dinero tienes planeado gastar en el mercado para la semana (en Soles).
                El motor armará una propuesta balanceada con platos peruanos que no excedan tu presupuesto.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                  Presupuesto objetivo para la semana ({currencySymbol}):
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#D97706] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(Number(e.target.value))}
                    step="5"
                    min="30"
                    className="w-full bg-[#FAF7F2] border border-[#D5C5B2] rounded-xl pl-9 pr-3 py-2 text-sm font-mono-numbers font-bold text-[#1F2937]"
                  />
                </div>
              </div>

              <button
                onClick={handleSuggestBudget}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizando menú por presupuesto...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generar Menú Semanal Óptimo</span>
                  </>
                )}
              </button>

              {budgetResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F5EFE6]">
                  <span className="text-xs font-bold text-[#78350F] block">
                    Propuesta de 7 platos para la semana:
                  </span>
                  <div className="divide-y divide-[#F5EFE6] bg-[#FAF7F2] rounded-xl border border-[#EFE8DD] overflow-hidden">
                    {budgetResults.map((dish, i) => (
                      <div key={dish.id} className="p-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1F2937]">
                          Día {i + 1}: {dish.name}
                        </span>
                        <span className="font-mono-numbers font-bold text-[#C2410C]">
                          {currencySymbol} {dish.priceRefPerPlate.toFixed(2)} / plato
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
