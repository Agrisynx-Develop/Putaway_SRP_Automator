import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ScanLine, Package, ArrowRight, Check, Zap, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductSearchProps {
  products: Product[];
  onAddToList: (product: Product, quantity: number) => void;
  defaultLocationCode: string;
  defaultStorageFrom: string;
  defaultStorageTo: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
  onAddToList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBarcodeMode, setIsBarcodeMode] = useState<boolean>(false);
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Quick selection pills (top 5 popular or first products)
  const quickPillProducts = products.slice(0, 6);

  // Filter products based on search term
  const filteredProducts = searchTerm.trim() === ''
    ? []
    : products.filter((p) => {
        const term = searchTerm.toLowerCase();
        return (
          p.itemCode.toLowerCase().includes(term) ||
          p.itemName.toLowerCase().includes(term) ||
          (p.barcode && p.barcode.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term)) ||
          (p.className && p.className.toLowerCase().includes(term)) ||
          (p.department && p.department.toLowerCase().includes(term))
        );
      }).slice(0, 10);

  // Auto select exact match if typing code
  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }

    const exactMatch = products.find(
      (p) => p.itemCode.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    if (exactMatch) {
      setSelectedProduct(exactMatch);
    } else if (filteredProducts.length > 0) {
      setSelectedProduct(filteredProducts[0]);
    }
  }, [searchTerm, products]);

  const handleAddCurrent = (p?: Product) => {
    const productToUse = p || selectedProduct || filteredProducts[0] || products[0];
    if (!productToUse) return;

    if (quantity <= 0) return;

    onAddToList(productToUse, quantity);

    // Visual feedback animation
    setAddedAnimation(productToUse.itemCode);
    setTimeout(() => setAddedAnimation(null), 1200);

    if (isBarcodeMode) {
      setSearchTerm('');
      setSelectedProduct(null);
      setQuantity(1);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0 || selectedProduct) {
        handleAddCurrent(selectedProduct || filteredProducts[0]);
      }
    }
  };

  const handleQuickPillClick = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.itemCode);
    handleAddCurrent(product);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Catat Item Transfer Put Away
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cari berdasarkan Kode Produk / Nama Produk atau pilih cepat dari tombol di bawah
          </p>
        </div>

        {/* Scan Barcode Toggle */}
        <button
          id="barcode-toggle-btn"
          type="button"
          onClick={() => setIsBarcodeMode(!isBarcodeMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isBarcodeMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ScanLine className={`w-3.5 h-3.5 ${isBarcodeMode ? 'animate-pulse text-amber-400' : ''}`} />
          <span>{isBarcodeMode ? 'Mode Scan Aktif' : 'Scan Barcode'}</span>
        </button>
      </div>

      {/* Quick Pills (Matching reference image quick pick pills) */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>PILIH CEPAT UNTUK AUTO-FILL (CUKUP KLIK):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPillProducts.map((p) => {
            const isJustAdded = addedAnimation === p.itemCode;
            let baseLoc = (p.defaultLocationCode || '007').trim();
            if (baseLoc.endsWith('A') || baseLoc.endsWith('B')) {
              baseLoc = baseLoc.slice(0, -1);
            }
            if (!baseLoc) baseLoc = '007';

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickPillClick(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isJustAdded
                    ? 'bg-emerald-600 text-white border-emerald-500 scale-105'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-emerald-400">{p.itemCode}</span>
                <span className="max-w-[120px] truncate">{p.itemName}</span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/40">
                  {baseLoc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
        {/* Search Bar */}
        <div className="md:col-span-7 relative">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Nama / Kode Bahan Produk *
          </label>
          <div className="relative">
            <input
              id="product-search-input"
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isBarcodeMode
                  ? 'Arahkan scanner barcode ke kemasan...'
                  : 'Masukkan nama atau kode bahan (Contoh: PRD-1001 / Susu UHT)'
              }
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-xs rounded-xl pl-9 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProduct(null);
                }}
                className="absolute right-3 top-3 text-[10px] bg-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchTerm.trim() !== '' && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto divide-y divide-slate-800">
              {filteredProducts.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs">
                  Tidak ditemukan produk dengan kata kunci "{searchTerm}"
                </div>
              ) : (
                filteredProducts.map((p) => {
                  let baseLoc = (p.defaultLocationCode || '007').trim();
                  if (baseLoc.endsWith('A') || baseLoc.endsWith('B')) {
                    baseLoc = baseLoc.slice(0, -1);
                  }
                  if (!baseLoc) baseLoc = '007';
                  const locFrom = p.defaultStorageFrom || `${baseLoc}B`;
                  const locTo = p.defaultStorageTo || `${baseLoc}A`;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setSearchTerm(p.itemCode);
                      }}
                      className="p-3 hover:bg-slate-800 cursor-pointer flex flex-col gap-1.5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                            {p.itemCode}
                          </span>
                          {p.barcode && (
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1 py-0.5 rounded">
                              [{p.barcode}]
                            </span>
                          )}
                          <span className="text-xs text-white font-semibold truncate">
                            {p.itemName}
                          </span>
                          {p.uom && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                              {p.uom}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCurrent(p);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow"
                        >
                          + Tambah
                        </button>
                      </div>

                      {/* Location Details Footer for search dropdown item */}
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/80 w-fit flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-amber-300">
                          <span className="text-[10px] text-slate-500 font-sans">Kode Lokasi:</span>
                          <strong>{baseLoc}</strong>
                        </span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="flex items-center gap-1 font-mono text-cyan-300">
                          <span className="text-[10px] text-slate-500 font-sans">Asal:</span>
                          <strong>{locFrom}</strong>
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="flex items-center gap-1 font-mono text-emerald-300">
                          <span className="text-[10px] text-slate-500 font-sans">Tujuan:</span>
                          <strong>{locTo}</strong>
                        </span>
                        {(p.stockStorage !== undefined || p.stockDisplay !== undefined) && (
                          <>
                            <span className="text-slate-600">&bull;</span>
                            <span className="text-[10px] text-slate-400">
                              Stok B (Storage): <strong className="text-cyan-300">{p.stockStorage ?? 0}</strong> | A (Display): <strong className="text-emerald-400">{p.stockDisplay ?? 0}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Quantity Input */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Jumlah / Qty *
          </label>
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-transparent text-center text-xs font-bold text-amber-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-3 flex items-end">
          <button
            id="add-to-putaway-btn"
            type="button"
            onClick={() => handleAddCurrent()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Masukkan ke List</span>
          </button>
        </div>
      </div>

      {/* Selected Product Banner */}
      {selectedProduct && (
        <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs shadow-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Terpilih:</span>
            <span className="font-mono font-bold text-emerald-400">
              [{selectedProduct.itemCode}]
            </span>
            <span className="font-semibold text-white">{selectedProduct.itemName}</span>
            {selectedProduct.uom && (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/60 font-mono">
                {selectedProduct.uom}
              </span>
            )}
          </div>

          {(() => {
            let baseLoc = (selectedProduct.defaultLocationCode || '007').trim();
            if (baseLoc.endsWith('A') || baseLoc.endsWith('B')) {
              baseLoc = baseLoc.slice(0, -1);
            }
            if (!baseLoc) baseLoc = '007';
            const locFrom = selectedProduct.defaultStorageFrom || `${baseLoc}B`;
            const locTo = selectedProduct.defaultStorageTo || `${baseLoc}A`;

            return (
              <div className="text-[11px] text-slate-300 flex items-center gap-2.5 flex-wrap font-mono">
                <span className="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60 font-bold">
                  Lokasi: {baseLoc}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-cyan-300">
                  Asal: <strong>{locFrom}</strong>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-emerald-400">
                  Tujuan: <strong>{locTo}</strong>
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
