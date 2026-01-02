// src/admin/components/products/SellingModeForm.tsx
import { useMemo } from 'react';
import type {
  AdminProduct,
  PriceMatrixPiece,
  PriceMatrixWhole,
  PriceMatrixPackage,
  PriceMatrixBundle,
  SellingMode,
} from '../../types';
import { calcPricePreview } from '../../lib/pricing';
import BundleBuilder from './BundleBuilder';

type Props = {
  draft: AdminProduct;
  onChange: (next: AdminProduct) => void;
};

export default function SellingModeForm({ draft, onChange }: Props) {
  const preview = useMemo(() => calcPricePreview(draft), [draft]);

  const setSellingMode = (mode: SellingMode) => {
    let priceMatrix: any = draft.priceMatrix;
    if (mode === 'piece') {
      priceMatrix = {
        kind: 'piece',
        pricePerPiece: 20000,
        cogsPerPiece: 9000,
        minQty: 1,
        tiers: [],
      } satisfies PriceMatrixPiece;
    } else if (mode === 'whole') {
      priceMatrix = {
        kind: 'whole',
        sizes: [{ label: '8 inch', price: 220000, cogs: 98000 }],
      } satisfies PriceMatrixWhole;
    } else if (mode === 'package') {
      priceMatrix = {
        kind: 'package',
        name: 'Paket',
        priceType: 'auto',
        discountPct: 5,
        components: [],
      } satisfies PriceMatrixPackage;
    } else if (mode === 'bundle') {
      priceMatrix = {
        kind: 'bundle',
        priceType: 'auto',
        components: [],
        rules: [],
      } satisfies PriceMatrixBundle;
    }
    onChange({ ...draft, sellingMode: mode, priceMatrix });
  };

  return (
    <div className="space-y-5">
      {/* Mode */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Selling Mode</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['piece','whole','package','bundle'] as SellingMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSellingMode(m)}
              className={`rounded-xl border px-3 py-2 text-sm ${draft.sellingMode===m ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : 'border-[var(--border)]'}`}
            >
              {labelMode(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix sesuai mode */}
      {draft.sellingMode === 'piece' && isPiece(draft.priceMatrix) && (
        <PieceForm pm={draft.priceMatrix} onChange={(pm)=>onChange({...draft, priceMatrix: pm})} unitLabel={draft.unitLabel} />
      )}

      {draft.sellingMode === 'whole' && isWhole(draft.priceMatrix) && (
        <WholeForm pm={draft.priceMatrix} onChange={(pm)=>onChange({...draft, priceMatrix: pm})} />
      )}

      {draft.sellingMode === 'package' && isPackage(draft.priceMatrix) && (
        <PackageForm pm={draft.priceMatrix} onChange={(pm)=>onChange({...draft, priceMatrix: pm})} />
      )}

      {draft.sellingMode === 'bundle' && isBundle(draft.priceMatrix) && (
        <BundleForm pm={draft.priceMatrix} onChange={(pm)=>onChange({...draft, priceMatrix: pm})} />
      )}

      {/* Preview GM */}
      <div className="rounded-2xl border p-3 bg-[var(--card)]">
        <div className="text-sm">Preview Harga Satuan: <b>Rp {preview.price.toLocaleString('id-ID')}</b></div>
        <div className="text-sm">COGS: <b>Rp {preview.cogs.toLocaleString('id-ID')}</b></div>
        <div className="text-sm">GM: <b>Rp {preview.gm.toLocaleString('id-ID')}</b> ({preview.gmPct}%)</div>
      </div>
    </div>
  );
}

function labelMode(m: SellingMode) {
  if (m==='piece') return 'Per Potong';
  if (m==='whole') return 'Whole (Loyang)';
  if (m==='package') return 'Paket';
  return 'Custom Bundle';
}

function isPiece(pm: any): pm is PriceMatrixPiece { return pm?.kind==='piece'; }
function isWhole(pm: any): pm is PriceMatrixWhole { return pm?.kind==='whole'; }
function isPackage(pm: any): pm is PriceMatrixPackage { return pm?.kind==='package'; }
function isBundle(pm: any): pm is PriceMatrixBundle { return pm?.kind==='bundle'; }

function PieceForm({ pm, onChange, unitLabel }: { pm: PriceMatrixPiece; unitLabel: string; onChange: (pm: PriceMatrixPiece)=>void }) {
  const set = (patch: Partial<PriceMatrixPiece>) => onChange({ ...pm, ...patch });
  const setTier = (idx: number, key: 'minQty'|'discountPct', val: number) => {
    const tiers = (pm.tiers ?? []).map((t,i)=> i===idx ? { ...t, [key]: val } : t);
    set({ tiers });
  };
  const addTier = () => set({ tiers: [...(pm.tiers ?? []), { minQty: 6, discountPct: 5 }] });
  const delTier = (idx: number) => set({ tiers: (pm.tiers ?? []).filter((_,i)=>i!==idx) });

  return (
    <div className="space-y-3 rounded-2xl border p-3">
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <label className="space-y-1">
          <span>Harga / {unitLabel}</span>
          <input type="number" min={0} value={pm.pricePerPiece} onChange={(e)=>set({ pricePerPiece: Number(e.target.value||0) })}
            className="w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="space-y-1">
          <span>COGS / {unitLabel}</span>
          <input type="number" min={0} value={pm.cogsPerPiece} onChange={(e)=>set({ cogsPerPiece: Number(e.target.value||0) })}
            className="w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="space-y-1">
          <span>Min Qty</span>
          <input type="number" min={1} value={pm.minQty ?? 1} onChange={(e)=>set({ minQty: Number(e.target.value||1) })}
            className="w-full rounded-xl border px-3 py-2" />
        </label>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Tier Diskon</div>
        {(pm.tiers ?? []).map((t, idx)=>(
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span>Min Qty</span>
            <input type="number" min={1} value={t.minQty} onChange={(e)=>setTier(idx,'minQty', Number(e.target.value||1))} className="w-24 rounded-xl border px-2 py-1" />
            <span>Diskon %</span>
            <input type="number" min={0} max={99} value={t.discountPct} onChange={(e)=>setTier(idx,'discountPct', Number(e.target.value||0))} className="w-20 rounded-xl border px-2 py-1" />
            <button type="button" onClick={()=>delTier(idx)} className="text-red-600 text-xs hover:underline">Hapus</button>
          </div>
        ))}
        <button type="button" onClick={addTier} className="rounded-full border px-3 py-1 text-xs">+ Tambah tier</button>
      </div>
    </div>
  );
}

function WholeForm({ pm, onChange }: { pm: PriceMatrixWhole; onChange: (pm: PriceMatrixWhole)=>void }) {
  const setSize = (idx: number, key: 'label'|'price'|'cogs', value: string|number) => {
    const sizes = pm.sizes.map((s,i)=> i===idx ? { ...s, [key]: typeof value==='string' ? value : Number(value||0) } : s);
    onChange({ ...pm, sizes });
  };
  const addSize = () => onChange({ ...pm, sizes: [...pm.sizes, { label: '12 inch', price: 350000, cogs: 170000 }] });
  const delSize = (idx: number) => onChange({ ...pm, sizes: pm.sizes.filter((_,i)=>i!==idx) });
  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <div className="text-sm font-semibold">Ukuran & Harga</div>
      {(pm.sizes).map((s, idx)=>(
        <div key={idx} className="grid md:grid-cols-4 gap-2 text-sm items-center">
          <input value={s.label} onChange={(e)=>setSize(idx,'label', e.target.value)} className="rounded-xl border px-2 py-1" />
          <input type="number" value={s.price} onChange={(e)=>setSize(idx,'price', Number(e.target.value||0))} className="rounded-xl border px-2 py-1" />
          <input type="number" value={s.cogs} onChange={(e)=>setSize(idx,'cogs', Number(e.target.value||0))} className="rounded-xl border px-2 py-1" />
          <button type="button" onClick={()=>delSize(idx)} className="text-red-600 text-xs hover:underline">Hapus</button>
        </div>
      ))}
      <button type="button" onClick={addSize} className="rounded-full border px-3 py-1 text-xs">+ Tambah ukuran</button>
    </div>
  );
}

function PackageForm({ pm, onChange }: { pm: PriceMatrixPackage; onChange: (pm: PriceMatrixPackage)=>void }) {
  const set = (patch: Partial<PriceMatrixPackage>) => onChange({ ...pm, ...patch });
  const setCompQty = (idx: number, qty: number) => {
    const next = pm.components.map((c,i)=> i===idx ? { ...c, qty: Math.max(1, qty) } : c);
    set({ components: next });
  };
  const addComp = () => set({ components: [...pm.components, { productId: '', qty: 1 }] });
  const delComp = (idx: number) => set({ components: pm.components.filter((_,i)=>i!==idx) });

  return (
    <div className="space-y-3 rounded-2xl border p-3">
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <label className="space-y-1">
          <span>Nama Paket</span>
          <input value={pm.name} onChange={(e)=>set({ name: e.target.value })} className="w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="space-y-1">
          <span>Harga</span>
          <div className="flex items-center gap-2">
            <select value={pm.priceType} onChange={(e)=>set({ priceType: e.target.value as any })} className="rounded-xl border px-2 py-1">
              <option value="auto">Auto (diskon %)</option>
              <option value="manual">Manual</option>
            </select>
            {pm.priceType==='manual' ? (
              <input type="number" value={pm.price ?? 0} onChange={(e)=>set({ price: Number(e.target.value||0) })} className="w-28 rounded-xl border px-2 py-1" />
            ) : (
              <>
                <span>Diskon %</span>
                <input type="number" min={0} max={99} value={pm.discountPct ?? 0} onChange={(e)=>set({ discountPct: Number(e.target.value||0) })} className="w-20 rounded-xl border px-2 py-1" />
              </>
            )}
          </div>
        </label>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Komponen</div>
        {(pm.components).map((c, idx)=>(
          <div key={idx} className="grid md:grid-cols-[1fr_110px_80px] gap-2 text-sm items-center">
            <input
              value={c.productId}
              onChange={(e)=> {
                const next = pm.components.map((x,i)=> i===idx ? { ...x, productId: e.target.value } : x);
                set({ components: next });
              }}
              placeholder="productId"
              className="rounded-xl border px-2 py-1"
            />
            <input type="number" min={1} value={c.qty} onChange={(e)=>setCompQty(idx, Number(e.target.value||1))} className="rounded-xl border px-2 py-1" />
            <button type="button" onClick={()=>delComp(idx)} className="text-red-600 text-xs hover:underline">Hapus</button>
          </div>
        ))}
        <button type="button" onClick={addComp} className="rounded-full border px-3 py-1 text-xs">+ Tambah komponen</button>
      </div>
    </div>
  );
}

function BundleForm({ pm, onChange }: { pm: PriceMatrixBundle; onChange: (pm: PriceMatrixBundle)=>void }) {
  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span>Pricing</span>
          <select value={pm.priceType} onChange={(e)=>onChange({ ...pm, priceType: e.target.value as any })} className="rounded-xl border px-3 py-2">
            <option value="auto">Auto (aturan qty → diskon)</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        {pm.priceType==='manual' && (
          <label className="space-y-1">
            <span>Harga Manual</span>
            <input type="number" value={pm.price ?? 0} onChange={(e)=>onChange({ ...pm, price: Number(e.target.value||0) })} className="w-full rounded-xl border px-3 py-2" />
          </label>
        )}
      </div>

      <BundleBuilder
        draft={{ components: pm.components ?? [], rules: pm.rules ?? [], priceType: pm.priceType, price: pm.price }}
        onChange={(d)=> onChange({ ...pm, components: d.components, rules: d.rules, priceType: d.priceType, price: d.price })}
      />
    </div>
  );
}
