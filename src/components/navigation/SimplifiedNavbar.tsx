'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, ShoppingCart, FileSpreadsheet, RefreshCw, Calendar, Warehouse, Moon, Sun } from 'lucide-react';

export type SimplifiedActiveView = 'platos' | 'diagrama' | 'acumulados' | 'almacen';

interface SimplifiedNavbarProps {
  activeView: SimplifiedActiveView;
  onChangeView: (view: SimplifiedActiveView) => void;
  onOpenSheetsModal: () => void;
  selectedDishesCount: number;
  warehouseItemsCount?: number;
  isSheetsConnected?: boolean;
  onQuickRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SimplifiedNavbar({
  activeView,
  onChangeView,
  onOpenSheetsModal,
  selectedDishesCount,
  warehouseItemsCount = 0,
  isSheetsConnected = true,
  onQuickRefresh,
  isRefreshing = false,
}: SimplifiedNavbarProps) {
  const [themeMode, setThemeMode] = useState<'auto' | 'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'auto';
    try {
      const saved = localStorage.getItem('mesa_semanal_theme');
      return saved === 'dark' || saved === 'light' ? saved : 'auto';
    } catch {
      return 'auto';
    }
  });

  const [isCurrentlyDark, setIsCurrentlyDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('mesa_semanal_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        const currentSaved = localStorage.getItem('mesa_semanal_theme');
        if (!currentSaved || currentSaved === 'auto') {
          if (e.matches) {
            document.documentElement.classList.add('dark');
            setIsCurrentlyDark(true);
          } else {
            document.documentElement.classList.remove('dark');
            setIsCurrentlyDark(false);
          }
        }
      } catch {
        // ignore
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const handleToggleTheme = () => {
    // Alternar entre Auto -> Oscuro Neón -> Claro
    let nextMode: 'auto' | 'dark' | 'light' = 'dark';
    if (themeMode === 'auto') {
      nextMode = isCurrentlyDark ? 'light' : 'dark';
    } else if (themeMode === 'dark') {
      nextMode = 'light';
    } else {
      nextMode = 'auto';
    }

    setThemeMode(nextMode);
    if (nextMode === 'auto') {
      localStorage.removeItem('mesa_semanal_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setIsCurrentlyDark(prefersDark);
    } else {
      localStorage.setItem('mesa_semanal_theme', nextMode);
      if (nextMode === 'dark') {
        document.documentElement.classList.add('dark');
        setIsCurrentlyDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsCurrentlyDark(false);
      }
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-white dark:bg-[#111526] border-b border-[#F0E6D8] dark:border-[#1E2840] px-4 md:px-8 py-3.5 sticky top-0 z-40 shadow-xs no-print transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div
            onClick={() => onChangeView('platos')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B2C] to-[#FFAE68] dark:from-[#00FF66] dark:to-[#00CC55] flex items-center justify-center text-white dark:text-black shadow-sm shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1E1E2D] dark:text-[#00FF66] tracking-tight leading-none">
                MESA SEMANAL
              </h1>
              <span className="text-[10px] uppercase font-bold text-[#FF6B2C] dark:text-[#00FF66]/80 tracking-wider block mt-0.5">
                Food Delivery & Mercado
              </span>
            </div>
          </div>

          {/* Navegación de Escritorio */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#F5F5FA] dark:bg-[#13182B] p-1.5 rounded-full border border-[#EBEBF2] dark:border-[#202A44]">
            <button
              onClick={() => onChangeView('platos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeView === 'platos'
                  ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black shadow-xs'
                  : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#1E1E2D] dark:hover:text-[#00FF66]'
              }`}
            >
              <Utensils className="w-4 h-4 text-[#FF6B2C] dark:text-[#00FF66]" />
              <span>Platos</span>
            </button>

            <button
              onClick={() => onChangeView('diagrama')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
                activeView === 'diagrama'
                  ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black shadow-xs'
                  : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#1E1E2D] dark:hover:text-[#00FF66]'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#FF6B2C] dark:text-[#00FF66]" />
              <span>Diagrama</span>
              {selectedDishesCount > 0 && (
                <span className="bg-[#FF6B2C] dark:bg-black dark:text-[#00FF66] text-white text-[10px] font-mono-numbers font-bold px-2 py-0.2 rounded-full">
                  {selectedDishesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onChangeView('acumulados')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
                activeView === 'acumulados'
                  ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black shadow-xs'
                  : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#1E1E2D] dark:hover:text-[#00FF66]'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-[#FF6B2C] dark:text-[#00FF66]" />
              <span>Acumulados</span>
            </button>

            <button
              onClick={() => onChangeView('almacen')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
                activeView === 'almacen'
                  ? 'bg-[#1E1E2D] dark:bg-[#00FF66] text-white dark:text-black shadow-xs'
                  : 'text-[#8A8A99] dark:text-[#8E9DBA] hover:text-[#1E1E2D] dark:hover:text-[#00FF66]'
              }`}
            >
              <Warehouse className="w-4 h-4 text-[#FF6B2C] dark:text-[#00FF66]" />
              <span>Almacén</span>
              {warehouseItemsCount > 0 && (
                <span className="bg-[#15803D] dark:bg-[#00FF66] dark:text-black text-white text-[10px] font-mono-numbers font-bold px-2 py-0.2 rounded-full">
                  {warehouseItemsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Botones de Control: Tema Neón + Google Sheets */}
          <div className="flex items-center gap-2">
            {/* Toggle de Tema Oscuro Neón con Detección Automática */}
            <button
              onClick={handleToggleTheme}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                isCurrentlyDark
                  ? 'bg-[#0E1528] text-[#00FF66] border-[#00FF66]/40 shadow-[0_0_10px_rgba(0,255,102,0.25)]'
                  : 'bg-[#FAF7F2] text-[#1E1E2D] border-[#E5E0D8] hover:bg-[#F0E6D8]'
              }`}
              title={`Modo actual: ${
                themeMode === 'auto'
                  ? 'Detección Automática (SO)'
                  : themeMode === 'dark'
                  ? 'Oscuro Neón'
                  : 'Claro'
              } — Haz clic para cambiar`}
            >
              {isCurrentlyDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span className="hidden sm:inline">Neón Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#D97706]" />
                  <span className="hidden sm:inline">Claro</span>
                </>
              )}
              {themeMode === 'auto' && (
                <span className="text-[9px] bg-black/10 dark:bg-[#00FF66]/20 px-1.5 py-0.2 rounded-full uppercase font-mono-numbers">
                  Auto
                </span>
              )}
            </button>

            {onQuickRefresh && (
              <button
                onClick={onQuickRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#13182B] hover:bg-[#F0E6D8] dark:hover:bg-[#1C233D] text-[#1E1E2D] dark:text-[#D1FFD7] border border-[#E5E0D8] dark:border-[#202A44] px-3 py-2 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Actualizar cambios del Sheet en vivo"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#FF6B2C] dark:text-[#00FF66] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar Sheet'}</span>
              </button>
            )}

            <button
              onClick={onOpenSheetsModal}
              className="flex items-center gap-2 bg-[#F0FDF4] dark:bg-[#0E2018] hover:bg-[#DCFCE7] dark:hover:bg-[#153426] text-[#15803D] dark:text-[#00FF66] border border-[#BBF7D0] dark:border-[#00FF66]/30 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Configurar conexión con Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#15803D] dark:text-[#00FF66]" />
              <span className="hidden sm:inline">Google Sheets</span>
              <span className={`w-2 h-2 rounded-full ${isSheetsConnected ? 'bg-[#15803D] dark:bg-[#00FF66]' : 'bg-[#D97706]'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Navegación Inferior Móvil (Mobile-first) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111526]/95 backdrop-blur-md border-t border-[#F0E6D8] dark:border-[#1E2840] px-3 py-2 flex items-center justify-around shadow-lg no-print">
        <button
          onClick={() => onChangeView('platos')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer ${
            activeView === 'platos' ? 'text-[#FF6B2C] dark:text-[#00FF66] font-black' : 'text-[#8A8A99] dark:text-[#8E9DBA]'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeView === 'platos' ? 'bg-[#FFF0E6] dark:bg-[#00FF66]/20' : ''}`}>
            <Utensils className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Platos</span>
        </button>

        <button
          onClick={() => onChangeView('diagrama')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer relative ${
            activeView === 'diagrama' ? 'text-[#FF6B2C] dark:text-[#00FF66] font-black' : 'text-[#8A8A99] dark:text-[#8E9DBA]'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeView === 'diagrama' ? 'bg-[#FFF0E6] dark:bg-[#00FF66]/20' : ''}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Diagrama</span>
          {selectedDishesCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#FF6B2C] dark:bg-[#00FF66] text-white dark:text-black text-[9px] font-bold px-1.5 rounded-full">
              {selectedDishesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onChangeView('acumulados')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer relative ${
            activeView === 'acumulados' ? 'text-[#FF6B2C] dark:text-[#00FF66] font-black' : 'text-[#8A8A99] dark:text-[#8E9DBA]'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeView === 'acumulados' ? 'bg-[#FFF0E6] dark:bg-[#00FF66]/20' : ''}`}>
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Acumulados</span>
        </button>

        <button
          onClick={() => onChangeView('almacen')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer relative ${
            activeView === 'almacen' ? 'text-[#FF6B2C] dark:text-[#00FF66] font-black' : 'text-[#8A8A99] dark:text-[#8E9DBA]'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeView === 'almacen' ? 'bg-[#FFF0E6] dark:bg-[#00FF66]/20' : ''}`}>
            <Warehouse className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Almacén</span>
          {warehouseItemsCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#15803D] dark:bg-[#00FF66] text-white dark:text-black text-[9px] font-bold px-1.5 rounded-full">
              {warehouseItemsCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
