"use client";

import { useCallback, useEffect, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { DryRunPanel } from "@/components/DryRunPanel";
import { ColumnMapper } from "@/components/ColumnMapper";
import { parseFile, parseSampleUrl } from "@/lib/parse";
import {
  SUPPLIER_INV_ALIASES,
  SUPPLIER_PRICE_ALIASES,
  SUPPLIER_SKU_ALIASES,
  detectSupplierColumns,
  mapSupplierRows,
  type SupplierColumnMapping,
} from "@/lib/supplier";
import { mapShopifyVariants } from "@/lib/shopify";
import { buildDryRun } from "@/lib/match";
import {
  EXPORT_FILENAME,
  buildChangedCsv,
  canUseSaveFilePicker,
  saveWithFilePickerOrFallback,
} from "@/lib/exportCsv";
import {
  downloadShopifyTemplate,
  downloadSupplierTemplate,
} from "@/lib/templates";
import type { DryRunReport, ParsedSheet } from "@/lib/types";

export default function HomePage() {
  const [supplierSheet, setSupplierSheet] = useState<ParsedSheet | null>(null);
  const [shopifySheet, setShopifySheet] = useState<ParsedSheet | null>(null);
  const [report, setReport] = useState<DryRunReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [supplierMapping, setSupplierMapping] =
    useState<SupplierColumnMapping | null>(null);
  const [needMapping, setNeedMapping] = useState(false);
  const [mapSku, setMapSku] = useState("");
  const [mapPrice, setMapPrice] = useState("");
  const [mapInv, setMapInv] = useState("");

  const clearReport = () => {
    setReport(null);
    setMeta(null);
  };

  const runPipeline = useCallback(
    async (
      supplier: ParsedSheet,
      shopify: ParsedSheet,
      mapping: SupplierColumnMapping | null
    ) => {
      setBusy(true);
      setError(null);
      try {
        const auto = detectSupplierColumns(supplier);
        const effective: SupplierColumnMapping | null =
          mapping ??
          (auto.skuCol
            ? {
                skuCol: auto.skuCol,
                priceCol: auto.priceCol,
                invCol: auto.invCol,
              }
            : null);

        if (!effective?.skuCol) {
          setNeedMapping(true);
          setMapSku(auto.skuCol ?? supplier.headers[0] ?? "");
          setMapPrice(auto.priceCol ?? "");
          setMapInv(auto.invCol ?? "");
          setError("未能自动识别供应商 SKU 列，请在下方手动指定后继续。");
          setReport(null);
          return;
        }

        setNeedMapping(false);
        const { rows: suppliers, skuCol, priceCol, invCol } = mapSupplierRows(
          supplier,
          effective
        );
        const { variants } = mapShopifyVariants(shopify);
        const dry = buildDryRun(suppliers, variants);
        setReport(dry);
        setMeta(
          `供应商列: SKU=${skuCol} / 价格=${priceCol ?? "未映射"} / 库存=${invCol ?? "未映射"} · Shopify 变体 ${variants.length} 行`
        );
      } catch (e) {
        setReport(null);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const onSupplier = async (file: File) => {
    setBusy(true);
    setError(null);
    clearReport();
    setSupplierMapping(null);
    setNeedMapping(false);
    try {
      const sheet = await parseFile(file);
      setSupplierSheet(sheet);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onShopify = async (file: File) => {
    setBusy(true);
    setError(null);
    clearReport();
    try {
      const sheet = await parseFile(file);
      setShopifySheet(sheet);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const loadSamples = async () => {
    setBusy(true);
    setError(null);
    clearReport();
    setSupplierMapping(null);
    setNeedMapping(false);
    try {
      const [supplier, shopify] = await Promise.all([
        parseSampleUrl("/samples/supplier-catalog.csv", "supplier-catalog.csv"),
        parseSampleUrl(
          "/samples/shopify-products-export.csv",
          "shopify-products-export.csv"
        ),
      ]);
      setSupplierSheet(supplier);
      setShopifySheet(shopify);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const startDryRun = async () => {
    if (!supplierSheet || !shopifySheet) {
      setError("请先上传两份文件，或点击「加载演示样例」");
      return;
    }
    await runPipeline(supplierSheet, shopifySheet, supplierMapping);
  };

  const confirmMapping = async () => {
    if (!supplierSheet || !shopifySheet || !mapSku) return;
    const mapping: SupplierColumnMapping = {
      skuCol: mapSku,
      priceCol: mapPrice || null,
      invCol: mapInv || null,
    };
    setSupplierMapping(mapping);
    await runPipeline(supplierSheet, shopifySheet, mapping);
  };

  useEffect(() => {
    if (!report || report.changedDiffs.length === 0) {
      setExportUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const csv = buildChangedCsv(report.changedDiffs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setExportUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [report]);

  const onExportClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!report || report.changedDiffs.length === 0) {
      e.preventDefault();
      return;
    }
    if (!canUseSaveFilePicker()) return;
    e.preventDefault();
    const csv = buildChangedCsv(report.changedDiffs);
    saveWithFilePickerOrFallback(csv, exportUrl);
  };

  const bothReady = Boolean(supplierSheet && shopifySheet);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          本地浏览器 · 零上传
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          供应商 CSV 清洗 → Shopify 导入准备
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          文件只在你的浏览器里解析，不会发往服务器。可打开开发者工具 → Network
          面板验证：干跑/导出过程中不应出现上传表格内容的请求（本站 CSP{" "}
          <code className="rounded bg-slate-100 px-1">connect-src &apos;none&apos;</code>
          ）。
        </p>
      </header>

      <ol className="mb-6 grid gap-2 sm:grid-cols-3">
        {[
          { n: "1", t: "上传", d: "供应商表 + Shopify 导出" },
          { n: "2", t: "干跑", d: "本地比对价格/库存变更" },
          { n: "3", t: "下载", d: "仅变更行的导入 CSV" },
        ].map((s) => (
          <li
            key={s.n}
            className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {s.n}
            </span>
            <div>
              <div className="text-sm font-semibold text-indigo-950">{s.t}</div>
              <div className="text-xs text-indigo-900/70">{s.d}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={loadSamples}
          disabled={busy}
          className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 disabled:opacity-50"
        >
          加载演示样例
        </button>
        <button
          type="button"
          onClick={startDryRun}
          disabled={busy || !bothReady}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          开始干跑
        </button>
        <button
          type="button"
          onClick={downloadSupplierTemplate}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          下载供应商空白模板
        </button>
        <button
          type="button"
          onClick={downloadShopifyTemplate}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          下载 Shopify 空白模板
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileDrop
          label="1. 供应商目录"
          hint="需含 SKU、价格、库存列（中英列名均可）"
          fileName={supplierSheet?.fileName ?? null}
          onFile={onSupplier}
          onClear={() => {
            setSupplierSheet(null);
            setSupplierMapping(null);
            setNeedMapping(false);
            clearReport();
          }}
        />
        <FileDrop
          label="2. Shopify 产品导出"
          hint="Products → Export，含 Handle / Variant SKU / Option / Price / Inventory"
          fileName={shopifySheet?.fileName ?? null}
          onFile={onShopify}
          onClear={() => {
            setShopifySheet(null);
            clearReport();
          }}
        />
      </div>

      <details className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-700">
          支持的列名别名（自动识别）
        </summary>
        <div className="mt-2 space-y-1 pb-1">
          <p>
            <span className="font-semibold">SKU：</span>
            {SUPPLIER_SKU_ALIASES.join(" / ")}
          </p>
          <p>
            <span className="font-semibold">价格：</span>
            {SUPPLIER_PRICE_ALIASES.join(" / ")}
          </p>
          <p>
            <span className="font-semibold">库存：</span>
            {SUPPLIER_INV_ALIASES.join(" / ")}
          </p>
        </div>
      </details>

      {busy && (
        <p className="mt-4 text-sm text-indigo-600">正在本地解析与比对…</p>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      {meta && !error && (
        <p className="mt-3 text-xs text-slate-500">{meta}</p>
      )}

      {needMapping && supplierSheet && (
        <ColumnMapper
          headers={supplierSheet.headers}
          skuCol={mapSku}
          priceCol={mapPrice}
          invCol={mapInv}
          onSku={setMapSku}
          onPrice={setMapPrice}
          onInv={setMapInv}
          onConfirm={confirmMapping}
          onCancel={() => {
            setNeedMapping(false);
            setError(null);
          }}
        />
      )}

      {report && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">干跑结果</h2>
            {report.changedCount > 0 && exportUrl ? (
              <a
                href={exportUrl}
                download={EXPORT_FILENAME}
                onClick={onExportClick}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                导出 CSV（{report.changedCount} 行）· {EXPORT_FILENAME}
              </a>
            ) : (
              <span className="rounded-lg bg-emerald-600/40 px-4 py-2 text-sm font-semibold text-white">
                导出 CSV（{report.changedCount} 行）
              </span>
            )}
          </div>
          <DryRunPanel report={report} />
        </div>
      )}

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        <details>
          <summary className="cursor-pointer font-medium text-slate-600">
            MVP 边界与说明
          </summary>
          <p className="mt-2">
            不接 Shopify API / FTP / 定时任务；不做新品创建、多店铺、PIM、登录；不做
            PDF / AI。导出列仅含 Handle、Option、Variant SKU、Variant Price、Variant
            Inventory Qty；未变更字段留空以免覆盖。
          </p>
        </details>
      </footer>
    </main>
  );
}
