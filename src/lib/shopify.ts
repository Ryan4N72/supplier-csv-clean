import type { ParsedSheet, ShopifyVariant } from "./types";
import { findColumn, cellStr } from "./parse";
import { normalizeSku, parsePrice, parseInventory } from "./damage";

export function mapShopifyVariants(sheet: ParsedSheet): {
  variants: ShopifyVariant[];
  columns: Record<string, string | null>;
} {
  const handleCol = findColumn(sheet.headers, ["Handle", "handle", "产品句柄"]);
  const titleCol = findColumn(sheet.headers, ["Title", "title", "标题", "产品标题"]);
  const skuCol = findColumn(sheet.headers, [
    "Variant SKU",
    "variant sku",
    "SKU",
    "sku",
  ]);
  const priceCol = findColumn(sheet.headers, [
    "Variant Price",
    "variant price",
    "Price",
    "价格",
  ]);
  const invCol = findColumn(sheet.headers, [
    "Variant Inventory Qty",
    "variant inventory qty",
    "Inventory",
    "库存",
  ]);
  const o1n = findColumn(sheet.headers, ["Option1 Name", "option1 name"]);
  const o1v = findColumn(sheet.headers, ["Option1 Value", "option1 value"]);
  const o2n = findColumn(sheet.headers, ["Option2 Name", "option2 name"]);
  const o2v = findColumn(sheet.headers, ["Option2 Value", "option2 value"]);
  const o3n = findColumn(sheet.headers, ["Option3 Name", "option3 name"]);
  const o3v = findColumn(sheet.headers, ["Option3 Value", "option3 value"]);

  if (!handleCol) {
    throw new Error(
      `Shopify 导出未找到 Handle 列。现有列: ${sheet.headers.join(", ")}`
    );
  }
  if (!skuCol) {
    throw new Error(
      `Shopify 导出未找到 Variant SKU 列。现有列: ${sheet.headers.join(", ")}`
    );
  }

  const variants: ShopifyVariant[] = [];
  let lastHandle = "";
  let lastTitle = "";
  let lastO1n = "";
  let lastO2n = "";
  let lastO3n = "";

  sheet.rows.forEach((row, i) => {
    let handle = cellStr(row[handleCol]);
    if (handle) lastHandle = handle;
    else handle = lastHandle;

    let title = titleCol ? cellStr(row[titleCol]) : "";
    if (title) lastTitle = title;
    else title = lastTitle;

    const sku = normalizeSku(cellStr(row[skuCol]));
    // Shopify 导出中，无 SKU 的行可能是图片行等，跳过
    if (!sku && !cellStr(row[priceCol || ""])) {
      return;
    }
    if (!sku) return;

    let option1Name = o1n ? cellStr(row[o1n]) : "";
    let option2Name = o2n ? cellStr(row[o2n]) : "";
    let option3Name = o3n ? cellStr(row[o3n]) : "";
    if (option1Name) lastO1n = option1Name;
    else option1Name = lastO1n;
    if (option2Name) lastO2n = option2Name;
    else option2Name = lastO2n;
    if (option3Name) lastO3n = option3Name;
    else option3Name = lastO3n;

    variants.push({
      handle,
      title,
      option1Name,
      option1Value: o1v ? cellStr(row[o1v]) : "",
      option2Name,
      option2Value: o2v ? cellStr(row[o2v]) : "",
      option3Name,
      option3Value: o3v ? cellStr(row[o3v]) : "",
      sku,
      price: priceCol ? parsePrice(cellStr(row[priceCol])) : null,
      inventory: invCol ? parseInventory(cellStr(row[invCol])) : null,
      rowIndex: i + 2,
    });
  });

  return {
    variants,
    columns: {
      handle: handleCol,
      title: titleCol,
      sku: skuCol,
      price: priceCol,
      inventory: invCol,
      option1Name: o1n,
      option1Value: o1v,
      option2Name: o2n,
      option2Value: o2v,
      option3Name: o3n,
      option3Value: o3v,
    },
  };
}
