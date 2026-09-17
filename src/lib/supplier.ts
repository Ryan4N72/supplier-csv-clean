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

const SKU_CANDIDATES = [
  "sku",
  "SKU",
  "货号",
  "商品编码",
  "条码",
  "barcode",
  "Barcode",
  "供应商SKU",
  "Variant SKU",
  "产品SKU",
];

const PRICE_CANDIDATES = [
  "price",
  "Price",
  "单价",
  "价格",
  "供货价",
  "成本价",
  "cost",
  "Cost",
  "Variant Price",
  "售价",
];

const INV_CANDIDATES = [
  "inventory",
  "Inventory",
  "qty",
  "Qty",
  "quantity",
  "Quantity",
  "库存",
  "数量",
  "库存数量",
  "Variant Inventory Qty",
  "可售库存",
];

export function mapSupplierRows(sheet: ParsedSheet): {
  rows: SupplierRow[];
  skuCol: string | null;
  priceCol: string | null;
  invCol: string | null;
} {
  const skuCol = findColumn(sheet.headers, SKU_CANDIDATES);
  const priceCol = findColumn(sheet.headers, PRICE_CANDIDATES);
  const invCol = findColumn(sheet.headers, INV_CANDIDATES);

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
    // 额外启发式：若原始看起来是纯数字且 sheet 可能丢了前导零 —
    // 当 raw 不含前导零但长度像条码（12/13）且用户备注 — MVP 跳过。
    // 若 cell 以 Date 形式进来，cellStr 已转成日期字符串，detectSkuDamage 会标 date_swallowed。
    if (lz) damages.push(lz);

    // 纯数字 SKU 长度较短且以 0 开头的文本在 Excel 中常被吃掉：
    // 检测：rawSku 全数字、无前导零，但同文件其他行有前导零风格 — 太重，跳过。
    // 另一种：rawSku 匹配 Excel 序列号日期数字（如 44927）且像日期
    if (/^\d{5}$/.test(rawSku.trim())) {
      const n = Number(rawSku);
      // Excel serial date roughly 30000-60000 = years 1982-2064
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
      rowIndex: i + 2, // 1-based + header
      damages,
    });
  });

  return { rows, skuCol, priceCol, invCol };
}
