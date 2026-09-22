import type { ParsedSheet, SupplierRow, DamageFlag } from "./types";
import { findColumn, cellStr } from "./parse";
import {
  detectSkuDamage,
  detectInventoryDamage,
  normalizeSku,
  parsePrice,
  parseInventory,
  flagLeadingZeroLost,
} from "./damage";

/** 对外展示 / 折叠说明用 */
export const SUPPLIER_SKU_ALIASES = [
  "SKU",
  "sku",
  "货号",
  "商品编码",
  "编码",
  "型号",
  "条码",
  "barcode",
  "Barcode",
  "供应商SKU",
  "Variant SKU",
  "产品SKU",
];

export const SUPPLIER_PRICE_ALIASES = [
  "价格",
  "单价",
  "供货价",
  "成本价",
  "售价",
  "price",
  "Price",
  "cost",
  "Cost",
  "Variant Price",
];

export const SUPPLIER_INV_ALIASES = [
  "库存",
  "数量",
  "库存数量",
  "可售库存",
  "inventory",
  "Inventory",
  "qty",
  "Qty",
  "quantity",
  "Quantity",
  "Variant Inventory Qty",
];

export type SupplierColumnMapping = {
  skuCol: string;
  priceCol: string | null;
  invCol: string | null;
};

export function detectSupplierColumns(sheet: ParsedSheet): {
  skuCol: string | null;
  priceCol: string | null;
  invCol: string | null;
} {
  return {
    skuCol: findColumn(sheet.headers, SUPPLIER_SKU_ALIASES),
    priceCol: findColumn(sheet.headers, SUPPLIER_PRICE_ALIASES),
    invCol: findColumn(sheet.headers, SUPPLIER_INV_ALIASES),
  };
}

export function mapSupplierRows(
  sheet: ParsedSheet,
  mapping?: SupplierColumnMapping
): {
  rows: SupplierRow[];
  skuCol: string;
  priceCol: string | null;
  invCol: string | null;
} {
  const auto = detectSupplierColumns(sheet);
  const skuCol = mapping?.skuCol ?? auto.skuCol;
  const priceCol =
    mapping?.priceCol !== undefined ? mapping.priceCol : auto.priceCol;
  const invCol = mapping?.invCol !== undefined ? mapping.invCol : auto.invCol;

  if (!skuCol) {
    throw new Error(
      `供应商文件未找到 SKU 列。现有列: ${sheet.headers.join(", ")}`
    );
  }

  const rows: SupplierRow[] = [];
  sheet.rows.forEach((row, i) => {
    const rawSku = cellStr(row[skuCol]);
    const rawPrice = priceCol ? cellStr(row[priceCol]) : "";
    const rawInv = invCol ? cellStr(row[invCol]) : "";

    const damages: DamageFlag[] = [
      ...detectSkuDamage(rawSku),
      ...detectInventoryDamage(rawInv),
    ];

    const sku = normalizeSku(rawSku);
    const lz = flagLeadingZeroLost(rawSku, sku);
    if (lz) damages.push(lz);

    if (/^\d{5}$/.test(rawSku.trim())) {
      const n = Number(rawSku);
      if (n >= 30000 && n <= 60000) {
        damages.push({
          type: "date_swallowed",
          field: "sku",
          message: `SKU 疑似 Excel 日期序列号: ${rawSku}`,
          raw: rawSku,
        });
      }
    }

    rows.push({
      rawSku,
      sku,
      price: parsePrice(rawPrice),
      inventory: parseInventory(rawInv),
      rowIndex: i + 2,
      damages,
    });
  });

  return { rows, skuCol, priceCol, invCol };
}
