import type { DiffRow } from "./types";

/** 真实保存名：与页面文案、Save As suggestedName、a.download 三者一致 */
export const EXPORT_FILENAME = "shopify-price-inventory-delta.csv";

/** Shopify 导入用 UTF-8 BOM CSV；仅输出有意覆盖的列 */
export function buildChangedCsv(changed: DiffRow[]): string {
  const headers = [
    "Handle",
    "Option1 Name",
    "Option1 Value",
    "Option2 Name",
    "Option2 Value",
    "Option3 Name",
    "Option3 Value",
    "Variant SKU",
    "Variant Price",
    "Variant Inventory Qty",
  ];

  const lines: string[] = [headers.join(",")];

  for (const d of changed) {
    const price =
      d.priceChanged && d.newPrice !== null ? formatNum(d.newPrice) : "";
    const inv =
      d.inventoryChanged && d.newInventory !== null
        ? String(d.newInventory)
        : "";

    if (!price && !inv) continue;

    const cols = [
      d.handle,
      d.option1Name,
      d.option1Value,
      d.option2Name,
      d.option2Value,
      d.option3Name,
      d.option3Value,
      d.sku,
      price,
      inv,
    ].map(csvEscape);

    lines.push(cols.join(","));
  }

  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return (Math.round(n * 100) / 100).toFixed(2);
}

function csvEscape(v: string): string {
  const s = v ?? "";
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileSystemFileHandle>;
};

/** 自动化/无手势环境不要走 picker，否则会吞掉原生 <a download> */
export function canUseSaveFilePicker(): boolean {
  if (typeof window === "undefined") return false;
  if (navigator.webdriver) return false;
  const w = window as SaveFilePickerWindow;
  return typeof w.showSaveFilePicker === "function";
}

/**
 * 在用户点击手势内同步启动 showSaveFilePicker。
 * 失败（非取消）时用 fallbackUrl + a.download 补救。
 */
export function saveWithFilePickerOrFallback(
  content: string,
  fallbackUrl: string | null
): void {
  const w = window as SaveFilePickerWindow;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });

  const fallback = () => {
    const url =
      fallbackUrl ??
      URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", EXPORT_FILENAME);
    a.download = EXPORT_FILENAME;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (!fallbackUrl) {
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  if (!canUseSaveFilePicker() || typeof w.showSaveFilePicker !== "function") {
    fallback();
    return;
  }

  void w
    .showSaveFilePicker({
      suggestedName: EXPORT_FILENAME,
      types: [
        {
          description: "CSV",
          accept: { "text/csv": [".csv"] },
        },
      ],
    })
    .then(async (handle) => {
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    })
    .catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      fallback();
    });
}
