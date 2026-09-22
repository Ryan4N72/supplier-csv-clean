"use client";

type Props = {
  headers: string[];
  skuCol: string;
  priceCol: string;
  invCol: string;
  onSku: (v: string) => void;
  onPrice: (v: string) => void;
  onInv: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

function Select({
  label,
  value,
  onChange,
  headers,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  headers: string[];
  allowEmpty?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
      >
        {allowEmpty && <option value="">（不映射）</option>}
        {headers.map((h) => (
          <option key={h} value={h}>
            {h || "(空列名)"}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ColumnMapper({
  headers,
  skuCol,
  priceCol,
  invCol,
  onSku,
  onPrice,
  onInv,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/80 p-4">
      <h3 className="text-sm font-semibold text-amber-950">
        未能自动识别列名 — 请手动指定
      </h3>
      <p className="mt-1 text-xs text-amber-900/80">
        SKU 必选；价格 / 库存可选。选好后继续干跑。
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Select label="SKU 列 *" value={skuCol} onChange={onSku} headers={headers} />
        <Select
          label="价格列"
          value={priceCol}
          onChange={onPrice}
          headers={headers}
          allowEmpty
        />
        <Select
          label="库存列"
          value={invCol}
          onChange={onInv}
          headers={headers}
          allowEmpty
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!skuCol}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-40"
        >
          用此映射继续
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          取消
        </button>
      </div>
    </div>
  );
}
