// src/admin/lib/pricing.ts
import type {
  AdminProduct,
  AdminOrderItem,
  PriceMatrixPiece,
  PriceMatrixWhole,
  PriceMatrixPackage,
  PriceMatrixBundle,
} from '../types';

// Helper mencari product
export function mapProducts(products: AdminProduct[]) {
  const map = new Map<string, AdminProduct>();
  products.forEach((p) => map.set(p.id, p));
  return map;
}

// Hitung harga (untuk preview di Admin Products)
export function calcPricePreview(p: AdminProduct): { price: number; cogs: number; gm: number; gmPct: number } {
  const { price, cogs } = derivePriceAndCogsForUnit(p, 1, undefined, undefined, new Map());
  const gm = Math.max(0, price - cogs);
  const gmPct = price > 0 ? Math.round((gm / price) * 100) : 0;
  return { price, cogs, gm, gmPct };
}

// Hitung COGS untuk item order (data storefront)
export function calcOrderItemCogs(item: AdminOrderItem, productMap: Map<string, AdminProduct>): number {
  const p = productMap.get(item.productId);
  if (!p) {
    // fallback rasio COGS 55%
    return Math.round(item.price * 0.55) * (item.qty || 1);
  }
  // Jika package/bundle, breakdown komponen
  const { cogs } = derivePriceAndCogsForUnit(p, item.qty || 1, item.variant, item.unitMode, productMap);
  return cogs;
}

export function derivePriceAndCogsForUnit(
  product: AdminProduct,
  qty: number,
  variant: string | undefined,
  unitMode: string | undefined,
  productMap: Map<string, AdminProduct>,
): { price: number; cogs: number; breakdown?: AdminOrderItem['componentBreakdown'] } {
  const pm = product.priceMatrix as any;
  const mode = unitMode ?? product.sellingMode;

  if (mode === 'piece' && pm.kind === 'piece') {
    const priceEach = bestTierPrice(pm as PriceMatrixPiece, qty);
    const cogsEach = pm.cogsPerPiece;
    return { price: priceEach * qty, cogs: cogsEach * qty };
  }

  if (mode === 'whole' && pm.kind === 'whole') {
    const chosen = chooseWholeSize(pm as PriceMatrixWhole, variant);
    const price = chosen.price * qty;
    const cogs = chosen.cogs * qty;
    return { price, cogs };
  }

  if (mode === 'package' && pm.kind === 'package') {
    const { price, cogs, breakdown } = selfPackagePrice(pm as PriceMatrixPackage, productMap, qty);
    return { price, cogs, breakdown };
  }

  if (mode === 'bundle' && pm.kind === 'bundle') {
    const { price, cogs, breakdown } = selfBundlePrice(pm as PriceMatrixBundle, productMap, qty);
    return { price, cogs, breakdown };
  }

  // Fallback
  return { price: 0, cogs: Math.round((product as any).price ?? 0 * 0.55) * qty };
}

function bestTierPrice(pm: PriceMatrixPiece, qty: number) {
  let base = pm.pricePerPiece;
  if (pm.tiers && pm.tiers.length) {
    const sorted = [...pm.tiers].sort((a, b) => b.minQty - a.minQty);
    for (const t of sorted) {
      if (qty >= t.minQty) {
        base = Math.round(pm.pricePerPiece * (1 - t.discountPct / 100));
        break;
      }
    }
  }
  return base;
}

function chooseWholeSize(pm: PriceMatrixWhole, variant?: string) {
  if (!pm.sizes.length) return { label: 'Default', price: 0, cogs: 0 };
  if (!variant) return pm.sizes[0];
  const found = pm.sizes.find((s) => s.label === variant);
  return found ?? pm.sizes[0];
}

function selfPackagePrice(
  pm: PriceMatrixPackage,
  productMap: Map<string, AdminProduct>,
  parentQty: number
) {
  // sum komponen
  let sumPrice = 0;
  let sumCogs = 0;
  const breakdown: NonNullable<AdminOrderItem['componentBreakdown']> = [];
  pm.components.forEach((c) => {
    const child = productMap.get(c.productId);
    if (!child) return;
    const { price, cogs } = derivePriceAndCogsForUnit(child, c.qty, undefined, child.sellingMode, productMap);
    sumPrice += price;
    sumCogs += cogs;
    breakdown.push({ productId: c.productId, name: child.name, qty: c.qty, price, cogs });
  });

  let price = sumPrice;
  if (pm.priceType === 'manual' && typeof pm.price === 'number') {
    price = pm.price;
  } else if (pm.priceType === 'auto' && pm.discountPct) {
    price = Math.round(sumPrice * (1 - pm.discountPct / 100));
  }
  const cogs = sumCogs;

  return { price: price * parentQty, cogs: cogs * parentQty, breakdown };
}

function selfBundlePrice(
  pm: PriceMatrixBundle,
  productMap: Map<string, AdminProduct>,
  parentQty: number
) {
  // Asumsi builder minimal: gunakan komponen default
  let sumPrice = 0;
  let sumCogs = 0;
  let totalUnits = 0;
  const breakdown: NonNullable<AdminOrderItem['componentBreakdown']> = [];

  (pm.components ?? []).forEach((c) => {
    const child = productMap.get(c.productId);
    if (!child) return;
    const { price, cogs } = derivePriceAndCogsForUnit(child, c.qty, undefined, child.sellingMode, productMap);
    sumPrice += price;
    sumCogs += cogs;
    totalUnits += c.qty;
    breakdown.push({ productId: c.productId, name: child.name, qty: c.qty, price, cogs });
  });

  let price = sumPrice;
  if (pm.priceType === 'manual' && typeof pm.price === 'number') {
    price = pm.price;
  } else {
    // auto discount by rules
    const applicable = [...(pm.rules ?? [])].sort((a, b) => b.minTotalQty - a.minTotalQty)
      .find((r) => totalUnits >= r.minTotalQty);
    if (applicable) {
      price = Math.round(sumPrice * (1 - applicable.discountPct / 100));
    }
  }
  const cogs = sumCogs;

  return { price: price * parentQty, cogs: cogs * parentQty, breakdown };
}
