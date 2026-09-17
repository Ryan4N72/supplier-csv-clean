import type { DiffRow } from "./types";

/** Shopify 导入用 UTF-8 BOM CSV；仅输出有意覆盖的列 */
export function buildChangedCsv(changed: DiffRow[]): string {
  // 仅写入：Handle + Option 列（定位变体）+ Variant SKU + 变更的价格/库存
  // 不输出 Title/Body/Image 等，避免误覆盖
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
    // 未变更字段留空（Shopify 空单元格 = 不更新该字段）
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

  // UTF-8 BOM
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

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/csv;charset=utf-8"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
