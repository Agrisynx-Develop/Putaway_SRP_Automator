import React from 'react';
import { 
  FileSpreadsheet, 
  Layers, 
  Database, 
  History, 
  ArrowRightLeft, 
  Settings, 
  User, 
  ChevronRight,
  PackageCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'transfer' | 'database' | 'history' | 'settings';
  setActiveTab: (tab: 'transfer' | 'database' | 'history' | 'settings') => void;
  productCount: number;
  transferCount: number;
  operatorName: string;
  setOperatorName: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  productCount,
  transferCount,
  operatorName,
  setOperatorName,
}) => {
  const [isEditingUser, setIsEditingUser] = React.useState(false);
  const [tempUser, setTempUser] = React.useState(operatorName);

  const handleSaveUser = () => {
    if (tempUser.trim()) {
      setOperatorName(tempUser.trim());
    }
    setIsEditingUser(false);
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-950/50">
            <FileSpreadsheet className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Put Away Pro
            </h1>
            <p className="text-[11px] text-emerald-400 font-semibold tracking-wide uppercase mt-1">
              TEGUH GUNTORO | MT SRAP BATCH 2
            </p>
          </div>
        </div>
      </div>

      {/* Operator Profile Card */}
      <div className="p-4 mx-3 my-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              {isEditingUser ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempUser}
                    onChange={(e) => setTempUser(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 text-white text-xs px-1.5 py-0.5 rounded focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUser}
                    className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-xs font-bold text-white truncate">
                    {operatorName}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                    SUPERVISOR WAREHOUSE
                  </div>
                </>
              )}
            </div>
          </div>

          {!isEditingUser && (
            <button
              type="button"
              onClick={() => setIsEditingUser(true)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-2 py-1 rounded border border-slate-700 transition"
            >
              Ganti
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Menu Utama
        </div>

        <button
          id="sidebar-transfer-tab"
          type="button"
          onClick={() => setActiveTab('transfer')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'transfer'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4" />
            <span>Transfer Put Away</span>
          </div>
          {transferCount > 0 ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'transfer'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {transferCount}
            </span>
          ) : (
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          )}
        </button>

        <button
          id="sidebar-database-tab"
          type="button"
          onClick={() => setActiveTab('database')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'database'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4" />
            <span>Database Produk</span>
          </div>
          <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
            {productCount}
          </span>
        </button>

        <button
          id="sidebar-history-tab"
          type="button"
          onClick={() => setActiveTab('history')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <History className="w-4 h-4" />
            <span>Riwayat & Closing</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        </button>

        <div className="pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Sistem & Output
        </div>

        <div className="mx-1 p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Template Format:</span>
            <span className="text-emerald-400 font-mono font-bold">Kolom A-F</span>
          </div>
          <div className="text-[10px] text-slate-500 leading-relaxed">
            Pilihan Put Away Storage ➔ Display & sebaliknya dengan output file .xlsx resmi.
          </div>
        </div>
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        <span>Otomasi Transfer Put Away &bull; WMS</span>
      </div>
    </aside>
  );
};
