/** 空白模板：仅表头，方便用户填列 */

export const SUPPLIER_TEMPLATE_FILENAME = "supplier-catalog-template.csv";
export const SHOPIFY_TEMPLATE_FILENAME = "shopify-products-export-template.csv";

const SUPPLIER_HEADERS = ["SKU", "价格", "库存"];
const SHOPIFY_HEADERS = [
  "Handle",
  "Title",
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

function downloadCsv(filename: string, headers: string[]) {
  const csv = "\uFEFF" + headers.join(",") + "\r\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadSupplierTemplate() {
  downloadCsv(SUPPLIER_TEMPLATE_FILENAME, SUPPLIER_HEADERS);
}

export function downloadShopifyTemplate() {
  downloadCsv(SHOPIFY_TEMPLATE_FILENAME, SHOPIFY_HEADERS);
}
