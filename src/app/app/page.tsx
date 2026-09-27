"use client";

import { useCallback, useEffect, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { DryRunPanel } from "@/components/DryRunPanel";
import { ColumnMapper } from "@/components/ColumnMapper";
import { parseFile, parseCsvText } from "@/lib/parse";
import {
  SAMPLE_SHOPIFY_CSV,
  SAMPLE_SHOPIFY_FILENAME,
  SAMPLE_SUPPLIER_CSV,
  SAMPLE_SUPPLIER_FILENAME,
} from "@/lib/samples";
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
import { FREE_EXPORT_LIMIT, isUnlocked, tryUnlock } from "@/lib/license";
import { LIFETIME_PAYMENT_URL } from "@/lib/config";

export default function CleanerPage() {
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
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [unlockMsg, setUnlockMsg] = useState<string | null>(null);

  useEffect(() => {
    setUnlocked(isUnlocked());
  }, []);

  const exportDiffs = report
    ? unlocked
      ? report.changedDiffs
      : report.changedDiffs.slice(0, FREE_EXPORT_LIMIT)
    : [];

  const onUnlock = async () => {
    setUnlockMsg(null);
    const ok = await tryUnlock(codeInput);
    if (ok) {
      setUnlocked(true);
      setUnlockMsg("Unlocked. Exports now include all changed rows.");
    } else {
      setUnlockMsg("That code didn't work. Check your receipt and try again.");
    }
  };

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
          setError("We couldn't find the SKU column in your supplier file. Pick it below to continue.");
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
          `Supplier columns: SKU=${skuCol} / Price=${priceCol ?? "not mapped"} / Inventory=${invCol ?? "not mapped"} · ${variants.length} Shopify variants`
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
      // 内嵌静态 CSV，不走 fetch（兼容 CSP connect-src 'none'）
      const supplier = parseCsvText(SAMPLE_SUPPLIER_CSV, SAMPLE_SUPPLIER_FILENAME);
      const shopify = parseCsvText(SAMPLE_SHOPIFY_CSV, SAMPLE_SHOPIFY_FILENAME);
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
      setError("Upload both files first, or click \"Load demo files\".");
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
    const diffs = report
      ? unlocked
        ? report.changedDiffs
        : report.changedDiffs.slice(0, FREE_EXPORT_LIMIT)
      : [];
    if (diffs.length === 0) {
      setExportUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const csv = buildChangedCsv(diffs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setExportUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [report, unlocked]);

  const onExportClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (exportDiffs.length === 0) {
      e.preventDefault();
      return;
    }
    if (!canUseSaveFilePicker()) return;
    e.preventDefault();
    const csv = buildChangedCsv(exportDiffs);
    saveWithFilePickerOrFallback(csv, exportUrl);
  };

  const bothReady = Boolean(supplierSheet && shopifySheet);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav className="mb-6 flex items-center justify-between gap-3 text-sm">
        <a href="/" className="font-semibold text-slate-700 hover:text-indigo-700">
          ← Supplier CSV Cleaner
        </a>
        <a href="/#pricing" className="text-indigo-700 hover:underline">
          Pricing
        </a>
      </nav>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Runs in your browser · Nothing is uploaded
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Supplier CSV to Shopify update file
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Your files are read in your browser and never sent to a server. You can check
          this in your browser&apos;s developer tools under Network: no request carries
          your spreadsheet (this site uses the CSP{" "}
          <code className="rounded bg-slate-100 px-1">connect-src &apos;none&apos;</code>
          ).
        </p>
      </header>

      <ol className="mb-6 grid gap-2 sm:grid-cols-3">
        {[
          { n: "1", t: "Upload", d: "Supplier file + Shopify export" },
          { n: "2", t: "Dry run", d: "Compare price and inventory locally" },
          { n: "3", t: "Download", d: "Import CSV with only changed rows" },
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
          Load demo files
        </button>
        <button
          type="button"
          onClick={startDryRun}
          disabled={busy || !bothReady}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run dry run
        </button>
        <button
          type="button"
          onClick={downloadSupplierTemplate}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Supplier template (CSV)
        </button>
        <button
          type="button"
          onClick={downloadShopifyTemplate}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Shopify template (CSV)
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileDrop
          label="1. Supplier file"
          hint="Needs SKU, price and inventory columns"
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
          label="2. Shopify product export"
          hint="Shopify admin: Products, then Export (Handle, Variant SKU, Price, Inventory)"
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
          Column names we recognize automatically
        </summary>
        <div className="mt-2 space-y-1 pb-1">
          <p>
            <span className="font-semibold">SKU: </span>
            {SUPPLIER_SKU_ALIASES.join(" / ")}
          </p>
          <p>
            <span className="font-semibold">Price: </span>
            {SUPPLIER_PRICE_ALIASES.join(" / ")}
          </p>
          <p>
            <span className="font-semibold">Inventory: </span>
            {SUPPLIER_INV_ALIASES.join(" / ")}
          </p>
        </div>
      </details>

      {busy && (
        <p className="mt-4 text-sm text-indigo-600">Reading and comparing in your browser…</p>
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
            <h2 className="text-lg font-semibold text-slate-900">Dry-run results</h2>
            {exportDiffs.length > 0 && exportUrl ? (
              <a
                href={exportUrl}
                download={EXPORT_FILENAME}
                onClick={onExportClick}
                className="max-w-full break-all rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Export CSV ({exportDiffs.length}
                {exportDiffs.length < report.changedCount ? ` of ${report.changedCount}` : ""} rows) ·{" "}
                {EXPORT_FILENAME}
              </a>
            ) : (
              <span className="rounded-lg bg-emerald-600/40 px-4 py-2 text-sm font-semibold text-white">
                Export CSV (0 rows)
              </span>
            )}
          </div>
          {!unlocked && report.changedCount > FREE_EXPORT_LIMIT && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-950">
                {report.changedCount} changed rows. The free version exports the first{" "}
                {FREE_EXPORT_LIMIT}. Unlock to export all {report.changedCount}.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Unlock code from your receipt"
                  className="min-w-0 flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={onUnlock}
                  disabled={!codeInput.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  Unlock
                </button>
                {LIFETIME_PAYMENT_URL && (
                  <a
                    href={LIFETIME_PAYMENT_URL}
                    rel="noopener"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Buy Lifetime — $29
                  </a>
                )}
              </div>
              {unlockMsg && <p className="mt-2 text-xs text-indigo-900">{unlockMsg}</p>}
            </div>
          )}
          {unlocked && unlockMsg && (
            <p className="text-sm text-emerald-700">{unlockMsg}</p>
          )}
          <DryRunPanel report={report} />
        </div>
      )}

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        <details>
          <summary className="cursor-pointer font-medium text-slate-600">
            What this tool does and doesn&apos;t do
          </summary>
          <p className="mt-2">
            It does not connect to the Shopify API and does not create new products. The
            export only contains Handle, Option, Variant SKU, Variant Price and Variant
            Inventory Qty. Fields that didn&apos;t change are left blank so they don&apos;t
            overwrite anything.
          </p>
        </details>
      </footer>
    </main>
  );
}
