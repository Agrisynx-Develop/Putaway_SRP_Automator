import React, { useState, useRef } from 'react';
import { Database, Upload, Download, Plus, Search, Trash2, Edit2, Check, RefreshCw, ArrowRightLeft, ArrowRight, ArrowLeft, PackageCheck, Layers, Eye } from 'lucide-react';
import { Product } from '../types';
import { exportProductDatabaseTemplate, parseProductDatabaseExcel } from '../utils/excelUtils';

interface DatabaseManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onAddQuickToTransfer?: (product: Product, qty: number) => void;
  onDirectTransfer?: (product: Product, quantity: number, transferType: 'B_TO_A' | 'A_TO_B') => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  products,
  setProducts,
  onAddQuickToTransfer,
  onDirectTransfer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Per-row transfer quantity state
  const [rowQuantities, setRowQuantities] = useState<Record<string, number>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    itemCode: '',
    itemName: '',
    category: 'DAGING SEGAR REGULER',
    uom: 'KG',
    defaultLocationCode: '007',
    stockStorage: 100,
    stockDisplay: 20,
  });

  // Calculate real-time totals
  const totalDisplayStock = products.reduce((acc, p) => acc + (p.stockDisplay || 0), 0);
  const totalStorageStock = products.reduce((acc, p) => acc + (p.stockStorage || 0), 0);

  // Filter products
  const categories = Array.from(
    new Set(products.map((p) => p.category || 'DAGING'))
  );

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.itemCode.toLowerCase().includes(term) ||
      p.itemName.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.toLowerCase().includes(term)) ||
      (p.uom && p.uom.toLowerCase().includes(term));
    const matchesCategory =
      categoryFilter === 'all' || (p.category || 'DAGING') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Membaca & Memproses file Excel database...');
      const importedProducts = await parseProductDatabaseExcel(file);

      if (importedProducts.length === 0) {
        setUploadStatus('Gagal: File Excel tidak berisi data produk yang valid.');
        return;
      }

      setProducts(importedProducts);
      setUploadStatus(`Berhasil mengimpor ${importedProducts.length} produk dengan stok real-time!`);
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setUploadStatus('Error saat membaca file Excel. Pastikan format sesuai.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.itemCode || !newProduct.itemName) return;

    let baseLoc = (newProduct.defaultLocationCode || '007').trim();
    if (baseLoc.endsWith('A') || baseLoc.endsWith('B')) {
      baseLoc = baseLoc.slice(0, -1);
    }

    const created: Product = {
      id: `prod-manual-${Date.now()}`,
      itemCode: newProduct.itemCode.trim(),
      itemName: newProduct.itemName.trim(),
      category: newProduct.category || 'DAGING',
      uom: newProduct.uom || 'KG',
      defaultLocationCode: baseLoc,
      defaultStorageFrom: `${baseLoc}B`,
      defaultStorageTo: `${baseLoc}A`,
      stockStorage: Number(newProduct.stockStorage) || 0,
      stockDisplay: Number(newProduct.stockDisplay) || 0,
    };

    setProducts([created, ...products]);
    setIsAddingNew(false);
    setNewProduct({
      itemCode: '',
      itemName: '',
      category: 'DAGING SEGAR REGULER',
      uom: 'KG',
      defaultLocationCode: '007',
      stockStorage: 100,
      stockDisplay: 20,
    });
  };

  const handleUpdateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleQtyChange = (productId: string, val: number) => {
    setRowQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, val || 1),
    }));
  };

  const handleExecuteTransfer = (p: Product, type: 'B_TO_A' | 'A_TO_B') => {
    const qty = rowQuantities[p.id] || 1;
    if (onDirectTransfer) {
      onDirectTransfer(p, qty, type);
    } else if (onAddQuickToTransfer) {
      onAddQuickToTransfer(p, qty);
    }
  };

  // Helper to extract base location code
  const getBaseLoc = (loc?: string) => {
    let clean = (loc || '007').trim();
    if (clean.endsWith('A') || clean.endsWith('B')) {
      clean = clean.slice(0, -1);
    }
    return clean || '007';
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stock Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Master Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL MASTER PRODUK
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {products.length.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-slate-400">
                Jenis Item
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Database master tersimpan
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Real-Time Display Stock (A) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>TABEL A: STOK DISPLAY (+A)</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {totalDisplayStock.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-slate-400">
                Pcs / Unit
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Area Rak Display Toko
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Real-Time Storage Stock (B) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>TABEL B: STOK STORAGE (+B)</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
              {totalStorageStock.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-slate-400">
                Pcs / Unit
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Gudang Penyimpanan Utama
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Banner & Excel Upload Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Database Produk Master & Transfer Real-Time
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Melihat stok Display (A) & Storage (B) secara real-time, serta langsung transfer dari database ke tabel hasil Put Away.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              id="upload-excel-db-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Import Database Excel</span>
            </button>

            <button
              type="button"
              onClick={exportProductDatabaseTemplate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Template Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Input Manual</span>
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Manual Product Creation Form */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateProduct}
          className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Tambah Produk Baru ke Database
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kode Produk (Item Code) *
              </label>
              <input
                type="text"
                required
                value={newProduct.itemCode}
                onChange={(e) => setNewProduct({ ...newProduct, itemCode: e.target.value })}
                placeholder="misal: 100001"
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nama Produk (Description) *
              </label>
              <input
                type="text"
                required
                value={newProduct.itemName}
                onChange={(e) => setNewProduct({ ...newProduct, itemName: e.target.value })}
                placeholder="misal: DAGING RENDANG POTONG FRESH KG"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                placeholder="misal: DAGING SEGAR"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Satuan (UOM)
              </label>
              <input
                type="text"
                value={newProduct.uom}
                onChange={(e) => setNewProduct({ ...newProduct, uom: e.target.value })}
                placeholder="KG / PCS"
                className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kode Lokasi (Base Loc)
              </label>
              <input
                type="text"
                value={newProduct.defaultLocationCode}
                onChange={(e) => setNewProduct({ ...newProduct, defaultLocationCode: e.target.value })}
                placeholder="007"
                className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stok Awal Display (Tabel A)
              </label>
              <input
                type="number"
                value={newProduct.stockDisplay}
                onChange={(e) => setNewProduct({ ...newProduct, stockDisplay: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stok Awal Storage (Tabel B)
              </label>
              <input
                type="number"
                value={newProduct.stockStorage}
                onChange={(e) => setNewProduct({ ...newProduct, stockStorage: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow"
            >
              Simpan Produk Baru
            </button>
          </div>
        </form>
      )}

      {/* Database Search & Category Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari dalam database (Kode Produk, Barcode, atau Nama)..."
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:border-emerald-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="text-xs text-slate-400 whitespace-nowrap bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800">
            Total: <strong>{filteredProducts.length}</strong> produk
          </div>
        </div>
      </div>

      {/* Database Table with A (Display) and B (Storage) Real-time columns */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px] uppercase">
                <th className="p-3">Item Code</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Description / Nama Produk</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">UOM</th>
                {/* Column A: Display */}
                <th className="p-3 text-center bg-emerald-950/30 border-x border-slate-800 text-emerald-400">
                  <div className="font-bold">A (DISPLAY)</div>
                  <div className="text-[9px] text-slate-400 font-sans normal-case">Stok & Kode +A</div>
                </th>
                {/* Column B: Storage */}
                <th className="p-3 text-center bg-cyan-950/30 border-r border-slate-800 text-cyan-300">
                  <div className="font-bold">B (STORAGE)</div>
                  <div className="text-[9px] text-slate-400 font-sans normal-case">Stok & Kode +B</div>
                </th>
                {/* Direct Transfer Column */}
                <th className="p-3 text-center bg-slate-950">
                  <div className="font-bold text-amber-300">LANGSUNG PUT AWAY</div>
                  <div className="text-[9px] text-slate-400 font-sans normal-case">Transfer Database ➔ List</div>
                </th>
                <th className="p-3 text-center">Aksi Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Tidak ada data produk ditemukan dalam database.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isEditing = editingId === p.id;
                  const baseLoc = getBaseLoc(p.defaultLocationCode);
                  const displayLocCode = `${baseLoc}A`;
                  const storageLocCode = `${baseLoc}B`;
                  const rowQty = rowQuantities[p.id] || 1;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/60 transition">
                      {/* Item Code */}
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {p.itemCode}
                      </td>

                      {/* Barcode */}
                      <td className="p-3 font-mono text-slate-400 text-[11px]">
                        {p.barcode || '-'}
                      </td>

                      {/* Item Name */}
                      <td className="p-3 font-medium text-white max-w-[240px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={p.itemName}
                            onChange={(e) => handleUpdateProduct(p.id, { itemName: e.target.value })}
                            className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-white w-full"
                          />
                        ) : (
                          p.itemName
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={p.category || ''}
                            onChange={(e) => handleUpdateProduct(p.id, { category: e.target.value })}
                            className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-white w-24"
                          />
                        ) : (
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] truncate inline-block max-w-[110px]">
                            {p.category || 'DAGING'}
                          </span>
                        )}
                      </td>

                      {/* UOM */}
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={p.uom || ''}
                            onChange={(e) => handleUpdateProduct(p.id, { uom: e.target.value })}
                            className="bg-slate-950 border border-slate-700 text-xs px-1.5 py-1 rounded text-amber-300 font-mono w-14"
                          />
                        ) : (
                          <span className="font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 text-[11px]">
                            {p.uom || 'KG'}
                          </span>
                        )}
                      </td>

                      {/* TABEL A: Display Stock & Location Code +A */}
                      <td className="p-3 text-center bg-emerald-950/20 border-x border-slate-800/80">
                        {isEditing ? (
                          <input
                            type="number"
                            value={p.stockDisplay ?? 0}
                            onChange={(e) => handleUpdateProduct(p.id, { stockDisplay: Number(e.target.value) })}
                            className="bg-slate-950 border border-emerald-500 text-emerald-400 font-mono text-xs px-1.5 py-1 rounded w-16 text-center"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {(p.stockDisplay ?? 0).toLocaleString()}{' '}
                              <span className="text-[10px] font-normal text-slate-400">{p.uom || 'Pcs'}</span>
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                              {displayLocCode}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* TABEL B: Storage Stock & Location Code +B */}
                      <td className="p-3 text-center bg-cyan-950/20 border-r border-slate-800/80">
                        {isEditing ? (
                          <input
                            type="number"
                            value={p.stockStorage ?? 0}
                            onChange={(e) => handleUpdateProduct(p.id, { stockStorage: Number(e.target.value) })}
                            className="bg-slate-950 border border-cyan-500 text-cyan-300 font-mono text-xs px-1.5 py-1 rounded w-16 text-center"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-mono font-bold text-cyan-300 text-sm">
                              {(p.stockStorage ?? 0).toLocaleString()}{' '}
                              <span className="text-[10px] font-normal text-slate-400">{p.uom || 'Pcs'}</span>
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                              {storageLocCode}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Direct Transfer Action Column */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Qty Input */}
                          <input
                            type="number"
                            min="1"
                            value={rowQty}
                            onChange={(e) => handleQtyChange(p.id, Number(e.target.value))}
                            className="w-12 bg-slate-950 border border-slate-700 rounded-lg px-1 py-1 text-center font-mono font-bold text-amber-300 text-xs focus:border-emerald-500 focus:outline-none"
                            title="Jumlah Qty untuk ditransfer"
                          />

                          {/* Button B -> A (Storage to Display) */}
                          <button
                            type="button"
                            onClick={() => handleExecuteTransfer(p, 'B_TO_A')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow transition group"
                            title={`Put Away Storage (${storageLocCode}) ➔ Display (${displayLocCode})`}
                          >
                            <span>B ➔ A</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          {/* Button A -> B (Display to Storage) */}
                          <button
                            type="button"
                            onClick={() => handleExecuteTransfer(p, 'A_TO_B')}
                            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow transition group"
                            title={`Put Away Display (${displayLocCode}) ➔ Storage (${storageLocCode})`}
                          >
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                            <span>A ➔ B</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(isEditing ? null : p.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                            title="Edit Produk"
                          >
                            {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                            title="Hapus Produk dari Database"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};
