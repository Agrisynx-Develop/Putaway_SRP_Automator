import React from 'react';
import { ArrowRight, ArrowLeftRight, Settings2, RefreshCw } from 'lucide-react';
import { PutAwayDirection } from '../types';

interface TransferConfigPanelProps {
  direction: PutAwayDirection;
  setDirection: (dir: PutAwayDirection) => void;
  locationCode: string;
  setLocationCode: (code: string) => void;
  storageFrom: string;
  setStorageFrom: (code: string) => void;
  storageTo: string;
  setStorageTo: (code: string) => void;
  onApplyToAll: () => void;
  itemCount: number;
}

export const TransferConfigPanel: React.FC<TransferConfigPanelProps> = ({
  direction,
  setDirection,
  locationCode,
  setLocationCode,
  storageFrom,
  setStorageFrom,
  storageTo,
  setStorageTo,
  onApplyToAll,
  itemCount,
}) => {
  // Handle direction switch helper
  const handleDirectionChange = (newDir: PutAwayDirection) => {
    setDirection(newDir);
    if (newDir === 'storage_to_display') {
      setStorageFrom('STORAGE-MAIN');
      setStorageTo('DISPLAY-STORE');
    } else if (newDir === 'display_to_storage') {
      setStorageFrom('DISPLAY-STORE');
      setStorageTo('STORAGE-MAIN');
    }
  };

  const handleSwapLocations = () => {
    const temp = storageFrom;
    setStorageFrom(storageTo);
    setStorageTo(temp);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-400" />
            Pengaturan Jalur & Lokasi Put Away
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih jenis transfer dan lokasi default untuk kolom A, B, C pada file Excel
          </p>
        </div>

        {itemCount > 0 && (
          <button
            type="button"
            onClick={onApplyToAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Terapkan Lokasi ke {itemCount} Item di Tabel</span>
          </button>
        )}
      </div>

      {/* Manual Location Input Fields matching Columns A, B, C */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
        {/* Column A: Location Code */}
        <div className="md:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            (Kolom A) Location Code
          </label>
          <input
            type="text"
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value)}
            placeholder="misal: WH-CENTRAL"
            className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-white font-mono text-xs rounded-lg px-3 py-2 focus:outline-none"
          />
        </div>

        {/* Column B: Storage Location Code From */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            (Kolom B) Location From
          </label>
          <input
            type="text"
            value={storageFrom}
            onChange={(e) => setStorageFrom(e.target.value)}
            placeholder="misal: STORAGE-01"
            className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-emerald-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none"
          />
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-center justify-center pt-4">
          <button
            type="button"
            onClick={handleSwapLocations}
            title="Tukar Asal dan Tujuan"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Column C: Storage Location Code To */}
        <div className="md:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            (Kolom C) Location To
          </label>
          <input
            type="text"
            value={storageTo}
            onChange={(e) => setStorageTo(e.target.value)}
            placeholder="misal: DISPLAY-BEV"
            className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-emerald-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
