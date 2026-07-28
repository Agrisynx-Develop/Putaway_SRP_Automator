import React from 'react';
import { Layers, Database, History, FileSpreadsheet, PlusCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'transfer' | 'database' | 'history';
  setActiveTab: (tab: 'transfer' | 'database' | 'history') => void;
  productCount: number;
  transferCount: number;
  onOpenQuickAdd?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  productCount,
  transferCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                  Otomasi Transfer Put Away
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Excel WMS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sistem Pemindahan Stok & Export Template Excel
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-transfer-btn"
              onClick={() => setActiveTab('transfer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'transfer'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Transfer Put Away</span>
              {transferCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'transfer' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {transferCount}
                </span>
              )}
            </button>

            <button
              id="tab-database-btn"
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'database'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database Produk</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'database' ? 'bg-slate-800 text-slate-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {productCount}
              </span>
            </button>

            <button
              id="tab-history-btn"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Export</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
