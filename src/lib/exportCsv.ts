import type { DiffRow } from "./types";

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

/** 标准 <a download> 保存；无 File System Access / 无服务端路由 */
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shopify-price-inventory-delta.csv";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  void filename; // 调用方仍传名；实际保存名固定为上式，避免漂移
}
