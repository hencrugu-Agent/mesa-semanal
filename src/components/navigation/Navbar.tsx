'use client';

import React from 'react';
import { UtensilsCrossed, Calendar, ShoppingBag, Settings, Database } from 'lucide-react';

export type ActiveView = 'catalogo' | 'semanal' | 'compras';

interface NavbarProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onOpenConfig: () => void;
  plannedMealsCount: number;
  shoppingItemsCount: number;
  isLocalMode?: boolean;
}

export function Navbar({
  activeView,
  onChangeView,
  onOpenConfig,
  plannedMealsCount,
  shoppingItemsCount,
  isLocalMode = true,
}: NavbarProps) {
  return (
    <>
      {/* Top Banner de Modo Local a prueba de fallos */}
      {isLocalMode && (
        <div className="bg-[#FEF3C7] border-b border-[#F59E0B]/30 px-3 py-1 text-center text-[11px] text-[#92400E] font-medium flex items-center justify-center gap-1.5 no-print">
          <Database className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>
            <strong>Modo Local Activo:</strong> Tus datos se guardan en este navegador. Para sincronizar con Google Sheets en familia, ingresa tus credenciales.
          </span>
        </div>
      )}

      {/* Header Principal de Escritorio y Móvil */}
      <header className="bg-[#FDFBF7] border-b border-[#E5E0D8] px-4 md:px-8 py-3 sticky top-0 z-40 shadow-2xs no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo y Branding */}
          <div
            onClick={() => onChangeView('catalogo')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C2410C] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif-gastronomy text-lg md:text-xl font-black text-[#1F2937] tracking-tight leading-none">
                MESA SEMANAL
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-[#9A3412] font-bold block mt-0.5">
                Mercado & Cocina Criolla
              </span>
            </div>
          </div>

          {/* Navegación en Pantallas Medianas y Grandes */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5EFE6] p-1 rounded-2xl border border-[#E5E0D8]">
            <button
              onClick={() => onChangeView('catalogo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'catalogo'
                  ? 'bg-white text-[#1F2937] shadow-xs'
                  : 'text-[#4B5563] hover:text-[#1F2937]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-[#C2410C]" />
              <span>Catálogo Delivery</span>
            </button>

            <button
              onClick={() => onChangeView('semanal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeView === 'semanal'
                  ? 'bg-white text-[#1F2937] shadow-xs'
                  : 'text-[#4B5563] hover:text-[#1F2937]'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#D97706]" />
              <span>Plan Semanal</span>
              {plannedMealsCount > 0 && (
                <span className="bg-[#C2410C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {plannedMealsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onChangeView('compras')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeView === 'compras'
                  ? 'bg-white text-[#1F2937] shadow-xs'
                  : 'text-[#4B5563] hover:text-[#1F2937]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#15803D]" />
              <span>Compras & Despensa</span>
              {shoppingItemsCount > 0 && (
                <span className="bg-[#15803D] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {shoppingItemsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Botón de Configuración */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConfig}
              className="p-2 text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F5EFE6] rounded-xl border border-transparent hover:border-[#E5E0D8] transition-all cursor-pointer"
              title="Ajustes del hogar"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Navegación Inferior Móvil (Mobile-first en el mercado) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] px-3 py-1.5 flex items-center justify-around shadow-lg no-print">
        <button
          onClick={() => onChangeView('catalogo')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
            activeView === 'catalogo' ? 'text-[#C2410C] font-bold' : 'text-[#6B7280]'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px]">Delivery</span>
        </button>

        <button
          onClick={() => onChangeView('semanal')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer relative ${
            activeView === 'semanal' ? 'text-[#D97706] font-bold' : 'text-[#6B7280]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Plan Gráfico</span>
          {plannedMealsCount > 0 && (
            <span className="absolute top-0 right-1 bg-[#C2410C] text-white text-[9px] font-bold px-1 rounded-full">
              {plannedMealsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onChangeView('compras')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer relative ${
            activeView === 'compras' ? 'text-[#15803D] font-bold' : 'text-[#6B7280]'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Compras</span>
          {shoppingItemsCount > 0 && (
            <span className="absolute top-0 right-1 bg-[#15803D] text-white text-[9px] font-bold px-1 rounded-full">
              {shoppingItemsCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenConfig}
          className="flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer text-[#6B7280]"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Ajustes</span>
        </button>
      </div>
    </>
  );
}
