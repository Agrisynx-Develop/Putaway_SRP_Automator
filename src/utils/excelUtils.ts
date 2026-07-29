import * as XLSX from 'xlsx';
import { Product, PutAwayItem } from '../types';

export const exportPutAwayToExcel = (items: PutAwayItem[], customFilename?: string) => {
  // Map items to exact template format matching the requested image + extra Item Name column at column F
  const data = items.map((item) => ({
    'Location Code': item.locationCode || '',
    'Storage Location Code From': item.storageFrom || '',
    'Storage Location Code To': item.storageTo || '',
    'Item Codes': item.itemCode || '',
    'Quantities': Number(item.quantity) || 0,
    'Item Name': item.itemName || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: [
      'Location Code',
      'Storage Location Code From',
      'Storage Location Code To',
      'Item Codes',
      'Quantities',
      'Item Name',
    ],
  });

  // Set nice column widths
  worksheet['!cols'] = [
    { wch: 18 }, // Location Code
    { wch: 28 }, // Storage Location Code From
    { wch: 26 }, // Storage Location Code To
    { wch: 18 }, // Item Codes
    { wch: 14 }, // Quantities
    { wch: 35 }, // Item Name
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const filename = customFilename 
    ? (customFilename.endsWith('.xlsx') ? customFilename : `${customFilename}.xlsx`)
    : `PutAway_Transfer_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.xlsx`;

  XLSX.writeFile(workbook, filename);
  return filename;
};

export const exportProductDatabaseTemplate = () => {
  const sampleData = [
    {
      'Kode Produk': 'PRD-2001',
      'Nama Produk': 'Susu UHT Cokelat 250ml',
      'Kategori': 'Minuman',
      'Kode Lokasi': 'WH-CENTRAL',
      'Lokasi Asal (From)': 'STORAGE-A1',
      'Lokasi Tujuan (To)': 'DISPLAY-BEV-02',
      'Stok Storage': 100,
      'Stok Display': 20,
    },
    {
      'Kode Produk': 'PRD-2002',
      'Nama Produk': 'Keciput Wijen Gurih 200g',
      'Kategori': 'Snack',
      'Kode Lokasi': 'WH-CENTRAL',
      'Lokasi Asal (From)': 'STORAGE-C2',
      'Lokasi Tujuan (To)': 'DISPLAY-SNACK-01',
      'Stok Storage': 85,
      'Stok Display': 15,
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 32 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Database_Master');
  XLSX.writeFile(workbook, 'Template_Database_Produk_PutAway.xlsx');
};

export const parseProductDatabaseExcel = async (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        // Map to aggregate products by Item Code
        const productMap = new Map<string, Product>();

        rawRows.forEach((row, index) => {
          // Find fields with key flexibility matching ERP / OHB export
          const itemCode = String(
            row['Item Code'] ||
            row['Item Codes'] ||
            row['Kode Produk'] ||
            row['Kode'] ||
            row['itemCode'] ||
            row['item_code'] ||
            ''
          ).trim();

          const itemName = String(
            row['Item Name'] ||
            row['Description'] ||
            row['Nama Produk'] ||
            row['Nama Item'] ||
            row['Deskripsi'] ||
            row['Nama'] ||
            row['itemName'] ||
            ''
          ).trim();

          if (!itemCode && !itemName) {
            return; // skip empty rows
          }

          const barcode = String(
            row['Barcode'] ||
            row['iRetail Code'] ||
            row['GTIN'] ||
            ''
          ).trim();

          const uom = String(
            row['Default UOM'] ||
            row['UOM'] ||
            row['Unit'] ||
            row['Satuan'] ||
            'KG'
          ).trim();

          const category = String(
            row['Class Name'] ||
            row['Cat Name'] ||
            row['Department Name'] ||
            row['Kategori'] ||
            row['Category'] ||
            row['Storage Name'] ||
            'DAGING'
          ).trim();

          const storageCode = String(
            row['Storage Code'] ||
            row['Location Code'] ||
            row['Kode Lokasi'] ||
            row['defaultLocationCode'] ||
            '007'
          ).trim();

          // Extract base location code (e.g. "007A" -> "007")
          let baseLoc = storageCode;
          if (baseLoc.endsWith('A') || baseLoc.endsWith('B')) {
            baseLoc = baseLoc.slice(0, -1);
          }
          if (!baseLoc) baseLoc = '007';

          const stockOnHand = Number(
            row['Stock on Hand'] ||
            row['Stok Storage'] ||
            row['Stock Storage'] ||
            row['Quantities'] ||
            row['Reference Quantity'] ||
            0
          );

          const isDisplayRow = storageCode.endsWith('A') || String(row['Storage Name'] || '').toLowerCase().includes('display');
          const isStorageRow = storageCode.endsWith('B') || String(row['Storage Name'] || '').toLowerCase().includes('storage');

          const key = itemCode || `item-${index}`;

          if (productMap.has(key)) {
            const existing = productMap.get(key)!;
            if (isDisplayRow) {
              existing.stockDisplay = (existing.stockDisplay || 0) + stockOnHand;
            } else if (isStorageRow) {
              existing.stockStorage = (existing.stockStorage || 0) + stockOnHand;
            } else {
              existing.stockStorage = (existing.stockStorage || 0) + stockOnHand;
            }
          } else {
            productMap.set(key, {
              id: `imported-${Date.now()}-${index}`,
              itemCode,
              itemName: itemName || itemCode,
              barcode,
              uom,
              category,
              defaultLocationCode: baseLoc,
              defaultStorageFrom: `${baseLoc}B`,
              defaultStorageTo: `${baseLoc}A`,
              stockStorage: isDisplayRow ? 0 : stockOnHand,
              stockDisplay: isDisplayRow ? stockOnHand : 0,
            });
          }
        });

        resolve(Array.from(productMap.values()));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
