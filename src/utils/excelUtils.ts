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

        const products: Product[] = [];

        rawRows.forEach((row, index) => {
          // Find fields with key flexibility matching ERP export (item_masters_export)
          const itemCode = 
            row['Item Code'] ||
            row['Item Codes'] ||
            row['Kode Produk'] ||
            row['Kode'] ||
            row['itemCode'] ||
            row['item_code'] ||
            '';

          const itemName = 
            row['Description'] ||
            row['Item Name'] ||
            row['Nama Produk'] ||
            row['Nama Item'] ||
            row['Deskripsi'] ||
            row['Nama'] ||
            row['itemName'] ||
            row['item_name'] ||
            '';

          if (!itemCode && !itemName) {
            return; // skip empty rows
          }

          const barcode = 
            row['Barcode'] ||
            row['iRetail Code'] ||
            row['GTIN'] ||
            '';

          const uom = 
            row['UOM'] ||
            row['Unit'] ||
            row['Satuan'] ||
            'KG';

          const className = 
            row['Class Name'] ||
            row['Cat Name'] ||
            row['Department Name'] ||
            '';

          const category = 
            row['Class Name'] ||
            row['Cat Name'] ||
            row['Department Name'] ||
            row['Kategori'] ||
            row['Category'] ||
            'DAGING';

          const department = 
            row['Department Name'] ||
            row['Department'] ||
            row['Entity'] ||
            'DAGING';

          const defaultLocationCode = 
            row['Location Code'] ||
            row['Kode Lokasi'] ||
            row['defaultLocationCode'] ||
            'WH-CENTRAL';

          const defaultStorageFrom = 
            row['Storage Location Code From'] ||
            row['Lokasi Asal (From)'] ||
            row['Storage From'] ||
            row['Lokasi Asal'] ||
            'STORAGE-MEAT-01';

          const defaultStorageTo = 
            row['Storage Location Code To'] ||
            row['Lokasi Tujuan (To)'] ||
            row['Storage To'] ||
            row['Lokasi Tujuan'] ||
            'DISPLAY-MEAT-01';

          const stockStorage = Number(
            row['Stok Storage'] || row['Stock Storage'] || row['Quantities'] || row['Reference Quantity'] || 100
          );

          const stockDisplay = Number(
            row['Stok Display'] || row['Stock Display'] || 0
          );

          products.push({
            id: `imported-${Date.now()}-${index}`,
            itemCode: String(itemCode).trim(),
            itemName: String(itemName).trim(),
            barcode: String(barcode).trim(),
            uom: String(uom).trim(),
            category: String(category).trim(),
            className: String(className).trim(),
            department: String(department).trim(),
            defaultLocationCode: String(defaultLocationCode).trim(),
            defaultStorageFrom: String(defaultStorageFrom).trim(),
            defaultStorageTo: String(defaultStorageTo).trim(),
            stockStorage,
            stockDisplay,
          });
        });

        resolve(products);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
