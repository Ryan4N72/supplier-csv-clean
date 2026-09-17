import type { DiffRow } from "./types";

const EXPORT_FILENAME = "shopify-price-inventory-delta.csv";

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

/** 优先 showSaveFilePicker(suggestedName)；否则标准 a.download 回退 */
export async function downloadTextFile(
  _filename: string,
  content: string
): Promise<void> {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const w = window as SaveFilePickerWindow;

  if (typeof w.showSaveFilePicker === "function") {
    try {
      const handle = await w.showSaveFilePicker({
        suggestedName: EXPORT_FILENAME,
        types: [
          {
            description: "CSV",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // 用户取消：不再回退，避免二次弹下载
      if (err instanceof DOMException && err.name === "AbortError") return;
      // 其它失败 → 回退 a.download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = EXPORT_FILENAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
