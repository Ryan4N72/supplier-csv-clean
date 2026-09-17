"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { DryRunPanel } from "@/components/DryRunPanel";
import { parseFile, parseSampleUrl } from "@/lib/parse";
import { mapSupplierRows } from "@/lib/supplier";
import { mapShopifyVariants } from "@/lib/shopify";
import { buildDryRun } from "@/lib/match";
import { buildChangedCsv, downloadTextFile } from "@/lib/exportCsv";
import type { DryRunReport, ParsedSheet } from "@/lib/types";

export default function HomePage() {
  const [supplierSheet, setSupplierSheet] = useState<ParsedSheet | null>(null);
  const [shopifySheet, setShopifySheet] = useState<ParsedSheet | null>(null);
  const [report, setReport] = useState<DryRunReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState<string | null>(null);

  const clearReport = () => {
    setReport(null);
    setMeta(null);
  };

  const runPipeline = useCallback(async (supplier: ParsedSheet, shopify: ParsedSheet) => {
    setBusy(true);
    setError(null);
    try {
      const { rows: suppliers, skuCol, priceCol, invCol } = mapSupplierRows(supplier);
      const { variants } = mapShopifyVariants(shopify);
      const dry = buildDryRun(suppliers, variants);
      setReport(dry);
      setMeta(
        `供应商列: SKU=${skuCol} / 价格=${priceCol ?? "未识别"} / 库存=${invCol ?? "未识别"} · Shopify 变体 ${variants.length} 行`
      );
    } catch (e) {
      setReport(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const onSupplier = async (file: File) => {
    setBusy(true);
    setError(null);
    clearReport();
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

  /** 只加载样例，不自动干跑 */
  const loadSamples = async () => {
    setBusy(true);
    setError(null);
    clearReport();
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
    await runPipeline(supplierSheet, shopifySheet);
  };

  const download = () => {
    if (!report || report.changedDiffs.length === 0) return;
    const csv = buildChangedCsv(report.changedDiffs);
    // 固定可读文件名，避免浏览器落成 UUID / 无扩展名
    downloadTextFile("shopify-price-inventory-delta.csv", csv);
  };

  const bothReady = Boolean(supplierSheet && shopifySheet);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          本地浏览器 · 零上传
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          供应商 CSV 清洗 → Shopify 导入准备
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          上传供应商脏表与 Shopify 产品导出，按 SKU 映射到 Handle/变体，检测
          Excel 损坏，干跑核对后仅下载价格/库存有变更的 UTF-8 BOM CSV。所有解析在浏览器完成，文件内容不会发往服务器。
        </p>
      </header>

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
        <span className="text-xs text-slate-500">
          演示：加载样例 → 开始干跑 → 导出 CSV
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileDrop
          label="1. 供应商目录"
          hint="需含 SKU、价格、库存列（中英列名均可）"
          fileName={supplierSheet?.fileName ?? null}
          onFile={onSupplier}
          onClear={() => {
            setSupplierSheet(null);
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

      {report && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">干跑结果</h2>
            <button
              type="button"
              onClick={download}
              disabled={report.changedCount === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              导出 CSV（{report.changedCount} 行）
            </button>
          </div>
          <DryRunPanel report={report} />
        </div>
      )}

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        <p>
          <strong>MVP 边界：</strong>
          不接 Shopify API / FTP / 定时任务；不做新品创建、多店铺、PIM、登录；不做 PDF / AI。
          导出列仅含 Handle、Option、Variant SKU、Variant Price、Variant Inventory Qty；未变更字段留空以免覆盖。
        </p>
      </footer>
    </main>
  );
}
