import type { SupplierRow, ShopifyVariant, DiffRow, DryRunReport, DamageFlag } from "./types";

function numEq(a: number | null, b: number | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return Math.abs(a - b) < 0.0001;
}

export function buildDryRun(
  suppliers: SupplierRow[],
  shopify: ShopifyVariant[]
): DryRunReport {
  const bySku = new Map<string, ShopifyVariant>();
  for (const v of shopify) {
    if (!bySku.has(v.sku)) bySku.set(v.sku, v);
  }

  const matchedSkus = new Set<string>();
  const allDiffs: DiffRow[] = [];
  const unmatchedSupplier: DiffRow[] = [];
  const damages: DamageFlag[] = [];

  for (const s of suppliers) {
    for (const d of s.damages) damages.push(d);

    const v = s.sku ? bySku.get(s.sku) : undefined;
    if (!v) {
      const row: DiffRow = {
        status: "unmatched_supplier",
        sku: s.sku || s.rawSku,
        handle: "",
        title: "",
        option1Name: "",
        option1Value: "",
        option2Name: "",
        option2Value: "",
        option3Name: "",
        option3Value: "",
        oldPrice: null,
        newPrice: s.price,
        oldInventory: null,
        newInventory: s.inventory,
        priceChanged: false,
        inventoryChanged: false,
        blankOverwrite: false,
        damages: s.damages,
        supplierRowIndex: s.rowIndex,
        shopifyRowIndex: null,
      };
      unmatchedSupplier.push(row);
      allDiffs.push(row);
      continue;
    }

    matchedSkus.add(v.sku);
    const priceChanged = !numEq(v.price, s.price) && s.price !== null;
    const inventoryChanged =
      !numEq(v.inventory, s.inventory) && s.inventory !== null;

    // 空白覆盖警告：供应商价格/库存为空，而 Shopify 有值（若强制写入会清空）
    const blankOverwrite =
      (s.price === null && v.price !== null) ||
      (s.inventory === null && v.inventory !== null);

    const row: DiffRow = {
      status: "matched",
      sku: s.sku,
      handle: v.handle,
      title: v.title,
      option1Name: v.option1Name,
      option1Value: v.option1Value,
      option2Name: v.option2Name,
      option2Value: v.option2Value,
      option3Name: v.option3Name,
      option3Value: v.option3Value,
      oldPrice: v.price,
      newPrice: s.price,
      oldInventory: v.inventory,
      newInventory: s.inventory,
      priceChanged,
      inventoryChanged,
      blankOverwrite,
      damages: s.damages,
      supplierRowIndex: s.rowIndex,
      shopifyRowIndex: v.rowIndex,
    };
    allDiffs.push(row);
  }

  const unmatchedShopifySkus = shopify
    .map((v) => v.sku)
    .filter((sku) => sku && !matchedSkus.has(sku));

  const changedDiffs = allDiffs.filter(
    (d) => d.status === "matched" && (d.priceChanged || d.inventoryChanged)
  );
  const blankOverwrites = allDiffs.filter((d) => d.blankOverwrite);
  const matchedCount = matchedSkus.size;
  const supplierWithSku = suppliers.filter((s) => s.sku).length;
  const matchRate =
    supplierWithSku === 0 ? 0 : matchedCount / supplierWithSku;

  return {
    supplierCount: suppliers.length,
    shopifyVariantCount: shopify.length,
    matchedCount,
    unmatchedSupplier,
    unmatchedShopifySkus: Array.from(new Set(unmatchedShopifySkus)),
    matchRate,
    damageCount: damages.length,
    damages,
    changedCount: changedDiffs.length,
    blankOverwriteCount: blankOverwrites.length,
    blankOverwrites,
    sampleDiffs: changedDiffs.slice(0, 8),
    allDiffs,
    changedDiffs,
  };
}
