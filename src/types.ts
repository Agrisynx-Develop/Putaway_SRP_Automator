export interface Product {
  id: string;
  itemCode: string;
  itemName: string;
  barcode?: string;
  iRetailCode?: string;
  gtinExpiryDate?: string;
  vendorName?: string;
  uom?: string;
  category?: string;
  catName?: string;
  className?: string;
  department?: string;
  referenceQuantity?: number;
  defaultLocationCode?: string;
  defaultStorageFrom?: string;
  defaultStorageTo?: string;
  stockStorage?: number;
  stockDisplay?: number;
}

export interface PutAwayItem {
  id: string;
  locationCode: string;
  storageFrom: string;
  storageTo: string;
  itemCode: string;
  itemName: string;
  quantity: number;
}

export type PutAwayDirection = 'storage_to_display' | 'display_to_storage' | 'custom';

export interface LocationPreset {
  id: string;
  name: string;
  locationCode: string;
  storageFrom: string;
  storageTo: string;
}

export interface PutAwayHistory {
  id: string;
  timestamp: string;
  totalItems: number;
  totalQuantity: number;
  direction: PutAwayDirection;
  items: PutAwayItem[];
  filename: string;
}
