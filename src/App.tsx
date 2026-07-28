import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProductSearch } from './components/ProductSearch';
import { TransferConfigPanel } from './components/TransferConfigPanel';
import { PutAwayTable } from './components/PutAwayTable';
import { DatabaseManager } from './components/DatabaseManager';
import { ExportHistory } from './components/ExportHistory';
import { PutAwayGuide } from './components/PutAwayGuide';
import { Product, PutAwayItem, PutAwayDirection, PutAwayHistory } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { exportPutAwayToExcel } from './utils/excelUtils';
import { CheckCircle2, PackageCheck, Layers, ArrowRightLeft, FileSpreadsheet, Sparkles, Menu, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'transfer' | 'database' | 'history' | 'settings'>('transfer');
  const [operatorName, setOperatorName] = useState<string>('Supervisor Teguh');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Master Products Database
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('putaway_master_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('putaway_master_products', JSON.stringify(products));
  }, [products]);

  // Direction & Location Settings
  const [direction, setDirection] = useState<PutAwayDirection>('storage_to_display');
  const [locationCode, setLocationCode] = useState<string>('WH-CENTRAL');
  const [storageFrom, setStorageFrom] = useState<string>('STORAGE-A1');
  const [storageTo, setStorageTo] = useState<string>('DISPLAY-01');

  // Transfer Queue List
  const [transferItems, setTransferItems] = useState<PutAwayItem[]>(() => {
    const saved = localStorage.getItem('putaway_queue_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('putaway_queue_items', JSON.stringify(transferItems));
  }, [transferItems]);

  // Export History
  const [history, setHistory] = useState<PutAwayHistory[]>(() => {
    const saved = localStorage.getItem('putaway_export_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('putaway_export_history', JSON.stringify(history));
  }, [history]);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Add Item to Transfer Queue
  const handleAddToList = (product: Product, quantity: number) => {
    const locCodeToUse = locationCode || product.defaultLocationCode || 'WH-CENTRAL';
    const fromToUse = storageFrom || product.defaultStorageFrom || 'STORAGE-A1';
    const toToUse = storageTo || product.defaultStorageTo || 'DISPLAY-01';

    const existingIndex = transferItems.findIndex(
      (item) =>
        item.itemCode === product.itemCode &&
        item.locationCode === locCodeToUse &&
        item.storageFrom === fromToUse &&
        item.storageTo === toToUse
    );

    if (existingIndex >= 0) {
      const updated = [...transferItems];
      updated[existingIndex].quantity += quantity;
      setTransferItems(updated);
      showToast(`Ditambahkan +${quantity} qty untuk ${product.itemCode}`);
    } else {
      const newItem: PutAwayItem = {
        id: `putaway-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        locationCode: locCodeToUse,
        storageFrom: fromToUse,
        storageTo: toToUse,
        itemCode: product.itemCode,
        itemName: product.itemName,
        quantity: quantity,
      };
      setTransferItems([newItem, ...transferItems]);
      showToast(`Berhasil menambahkan ${product.itemCode} ke daftar Put Away`);
    }
  };

  // Update item in queue
  const handleUpdateQueueItem = (id: string, updatedFields: Partial<PutAwayItem>) => {
    setTransferItems(
      transferItems.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  // Remove item from queue
  const handleRemoveQueueItem = (id: string) => {
    const targetItem = transferItems.find((item) => item.id === id);
    setTransferItems(transferItems.filter((item) => item.id !== id));
    if (targetItem) {
      showToast(`Item ${targetItem.itemCode} dihapus dari daftar`, 'info');
    }
  };

  // Remove multiple items from queue
  const handleRemoveMultipleQueueItems = (ids: string[]) => {
    setTransferItems(transferItems.filter((item) => !ids.includes(item.id)));
    showToast(`${ids.length} item berhasil dihapus dari daftar Put Away`, 'info');
  };

  // Clear queue
  const handleClearQueue = () => {
    setTransferItems([]);
    showToast('Seluruh daftar Put Away berhasil dikosongkan', 'info');
  };

  // Apply location settings to all queue items
  const handleApplyLocationToAll = () => {
    if (transferItems.length === 0) return;
    setTransferItems(
      transferItems.map((item) => ({
        ...item,
        locationCode: locationCode || item.locationCode,
        storageFrom: storageFrom || item.storageFrom,
        storageTo: storageTo || item.storageTo,
      }))
    );
    showToast(`Lokasi berhasil diterapkan ke seluruh ${transferItems.length} item!`);
  };

  // Export to Excel file
  const handleExportExcel = (customFilename: string) => {
    if (transferItems.length === 0) {
      alert('Daftar Put Away masih kosong!');
      return;
    }

    const actualFilename = exportPutAwayToExcel(transferItems, customFilename);

    const totalQty = transferItems.reduce((acc, i) => acc + i.quantity, 0);
    const newRecord: PutAwayHistory = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalItems: transferItems.length,
      totalQuantity: totalQty,
      direction,
      items: [...transferItems],
      filename: actualFilename,
    };

    setHistory([newRecord, ...history]);
    showToast(`File Excel ${actualFilename} berhasil didownload!`);
  };

  // Load history item into transfer queue
  const handleLoadHistoryToTransfer = (record: PutAwayHistory) => {
    setTransferItems(record.items);
    setActiveTab('transfer');
    showToast(`Daftar transfer dimuat dari riwayat ${record.filename}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-sm">Put Away Pro</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-slate-800 text-slate-300 rounded-lg"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Layout (Desktop + Mobile Drawer) */}
      <div className={`fixed inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 transition-transform duration-200 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          productCount={products.length}
          transferCount={transferItems.length}
          operatorName={operatorName}
          setOperatorName={setOperatorName}
        />
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-emerald-400/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden max-w-7xl mx-auto w-full">
        {/* Top Green Welcome Greeting Banner (Exact matching user screenshot style) */}
        <div className="bg-emerald-600 border border-emerald-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
            <FileSpreadsheet className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xl font-bold">
              <span>Halo, {operatorName}!</span>
              <span className="animate-bounce">👋</span>
            </div>
            <p className="text-sm text-emerald-100 mt-1 font-medium max-w-2xl leading-relaxed">
              Selamat datang di asisten otomasi transfer Put Away Anda. Catat pemindahan stok barang antar lokasi dan export hasil langsung ke template Excel (Kolom A s/d F).
            </p>
          </div>
        </div>

        {/* Metric Summary Card (Minimalist - Total Quantity) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL QUANTITY PUT AWAY
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-1">
              {transferItems.reduce((acc, i) => acc + i.quantity, 0)}{' '}
              <span className="text-xs font-sans font-normal text-slate-400">
                Pcs
              </span>
              <span className="text-xs font-sans font-normal text-slate-500 ml-3">
                ({transferItems.length} jenis item)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Akumulasi barang siap di-export
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Tab 1: Transfer Put Away View */}
        {activeTab === 'transfer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Main Form + Preset + Spreadsheet Table */}
            <div className="lg:col-span-8 space-y-6">
              {/* Form Input + Quick Pill Auto-fill */}
              <ProductSearch
                products={products}
                onAddToList={handleAddToList}
                defaultLocationCode={locationCode}
                defaultStorageFrom={storageFrom}
                defaultStorageTo={storageTo}
              />

              {/* Location & Preset Controls */}
              <TransferConfigPanel
                direction={direction}
                setDirection={setDirection}
                locationCode={locationCode}
                setLocationCode={setLocationCode}
                storageFrom={storageFrom}
                setStorageFrom={setStorageFrom}
                storageTo={storageTo}
                setStorageTo={setStorageTo}
                onApplyToAll={handleApplyLocationToAll}
                itemCount={transferItems.length}
              />

              {/* Excel Spreadsheet Preview Table */}
              <PutAwayTable
                items={transferItems}
                onUpdateItem={handleUpdateQueueItem}
                onRemoveItem={handleRemoveQueueItem}
                onRemoveMultipleItems={handleRemoveMultipleQueueItems}
                onClearAll={handleClearQueue}
                onExportExcel={handleExportExcel}
              />
            </div>

            {/* Right 4 Cols: Operator Step Guide & Info */}
            <div className="lg:col-span-4 space-y-6">
              <PutAwayGuide />
            </div>
          </div>
        )}

        {/* Tab 2: Master Product Database */}
        {activeTab === 'database' && (
          <DatabaseManager
            products={products}
            setProducts={setProducts}
            onAddQuickToTransfer={(prod, qty) => {
              handleAddToList(prod, qty);
              setActiveTab('transfer');
            }}
          />
        )}

        {/* Tab 3: History & Closing */}
        {activeTab === 'history' && (
          <ExportHistory
            history={history}
            onClearHistory={() => setHistory([])}
            onLoadHistoryItemsToTransfer={handleLoadHistoryToTransfer}
          />
        )}
      </main>
    </div>
  );
}
