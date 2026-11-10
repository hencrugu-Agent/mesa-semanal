'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { X, Link, RefreshCw, CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSheetUrl: string;
  onSyncSheet: (urlOrId: string) => Promise<boolean>;
  lastSyncTime?: string;
}

export function GoogleSheetSyncModal({
  isOpen,
  onClose,
  currentSheetUrl,
  onSyncSheet,
  lastSyncTime,
}: GoogleSheetSyncModalProps) {
  const [urlInput, setUrlInput] = useState<string>(currentSheetUrl || '');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      showToast('Ingresa el enlace o ID de tu Google Sheet', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const ok = await onSyncSheet(urlInput.trim());
      if (ok) {
        showToast('¡Platos e ingredientes sincronizados desde Google Sheets!');
        onClose();
      } else {
        showToast('No se pudo leer la hoja. Asegúrate de que esté compartida o publicada.', 'error');
      }
    } catch {
      showToast('Error de conexión con Google Sheets', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-lg w-full border border-[#F0E6D8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#FAF7F2] p-5 border-b border-[#EFE8DD] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1E1E2D]">
                Conexión con Google Sheets
              </h3>
              <p className="text-[11px] text-[#8A8A99]">
                Base de datos gratuita de platos e ingredientes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8A8A99] hover:text-[#1E1E2D] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSync} className="p-5 space-y-4">
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
            <div className="text-xs text-[#166534]">
              <strong className="font-bold block">100% Gratuito y sin claves complejas</strong>
              <span>
                Crea una hoja de cálculo en Google Sheets con tus platos e ingredientes, compártela como pública (&quot;Cualquier persona con el enlace puede leer&quot;) o publícala en la web, ¡y pega el enlace aquí!
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">
              Enlace o ID de tu Google Sheet:
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-[#8A8A99] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X..."
                className="w-full bg-[#FAF7F2] border border-[#D5C5B2] rounded-2xl pl-9 pr-3 py-2.5 text-xs text-[#1E1E2D] focus:outline-none focus:border-[#FF6B2C]"
              />
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DD] text-[11px] text-[#8A8A99] space-y-1">
            <span className="font-bold text-[#1E1E2D] block">Columnas que debe tener tu hoja:</span>
            <code>Nombre_Plato, Categoria, Tiempo_Min, Precio_Soles, Imagen, Ingredientes</code>
            <p className="pt-1">
              *En &quot;Ingredientes&quot; puedes escribir en texto libre: <em>Pechuga de pollo 150g, Arroz extra 75g, Papa amarilla 150g...</em>
            </p>
          </div>

          {lastSyncTime && (
            <div className="text-[11px] text-[#8A8A99] text-center">
              Última sincronización: {lastSyncTime}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#8A8A99] hover:text-[#1E1E2D]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#FF6B2C] hover:bg-[#FA5A2A] text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
