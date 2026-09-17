"use client";

import type { DryRunReport } from "@/lib/types";
import { DAMAGE_LABELS } from "@/lib/damage";

type Props = {
  report: DryRunReport;
};

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function fmt(n: number | null) {
  if (n === null) return "—";
  return String(n);
}

export function DryRunPanel({ report }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          title="匹配率"
          value={pct(report.matchRate)}
          sub={`${report.matchedCount} / ${report.supplierCount} 供应商行`}
          tone={report.matchRate >= 0.9 ? "good" : report.matchRate >= 0.5 ? "warn" : "bad"}
        />
        <Stat
          title="Excel 损坏迹象"
          value={String(report.damageCount)}
          sub="前导零 / 科学计数 / 日期 / 千分位"
          tone={report.damageCount === 0 ? "good" : "warn"}
        />
        <Stat
          title="将导出变更行"
          value={String(report.changedCount)}
          sub="仅价格或库存有变化"
          tone="neutral"
        />
        <Stat
          title="空白覆盖警告"
          value={String(report.blankOverwriteCount)}
          sub="供应商空值 vs 店铺有值（不会写入空）"
          tone={report.blankOverwriteCount === 0 ? "good" : "warn"}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">干跑检查清单</h3>
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li className="flex gap-2">
            <Check ok={report.matchRate >= 0.8} />
            SKU 匹配率 {pct(report.matchRate)}
            {report.unmatchedSupplier.length > 0 &&
              `（未匹配供应商 SKU ${report.unmatchedSupplier.length} 个）`}
          </li>
          <li className="flex gap-2">
            <Check ok={report.damageCount === 0} />
            Excel 损坏检测：{report.damageCount} 处
          </li>
          <li className="flex gap-2">
            <Check ok={report.blankOverwriteCount === 0} />
            空白覆盖风险：{report.blankOverwriteCount} 行（导出时跳过空值，不覆盖）
          </li>
          <li className="flex gap-2">
            <Check ok={report.changedCount > 0} />
            变更行数：{report.changedCount}（仅这些会进入下载 CSV）
          </li>
        </ul>
      </section>

      {report.damages.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-900">损坏详情（最多 20）</h3>
          <ul className="max-h-48 space-y-1 overflow-auto text-xs text-amber-950">
            {report.damages.slice(0, 20).map((d, i) => (
              <li key={i}>
                <span className="rounded bg-amber-200/80 px-1.5 py-0.5 font-medium">
                  {DAMAGE_LABELS[d.type] || d.type}
                </span>{" "}
                {d.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.unmatchedSupplier.length > 0 && (
        <section className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-rose-900">
            未匹配供应商 SKU（{report.unmatchedSupplier.length}）
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {report.unmatchedSupplier.slice(0, 40).map((r, i) => (
              <code
                key={i}
                className="rounded bg-white px-2 py-0.5 text-xs text-rose-800 ring-1 ring-rose-200"
              >
                {r.sku || "(空)"}
              </code>
            ))}
            {report.unmatchedSupplier.length > 40 && (
              <span className="text-xs text-rose-700">
                …还有 {report.unmatchedSupplier.length - 40} 个
              </span>
            )}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          变更样例（最多 8 行）
        </h3>
        {report.sampleDiffs.length === 0 ? (
          <p className="text-sm text-slate-500">没有价格/库存变化，无需导出。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2 font-medium">SKU</th>
                  <th className="px-2 py-2 font-medium">Handle</th>
                  <th className="px-2 py-2 font-medium">选项</th>
                  <th className="px-2 py-2 font-medium">价格</th>
                  <th className="px-2 py-2 font-medium">库存</th>
                </tr>
              </thead>
              <tbody>
                {report.sampleDiffs.map((d, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-2 py-2 font-mono">{d.sku}</td>
                    <td className="px-2 py-2">{d.handle}</td>
                    <td className="px-2 py-2 text-slate-600">
                      {[d.option1Value, d.option2Value, d.option3Value]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                    <td className="px-2 py-2">
                      {d.priceChanged ? (
                        <span>
                          <span className="text-slate-400 line-through">
                            {fmt(d.oldPrice)}
                          </span>{" "}
                          → <span className="font-semibold text-indigo-700">{fmt(d.newPrice)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">{fmt(d.oldPrice)}</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {d.inventoryChanged ? (
                        <span>
                          <span className="text-slate-400 line-through">
                            {fmt(d.oldInventory)}
                          </span>{" "}
                          →{" "}
                          <span className="font-semibold text-indigo-700">
                            {fmt(d.newInventory)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">{fmt(d.oldInventory)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const ring =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50"
        : tone === "bad"
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white";
  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <div className="text-xs font-medium text-slate-600">{title}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function Check({ ok }: { ok: boolean }) {
  return (
    <span
      className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
        ok ? "bg-emerald-500" : "bg-amber-500"
      }`}
    >
      {ok ? "✓" : "!"}
    </span>
  );
}
