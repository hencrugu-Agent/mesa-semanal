'use client';

import React, { useState } from 'react';
import { Dish, DishCategory, MealMoment } from '@/types/dish';
import { RecipeIngredient, Ingredient, UnitType } from '@/types/ingredient';
import { useToast } from '@/components/ui/Toast';
import { X, Plus, Trash2, ChefHat } from 'lucide-react';

interface CustomDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDish: (dish: Dish) => void;
  ingredientsCatalog: Ingredient[];
}

export function CustomDishModal({
  isOpen,
  onClose,
  onSaveDish,
  ingredientsCatalog,
}: CustomDishModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<DishCategory>('Criollo');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(30);
  const [priceRefPerPlate, setPriceRefPerPlate] = useState<number>(7.5);
  const [description, setDescription] = useState<string>('');
  const [selectedMoments, setSelectedMoments] = useState<MealMoment[]>(['almuerzo']);

  // Ingredientes del plato para 1 porción
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    {
      ingredientId: 'ing-arroz',
      ingredientName: 'Arroz extra',
      category: 'Víveres',
      amountForOne: 75,
      unit: 'g',
    },
  ]);

  if (!isOpen) return null;

  const toggleMoment = (moment: MealMoment) => {
    setSelectedMoments((prev) =>
      prev.includes(moment)
        ? prev.filter((m) => m !== moment)
        : [...prev, moment]
    );
  };

  const handleAddIngredientRow = () => {
    setIngredients((prev) => [
      ...prev,
      {
        ingredientId: `custom-ing-${Date.now()}`,
        ingredientName: '',
        category: 'Verduras',
        amountForOne: 100,
        unit: 'g',
      },
    ]);
  };

  const handleUpdateIngredient = (index: number, updates: Partial<RecipeIngredient>) => {
    setIngredients((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleSelectFromCatalog = (index: number, ingId: string) => {
    const item = ingredientsCatalog.find((i) => i.id === ingId);
    if (!item) return;
    setIngredients((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        ingredientId: item.id,
        ingredientName: item.name,
        category: item.category,
        unit: item.baseUnit,
      };
      return copy;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor escribe un nombre para tu plato', 'error');
      return;
    }
    if (ingredients.length === 0 || ingredients.some((i) => !i.ingredientName.trim())) {
      showToast('Por favor completa los ingredientes para 1 plato', 'error');
      return;
    }

    const newDish: Dish = {
      id: `custom-dish-${Date.now()}`,
      name: name.trim(),
      category,
      moments: selectedMoments.length > 0 ? selectedMoments : ['almuerzo'],
      prepTimeMinutes: prepTimeMinutes || 25,
      basePortions: 1,
      priceRefPerPlate: Number(priceRefPerPlate) || 7.0,
      imageSvgKey: 'lentejas', // clave SVG base
      description: description.trim() || 'Receta personalizada del hogar',
      ingredients,
      isCustom: true,
    };

    onSaveDish(newDish);
    showToast(`¡Plato "${newDish.name}" agregado al catálogo!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E5E0D8] shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        <div className="bg-[#FAF7F2] p-4 border-b border-[#EFE8DD] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#C2410C]" />
            <h3 className="font-serif-gastronomy text-lg font-bold text-[#1F2937]">
              Armar Mi Propio Plato Casero
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9CA3AF] hover:text-[#1F2937] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Nombre del Plato *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Tallarines rojos con pollo"
                required
                className="w-full bg-white border border-[#D5C5B2] rounded-xl px-3 py-2 text-xs text-[#1F2937] focus:border-[#D97706] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DishCategory)}
                className="w-full bg-white border border-[#D5C5B2] rounded-xl px-3 py-2 text-xs text-[#1F2937] focus:border-[#D97706] focus:outline-none"
              >
                <option value="Criollo">Criollo</option>
                <option value="Sopas">Sopas</option>
                <option value="Entradas">Entradas</option>
                <option value="Desayunos">Desayunos</option>
                <option value="Snacks y Postres">Snacks y Postres</option>
                <option value="Cenas Ligeras">Cenas Ligeras</option>
                <option value="Marino">Marino</option>
              </select>
            </div>
          </div>

          {/* Descripción opcional */}
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Descripción o notas de preparación
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Con salsa casera de tomate y laurel"
              className="w-full bg-white border border-[#D5C5B2] rounded-xl px-3 py-2 text-xs text-[#1F2937]"
            />
          </div>

          {/* Tiempo y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Tiempo de Prep. (minutos)
              </label>
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                min="5"
                className="w-full bg-white border border-[#D5C5B2] rounded-xl px-3 py-2 text-xs text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Precio Referencial por Plato (S/)
              </label>
              <input
                type="number"
                step="0.10"
                value={priceRefPerPlate}
                onChange={(e) => setPriceRefPerPlate(Number(e.target.value))}
                min="1"
                className="w-full bg-white border border-[#D5C5B2] rounded-xl px-3 py-2 text-xs text-[#1F2937]"
              />
            </div>
          </div>

          {/* Momentos del Día Aplicables */}
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
              Momentos del día recomendados:
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {(
                [
                  { id: 'desayuno', label: '🌅 Desayuno' },
                  { id: 'media_manana', label: '🍎 M. Mañana' },
                  { id: 'almuerzo', label: '🍲 Almuerzo' },
                  { id: 'media_tarde', label: '☕ M. Tarde' },
                  { id: 'cena', label: '🌙 Cena' },
                ] as const
              ).map((m) => {
                const isSelected = selectedMoments.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMoment(m.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#1F2937] text-white border-[#1F2937]'
                        : 'bg-[#F5EFE6] text-[#4B5563] border-[#D5C5B2]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* INGREDIENTES PARA 1 PLATO */}
          <div className="space-y-2 border-t border-[#F5EFE6] pt-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#78350F] uppercase">
                  Ingredientes calculados para 1 plato
                </h4>
                <p className="text-[11px] text-[#6B7280]">
                  Indica la cantidad exacta para 1 persona. Al planificar, la app escalará automáticamente según los comensales.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="flex items-center gap-1 text-xs font-bold text-[#C2410C] hover:text-[#9A3412] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Insumo</span>
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#EFE8DD]"
                >
                  {/* Selector rápido o nombre */}
                  <select
                    onChange={(e) => handleSelectFromCatalog(idx, e.target.value)}
                    className="w-1/3 bg-white border border-[#D5C5B2] rounded-lg px-2 py-1 text-xs text-[#1F2937]"
                  >
                    <option value="">Buscar en catálogo...</option>
                    {ingredientsCatalog.map((catItem) => (
                      <option key={catItem.id} value={catItem.id}>
                        {catItem.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={ing.ingredientName}
                    onChange={(e) => handleUpdateIngredient(idx, { ingredientName: e.target.value })}
                    placeholder="Nombre del insumo"
                    required
                    className="flex-1 bg-white border border-[#D5C5B2] rounded-lg px-2 py-1 text-xs text-[#1F2937]"
                  />

                  <input
                    type="number"
                    step="any"
                    value={ing.amountForOne}
                    onChange={(e) =>
                      handleUpdateIngredient(idx, { amountForOne: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Cantidad"
                    required
                    className="w-20 bg-white border border-[#D5C5B2] rounded-lg px-2 py-1 text-xs text-[#1F2937]"
                  />

                  <select
                    value={ing.unit}
                    onChange={(e) =>
                      handleUpdateIngredient(idx, { unit: e.target.value as UnitType })
                    }
                    className="w-20 bg-white border border-[#D5C5B2] rounded-lg px-2 py-1 text-xs text-[#1F2937]"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="und">und</option>
                    <option value="dientes">dientes</option>
                    <option value="atado">atado</option>
                    <option value="lata">lata</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    disabled={ingredients.length <= 1}
                    className="p-1 text-[#9CA3AF] hover:text-[#DC2626] disabled:opacity-20 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#F5EFE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#1F2937]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Guardar Plato en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
