'use client';

import React, { useState } from 'react';
import { AppConfig, AppUser } from '@/repositories/types';
import { useToast } from '@/components/ui/Toast';
import { Settings, X, Users, Home, Key, ShieldCheck, Database, Save } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  users: AppUser[];
  onSaveConfig: (updated: Partial<AppConfig>) => void;
}

export function ConfigModal({
  isOpen,
  onClose,
  config,
  users,
  onSaveConfig,
}: ConfigModalProps) {
  const [householdName, setHouseholdName] = useState<string>(config.householdName);
  const [defaultDiners, setDefaultDiners] = useState<number>(config.defaultDiners);
  const [currencySymbol, setCurrencySymbol] = useState<string>(config.currencySymbol);
  const [daysMode, setDaysMode] = useState<5 | 7>(config.daysMode);
  const [openRouterKey, setOpenRouterKey] = useState<string>(config.openRouterApiKey || '');
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      householdName: householdName.trim() || 'Mi Hogar Criollo',
      defaultDiners: Number(defaultDiners) || 4,
      currencySymbol: currencySymbol.trim() || 'S/',
      daysMode,
      openRouterApiKey: openRouterKey.trim() || undefined,
    });
    showToast('Ajustes del hogar actualizados correctamente');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E0D8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#FAF7F2] p-4 border-b border-[#EFE8DD] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#C2410C]" />
            <h3 className="font-serif-gastronomy text-lg font-bold text-[#1F2937]">
              Configuración de Mesa Semanal
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#1F2937] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Banner de Estado de Almacenamiento */}
          <div className="bg-[#FEF3C7] border border-[#F59E0B]/40 rounded-xl p-3 flex items-start gap-2.5">
            <Database className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <div className="text-xs text-[#78350F]">
              <strong className="font-bold block">Modo Local Activo (Navegador)</strong>
              <span>
                Tus datos se guardan en este dispositivo. Para sincronizar en la nube con Google Sheets,
                configura tus variables en <code className="bg-white/80 px-1 py-0.5 rounded text-[11px]">.env.local</code>.
              </span>
            </div>
          </div>

          {/* Nombre del Hogar */}
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Nombre del Hogar o Familia
            </label>
            <div className="relative">
              <Home className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="Ej. Familia De la Cruz"
                className="w-full bg-[#FAF7F2] border border-[#D5C5B2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1F2937] focus:border-[#D97706] focus:outline-none"
              />
            </div>
          </div>

          {/* Comensales y Moneda */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Comensales Habituales
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={defaultDiners}
                  onChange={(e) => setDefaultDiners(Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#D5C5B2] rounded-xl pl-9 pr-3 py-2 text-xs font-mono-numbers text-[#1F2937]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                Moneda
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="S/"
                className="w-full bg-[#FAF7F2] border border-[#D5C5B2] rounded-xl px-3 py-2 text-xs font-bold text-[#1F2937]"
              />
            </div>
          </div>

          {/* Días por semana */}
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
              Horizonte del Planificador:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDaysMode(7)}
                className={`py-2 px-3 rounded-xl border font-bold cursor-pointer transition-colors ${
                  daysMode === 7
                    ? 'bg-[#1F2937] text-white border-[#1F2937]'
                    : 'bg-[#FAF7F2] text-[#4B5563] border-[#D5C5B2]'
                }`}
              >
                7 Días (Lunes a Domingo)
              </button>
              <button
                type="button"
                onClick={() => setDaysMode(5)}
                className={`py-2 px-3 rounded-xl border font-bold cursor-pointer transition-colors ${
                  daysMode === 5
                    ? 'bg-[#1F2937] text-white border-[#1F2937]'
                    : 'bg-[#FAF7F2] text-[#4B5563] border-[#D5C5B2]'
                }`}
              >
                5 Días (Lunes a Viernes)
              </button>
            </div>
          </div>

          {/* Clave OpenRouter para IA opcional */}
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] mb-1">
              Clave de API OpenRouter (Opcional para IA)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-[#FAF7F2] border border-[#D5C5B2] rounded-xl pl-9 pr-3 py-2 text-xs font-mono-numbers text-[#1F2937]"
              />
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Si no configuras una clave, el sistema utiliza un motor heurístico local sin costo.
            </p>
          </div>

          {/* Miembros del Hogar */}
          <div className="border-t border-[#F5EFE6] pt-3">
            <span className="text-xs font-bold text-[#78350F] block mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              Miembros con acceso (Control de Roles):
            </span>
            <div className="space-y-1.5 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EFE8DD]">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1F2937]">{u.name}</span>
                    <span className="text-[11px] text-[#9CA3AF] ml-1.5">({u.email})</span>
                  </div>
                  <span className="bg-white border border-[#D5C5B2] text-[#C2410C] font-bold text-[10px] px-2 py-0.5 rounded-md capitalize">
                    {u.role}
                  </span>
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
              Cerrar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#15803D] hover:bg-[#166534] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
