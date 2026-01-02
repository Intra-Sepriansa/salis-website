// src/admin/components/products/BundleBuilder.tsx
import { useMemo } from 'react';
import { useAdminProductsStore } from '../../store/products';
import type { AdminProduct, BundleRule, PackageComponent } from '../../types';
import { derivePriceAndCogsForUnit, mapProducts } from '../../lib/pricing';

type Props = {
  draft: {
    components: PackageComponent[];
    rules: BundleRule[];
    priceType: 'auto' | 'manual';
    price?: number;
  };
  onChange: (next: Props['draft']) => void;
};

export default function BundleBuilder({ draft, onChange }: Props) {
  const products = useAdminProductsStore((s) => s.products);
  const pmap = useMemo(() => mapProducts(products), [products]);

  const totals = useMemo(() => {
    let sumPrice = 0;
    let sumCogs = 0;
    let units = 0;
    draft.components.forEach((c) => {
      const pr = pmap.get(c.productId);
      if (!pr) return;
      const { price, cogs } = derivePriceAndCogsForUnit(pr, c.qty, undefined, pr.sellingMode, pmap);
      sumPrice += price;
      sumCogs += cogs;
      units += c.qty;
    });
    let outPrice = sumPrice;
    if (draft.priceType === 'manual' && typeof draft.price === 'number') {
      outPrice = draft.price;
    } else {
      const rule = [...(draft.rules ?? [])].sort((a, b) => b.minTotalQty - a.minTotalQty)
        .find((r) => units >= r.minTotalQty);
      if (rule) outPrice = Math.round(sumPrice * (1 - rule.discountPct / 100));
    }
    const gm = Math.max(0, outPrice - sumCogs);
    const gmPct = outPrice > 0 ? Math.round((gm / outPrice) * 100) : 0;
    return { sumPrice, sumCogs, units, price: outPrice, gm, gmPct };
  }, [draft, pmap]);

  const addComp = (productId: string) => {
    onChange({
      ...draft,
      components: [...draft.components, { productId, qty: 1 }],
    });
  };

  const setQty = (idx: number, qty: number) => {
    const next = draft.components.map((c, i) => (i === idx ? { ...c, qty: Math.max(1, qty) } : c));
    onChange({ ...draft, components: next });
  };

  const remove = (idx: number) => {
    const next = draft.components.filter((_, i) => i !== idx);
    onChange({ ...draft, components: next });
  };

  const setRule = (idx: number, field: keyof BundleRule, value: number) => {
    const next = draft.rules.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    onChange({ ...draft, rules: next });
  };

  const addRule = () => onChange({ ...draft, rules: [...draft.rules, { minTotalQty: 6, discountPct: 5 }] });
  const removeRule = (idx: number) => onChange({ ...draft, rules: draft.rules.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => addComp(p.id)}
            className="rounded-full border px-3 py-1 text-xs hover:bg-white/60"
          >
            + {p.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border p-3">
        <div className="font-semibold mb-2">Komponen</div>
        <div className="space-y-2">
          {draft.components.map((c, idx) => {
            const pr = products.find((x) => x.id === c.productId);
            return (
              <div key={`${c.productId}-${idx}`} className="flex items-center gap-3 text-sm">
                <span className="flex-1">{pr?.name ?? c.productId}</span>
                <input
                  type="number"
                  min={1}
                  value={c.qty}
                  onChange={(e) => setQty(idx, Number(e.target.value || 1))}
                  className="w-20 rounded-xl border px-2 py-1 text-sm"
                />
                <button type="button" onClick={() => remove(idx)} className="text-red-600 text-xs hover:underline">
                  Hapus
                </button>
              </div>
            );
          })}
          {draft.components.length === 0 && <div className="text-xs opacity-70">Belum ada komponen.</div>}
        </div>
      </div>

      <div className="rounded-2xl border p-3">
        <div className="font-semibold mb-2">Aturan Diskon (auto)</div>
        <div className="space-y-2">
          {draft.rules.map((r, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <span>Min Qty</span>
              <input
                type="number"
                min={1}
                value={r.minTotalQty}
                onChange={(e) => setRule(idx, 'minTotalQty', Number(e.target.value || 1))}
                className="w-24 rounded-xl border px-2 py-1 text-sm"
              />
              <span>Diskon %</span>
              <input
                type="number"
                min={0}
                max={99}
                value={r.discountPct}
                onChange={(e) => setRule(idx, 'discountPct', Number(e.target.value || 0))}
                className="w-20 rounded-xl border px-2 py-1 text-sm"
              />
              <button type="button" onClick={() => removeRule(idx)} className="text-red-600 text-xs hover:underline">
                Hapus
              </button>
            </div>
          ))}
          <button type="button" onClick={addRule} className="rounded-full border px-3 py-1 text-xs">
            + Tambah aturan
          </button>
        </div>
      </div>

      <div className="rounded-2xl border p-3 bg-[var(--card)]">
        <div className="text-sm">Units: <b>{totals.units}</b></div>
        <div className="text-sm">Harga komponen (sum): <b>Rp {totals.sumPrice.toLocaleString('id-ID')}</b></div>
        <div className="text-sm">COGS (sum): <b>Rp {totals.sumCogs.toLocaleString('id-ID')}</b></div>
        <div className="text-base font-semibold mt-1">Harga Bundle: Rp {totals.price.toLocaleString('id-ID')}</div>
        <div className="text-sm opacity-80">GM: Rp {totals.gm.toLocaleString('id-ID')} ({totals.gmPct}%)</div>
      </div>
    </div>
  );
}
