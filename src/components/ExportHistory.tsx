import React from 'react';
import { History, Download, Trash2, Calendar, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { PutAwayHistory } from '../types';
import { exportPutAwayToExcel } from '../utils/excelUtils';

interface ExportHistoryProps {
  history: PutAwayHistory[];
  onClearHistory: () => void;
  onLoadHistoryItemsToTransfer: (history: PutAwayHistory) => void;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({
  history,
  onClearHistory,
  onLoadHistoryItemsToTransfer,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Riwayat Export File Excel Put Away
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar file Excel Put Away yang telah didownload sebelumnya.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Riwayat</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          Belum ada riwayat export. Lakukan export file Excel dari tab Transfer Put Away.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {record.filename}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono">
                      {record.totalItems} Items ({record.totalQuantity} pcs)
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(record.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportPutAwayToExcel(record.items, record.filename)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ulang</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLoadHistoryItemsToTransfer(record)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <span>Muat ke Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
