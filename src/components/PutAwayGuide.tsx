import React from 'react';
import { BookOpen, CheckCircle2, ArrowRight, FileSpreadsheet, Download } from 'lucide-react';

export const PutAwayGuide: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-xl space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Panduan Put Away Operator</h3>
          <p className="text-[11px] text-slate-400">Langkah mudah membuat file transfer Excel</p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
            1
          </div>
          <div>
            <div className="font-bold text-slate-200">Cari / Scan Produk</div>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Ketik Kode Produk (misal: <span className="text-emerald-400 font-mono">PRD-1001</span>) atau Nama Produk, atau klik pill tombol cepat.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
            2
          </div>
          <div>
            <div className="font-bold text-slate-200">Atur Jalur & Lokasi</div>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Pilih preset <span className="text-emerald-300">Storage ke Display</span> atau <span className="text-emerald-300">Display ke Storage</span> untuk mengisikan Kolom A, B, C secara otomatis.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
            3
          </div>
          <div>
            <div className="font-bold text-slate-200">Periksa Tabel Spreadsheet</div>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Verifikasi Quantity & Lokasi pada preview tabel sebelum mendownload file Excel.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
            4
          </div>
          <div>
            <div className="font-bold text-slate-200">Download Output Excel (.xlsx)</div>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Klik tombol download untuk mendapatkan file Excel dengan susunan Kolom A sampai F (dengan Nama Item di Kolom F).
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Template Sesuai Standar
          </span>
          <span className="font-mono text-amber-300 font-bold">A - F Ready</span>
        </div>
      </div>
    </div>
  );
};
