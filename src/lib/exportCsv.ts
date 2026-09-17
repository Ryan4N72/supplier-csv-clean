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

/**
 * 强制以指定文件名下载。
 * 用 application/octet-stream，避免部分浏览器把 blob: UUID 当地址栏文件名。
 */
export function downloadTextFile(filename: string, content: string) {
  const safeName = filename.toLowerCase().endsWith(".csv")
    ? filename
    : `${filename}.csv`;

  const blob = new Blob([content], {
    type: "application/octet-stream",
  });

  // 旧 Edge
  const nav = window.navigator as Navigator & {
    msSaveOrOpenBlob?: (b: Blob, name?: string) => boolean;
  };
  if (typeof nav.msSaveOrOpenBlob === "function") {
    nav.msSaveOrOpenBlob(blob, safeName);
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.setAttribute("download", safeName);
  a.download = safeName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
  );
  // 延迟 revoke，避免部分浏览器还没开始下载就丢掉名字
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 2000);
}
