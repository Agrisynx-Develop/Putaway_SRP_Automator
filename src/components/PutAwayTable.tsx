import React, { useState } from 'react';
import { Download, Trash2, Edit2, Check, FileSpreadsheet, Plus, Minus, AlertCircle, ArrowUpRight } from 'lucide-react';
import { PutAwayItem } from '../types';

interface PutAwayTableProps {
  items: PutAwayItem[];
  onUpdateItem: (id: string, updatedFields: Partial<PutAwayItem>) => void;
  onRemoveItem: (id: string) => void;
  onRemoveMultipleItems?: (ids: string[]) => void;
  onClearAll: () => void;
  onExportExcel: (customFilename: string) => void;
}

export const PutAwayTable: React.FC<PutAwayTableProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
  onRemoveMultipleItems,
  onClearAll,
  onExportExcel,
}) => {
  const [filename, setFilename] = useState(`PutAway_Transfer_${new Date().toISOString().slice(0, 10)}`);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const totalQuantity = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  // Checkbox select all handler
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    if (onRemoveMultipleItems) {
      onRemoveMultipleItems(selectedIds);
    } else {
      selectedIds.forEach((id) => onRemoveItem(id));
    }
    setSelectedIds([]);
  };

  const handleRemoveSingleRow = (id: string, itemName: string) => {
    onRemoveItem(id);
    setSelectedIds((prev) => prev.filter((sId) => sId !== id));
  };

  const handleClearAllRows = () => {
    onClearAll();
    setSelectedIds([]);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              Tabel Hasil Put Away (Preview Spreadsheet)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Format susunan kolom A - F disesuaikan dengan template Excel yang diminta.
          </p>
        </div>

        {/* Summary badges & Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">Total Jenis Item: </span>
            <strong className="text-emerald-400 font-bold ml-1">{items.length}</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">Total Quantity: </span>
            <strong className="text-emerald-400 font-bold ml-1">{totalQuantity} pcs</strong>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveSelected}
              className="text-xs text-white font-bold bg-rose-600 hover:bg-rose-500 border border-rose-500 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition animate-pulse"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length}) Terpilih</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllRows}
              className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
              title="Kosongkan seluruh isi tabel Put Away"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Header Bar mimicking Excel */}
      <div className="bg-amber-950/20 border-b border-amber-900/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span className="font-mono text-[11px]">Sheet1 &bull; Column A to F Template</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Centang item untuk hapus sekaligus &bull; Kolom F: Nama Item
        </span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-2 w-10 text-center bg-slate-900/50 border-r border-slate-800">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500 cursor-pointer w-3.5 h-3.5"
                  title="Pilih Semua / Batal Pilih"
                />
              </th>
              <th className="py-3 px-3 w-12 text-center text-slate-500 bg-slate-900/50 border-r border-slate-800">
                Row
              </th>
              <th className="py-3 px-4 font-bold text-amber-400 bg-slate-900/30 border-r border-slate-800/60">
                A: Location Code
              </th>
              <th className="py-3 px-4 font-bold text-emerald-400 bg-slate-900/30 border-r border-slate-800/60">
                B: Storage Location Code From
              </th>
              <th className="py-3 px-4 font-bold text-emerald-400 bg-slate-900/30 border-r border-slate-800/60">
                C: Storage Location Code To
              </th>
              <th className="py-3 px-4 font-bold text-blue-400 bg-slate-900/30 border-r border-slate-800/60">
                D: Item Codes
              </th>
              <th className="py-3 px-4 font-bold text-amber-300 bg-slate-900/30 border-r border-slate-800/60 text-right">
                E: Quantities
              </th>
              <th className="py-3 px-4 font-bold text-purple-300 bg-slate-900/30 border-r border-slate-800/60">
                F: Item Name (Baris F)
              </th>
              <th className="py-3 px-3 text-center text-slate-500 w-20">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 bg-slate-950/40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium text-slate-400">
                      Belum ada item dalam daftar Put Away.
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Gunakan fitur pencarian produk di atas atau pilih dari database produk untuk menambahkan item.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const isEditing = editingId === item.id;
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      isSelected
                        ? 'bg-rose-950/20 border-l-2 border-l-rose-500 hover:bg-rose-950/30'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Checkbox Select */}
                    <td className="py-3 px-2 text-center bg-slate-950/40 border-r border-slate-800">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(item.id)}
                        className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500 cursor-pointer w-3.5 h-3.5"
                      />
                    </td>

                    {/* Excel Row Index */}
                    <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px] bg-slate-950/60 border-r border-slate-800">
                      {index + 2}
                    </td>

                    {/* Column A: Location Code */}
                    <td className="py-2.5 px-4 font-mono font-medium text-amber-200 border-r border-slate-800/40">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.locationCode}
                          onChange={(e) =>
                            onUpdateItem(item.id, { locationCode: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-200 focus:outline-none"
                        />
                      ) : (
                        item.locationCode
                      )}
                    </td>

                    {/* Column B: Storage Location Code From */}
                    <td className="py-2.5 px-4 font-mono text-emerald-300 border-r border-slate-800/40">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.storageFrom}
                          onChange={(e) =>
                            onUpdateItem(item.id, { storageFrom: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-300 focus:outline-none"
                        />
                      ) : (
                        item.storageFrom
                      )}
                    </td>

                    {/* Column C: Storage Location Code To */}
                    <td className="py-2.5 px-4 font-mono text-emerald-300 border-r border-slate-800/40">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.storageTo}
                          onChange={(e) =>
                            onUpdateItem(item.id, { storageTo: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-300 focus:outline-none"
                        />
                      ) : (
                        item.storageTo
                      )}
                    </td>

                    {/* Column D: Item Codes */}
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-400 border-r border-slate-800/40">
                      {item.itemCode}
                    </td>

                    {/* Column E: Quantities */}
                    <td className="py-2.5 px-4 text-right border-r border-slate-800/40">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateItem(item.id, {
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            onUpdateItem(item.id, {
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-14 bg-slate-950 border border-slate-700 rounded text-center py-0.5 text-xs font-bold text-amber-300 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateItem(item.id, { quantity: item.quantity + 1 })
                          }
                          className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Column F: Item Name */}
                    <td className="py-2.5 px-4 font-medium text-slate-100 border-r border-slate-800/40">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) =>
                            onUpdateItem(item.id, { itemName: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      ) : (
                        item.itemName
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(isEditing ? null : item.id)}
                          className={`p-1 rounded transition ${
                            isEditing
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title={isEditing ? 'Selesai Edit' : 'Edit Lokasi/Nama'}
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveSingleRow(item.id, item.itemName)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                          title="Hapus Baris Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Export Action Footer */}
      <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <label className="text-xs text-slate-400 font-medium shrink-0">Nama File Export:</label>
          <div className="relative flex-1">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-3 pr-12 py-2.5 font-mono focus:outline-none"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">.xlsx</span>
          </div>
        </div>

        <button
          id="export-excel-btn"
          type="button"
          disabled={items.length === 0}
          onClick={() => onExportExcel(filename)}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01]"
        >
          <Download className="w-4 h-4" />
          <span>Download Output Excel (.xlsx)</span>
        </button>
      </div>
    </div>
  );
};
