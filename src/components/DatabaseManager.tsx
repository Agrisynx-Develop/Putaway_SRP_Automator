import React, { useState, useRef } from 'react';
import { Database, Upload, Download, Plus, Search, Trash2, Edit2, Check, RefreshCw, FileSpreadsheet, Package, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { exportProductDatabaseTemplate, parseProductDatabaseExcel } from '../utils/excelUtils';

interface DatabaseManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onAddQuickToTransfer: (product: Product, qty: number) => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  products,
  setProducts,
  onAddQuickToTransfer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    itemCode: '',
    itemName: '',
    category: 'Sembako',
    defaultLocationCode: 'WH-CENTRAL',
    defaultStorageFrom: 'STORAGE-A1',
    defaultStorageTo: 'DISPLAY-01',
    stockStorage: 100,
    stockDisplay: 10,
  });

  // Filter products
  const categories = Array.from(
    new Set(products.map((p) => p.category || 'Umum'))
  );

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.itemCode.toLowerCase().includes(term) ||
      p.itemName.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.toLowerCase().includes(term)) ||
      (p.uom && p.uom.toLowerCase().includes(term));
    const matchesCategory =
      categoryFilter === 'all' || (p.category || 'Umum') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Membaca & Memproses file Excel...');
      const importedProducts = await parseProductDatabaseExcel(file);

      if (importedProducts.length === 0) {
        setUploadStatus('Gagal: File Excel tidak berisi data produk yang valid.');
        return;
      }

      setProducts(importedProducts);
      setUploadStatus(`Berhasil mengimpor ${importedProducts.length} produk dari Excel!`);
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

    const created: Product = {
      id: `prod-manual-${Date.now()}`,
      itemCode: newProduct.itemCode.trim(),
      itemName: newProduct.itemName.trim(),
      category: newProduct.category || 'Umum',
      defaultLocationCode: newProduct.defaultLocationCode || 'WH-CENTRAL',
      defaultStorageFrom: newProduct.defaultStorageFrom || 'STORAGE-A1',
      defaultStorageTo: newProduct.defaultStorageTo || 'DISPLAY-01',
      stockStorage: Number(newProduct.stockStorage) || 0,
      stockDisplay: Number(newProduct.stockDisplay) || 0,
    };

    setProducts([created, ...products]);
    setIsAddingNew(false);
    setNewProduct({
      itemCode: '',
      itemName: '',
      category: 'Sembako',
      defaultLocationCode: 'WH-CENTRAL',
      defaultStorageFrom: 'STORAGE-A1',
      defaultStorageTo: 'DISPLAY-01',
      stockStorage: 100,
      stockDisplay: 10,
    });
  };

  const handleUpdateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Excel Upload Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Kelola Database Produk Master
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload file Excel database produk Anda atau tambahkan produk baru secara manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload Excel Button */}
            <button
              id="upload-excel-db-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Import Database dari Excel</span>
            </button>

            {/* Download Template Button */}
            <button
              type="button"
              onClick={exportProductDatabaseTemplate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Template Excel</span>
            </button>

            {/* Add Manual Product Button */}
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

      {/* Manual Product Creation Form (Toggleable) */}
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
                Kode Produk *
              </label>
              <input
                type="text"
                required
                value={newProduct.itemCode}
                onChange={(e) => setNewProduct({ ...newProduct, itemCode: e.target.value })}
                placeholder="misal: PRD-3001"
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={newProduct.itemName}
                onChange={(e) => setNewProduct({ ...newProduct, itemName: e.target.value })}
                placeholder="misal: Kopi Hitam Instant Sachet 20g"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                placeholder="misal: DAGING"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                UOM (Satuan)
              </label>
              <input
                type="text"
                value={newProduct.uom}
                onChange={(e) => setNewProduct({ ...newProduct, uom: e.target.value })}
                placeholder="KG / PCS"
                className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
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
            placeholder="Cari dalam database (Kode Produk atau Nama)..."
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

      {/* Database Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px] uppercase">
                <th className="p-3">Item Code</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Description / Nama Produk</th>
                <th className="p-3">Kategori / Class</th>
                <th className="p-3">UOM</th>
                <th className="p-3 text-center">Aksi Edit/Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada data produk ditemukan dalam database.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isEditing = editingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/60 transition">
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {p.itemCode}
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">
                        {p.barcode || '-'}
                      </td>
                      <td className="p-3 font-medium text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={p.itemName}
                            onChange={(e) => handleUpdateProduct(p.id, { itemName: e.target.value })}
                            className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-white"
                          />
                        ) : (
                          p.itemName
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                          {p.category || 'DAGING'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 text-[11px]">
                          {p.uom || 'KG'}
                        </span>
                      </td>
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
