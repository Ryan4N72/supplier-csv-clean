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
        {allowEmpty && <option value="">(not mapped)</option>}
        {headers.map((h) => (
          <option key={h} value={h}>
            {h || "(blank header)"}
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
        We couldn&apos;t detect your columns. Please pick them.
      </h3>
      <p className="mt-1 text-xs text-amber-900/80">
        SKU is required. Price and inventory are optional. Then continue the dry run.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Select label="SKU column *" value={skuCol} onChange={onSku} headers={headers} />
        <Select
          label="Price column"
          value={priceCol}
          onChange={onPrice}
          headers={headers}
          allowEmpty
        />
        <Select
          label="Inventory column"
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
          Continue with these columns
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
