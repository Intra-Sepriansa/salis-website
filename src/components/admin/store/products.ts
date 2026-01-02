// src/admin/store/products.ts
import { create } from 'zustand';
import type {
  AdminProduct,
  PriceMatrixPiece,
  PriceMatrixWhole,
  PriceMatrixPackage,
  PriceMatrixBundle,
} from '../types';

type ProductsState = {
  products: AdminProduct[];
  add: (p: AdminProduct) => void;
  update: (id: string, patch: Partial<AdminProduct>) => void;
  remove: (id: string) => void;
  getById: (id: string) => AdminProduct | undefined;
};

const seed: AdminProduct[] = [
  {
    id: 'mille-slice',
    name: 'Mille Crepes Slice',
    category: 'Cake',
    sellingMode: 'piece',
    unitLabel: 'potong',
    priceMatrix: {
      kind: 'piece',
      pricePerPiece: 10000,
      cogsPerPiece: 9000,
      minQty: 1,
      tiers: [
        { minQty: 6, discountPct: 5 },
        { minQty: 12, discountPct: 10 },
      ],
    } satisfies PriceMatrixPiece,
    preorder: { leadDays: 0 },
    flavors: ['Original', 'Matcha', 'Chocolate'],
    active: true,
  },
  {
    id: 'mille-whole',
    name: 'Mille Crepes Whole',
    category: 'Cake',
    sellingMode: 'whole',
    unitLabel: 'loyang',
    priceMatrix: {
      kind: 'whole',
      sizes: [
        { label: '6 inch', price: 160000, cogs: 70000 },
        { label: '8 inch', price: 220000, cogs: 98000 },
        { label: '10 inch', price: 290000, cogs: 132000 },
      ],
    } satisfies PriceMatrixWhole,
    preorder: { leadDays: 1, cutoffHour: 15 },
    active: true,
  },
  {
    id: 'miles-crepes-matcha',
    name: 'Miles Crepes Matcha',
    category: 'Cake',
    sellingMode: 'whole',
    unitLabel: 'loyang',
    priceMatrix: {
      kind: 'whole',
      sizes: [{ label: '16 cm', price: 225000, cogs: 110000 }],
    } satisfies PriceMatrixWhole,
    preorder: { leadDays: 1, cutoffHour: 14 },
    flavors: ['Matcha premium'],
    active: true,
  },
  {
    id: 'bday-package',
    name: 'Paket Ulang Tahun',
    category: 'Package',
    sellingMode: 'package',
    unitLabel: 'paket',
    priceMatrix: {
      kind: 'package',
      name: 'Birthday Set',
      priceType: 'auto',
      discountPct: 8,
      components: [
        { productId: 'mille-whole', qty: 1 },
        { productId: 'mille-slice', qty: 10 },
      ],
    } satisfies PriceMatrixPackage,
    preorder: { leadDays: 1, cutoffHour: 15 },
    active: true,
  },
  {
    id: 'custom-bundle',
    name: 'Custom Bundle Donat/Cookies',
    category: 'Bundle',
    sellingMode: 'bundle',
    unitLabel: 'bundle',
    priceMatrix: {
      kind: 'bundle',
      priceType: 'auto',
      components: [
        { productId: 'mille-slice', qty: 4 },
      ],
      rules: [
        { minTotalQty: 6, discountPct: 5 },
        { minTotalQty: 12, discountPct: 10 },
      ],
    } satisfies PriceMatrixBundle,
    preorder: { leadDays: 0 },
    active: true,
  },
];

export const useAdminProductsStore = create<ProductsState>((set, get) => ({
  products: seed,
  add: (p) => set((s) => ({ products: [p, ...s.products] })),
  update: (id, patch) =>
    set((s) => ({
      products: s.products.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  remove: (id) =>
    set((s) => ({ products: s.products.filter((x) => x.id !== id) })),
  getById: (id) => get().products.find((x) => x.id === id),
}));
