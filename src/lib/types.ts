/** 供应商行（清洗后） */
export type SupplierRow = {
  rawSku: string;
  sku: string;
  price: number | null;
  inventory: number | null;
  rowIndex: number;
  damages: DamageFlag[];
};

export type DamageType =
  | "leading_zero_lost"
  | "scientific_notation"
  | "date_swallowed"
  | "thousand_separator"
  | "blank_sku";

export type DamageFlag = {
  type: DamageType;
  field: "sku" | "price" | "inventory";
  message: string;
  raw: string;
};

/** Shopify 变体行 */
export type ShopifyVariant = {
  handle: string;
  title: string;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  option3Name: string;
  option3Value: string;
  sku: string;
  price: number | null;
  inventory: number | null;
  rowIndex: number;
};

export type MatchStatus = "matched" | "unmatched_supplier" | "unmatched_shopify";

export type DiffRow = {
  status: MatchStatus;
  sku: string;
  handle: string;
  title: string;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  option3Name: string;
  option3Value: string;
  oldPrice: number | null;
  newPrice: number | null;
  oldInventory: number | null;
  newInventory: number | null;
  priceChanged: boolean;
  inventoryChanged: boolean;
  blankOverwrite: boolean;
  damages: DamageFlag[];
  supplierRowIndex: number | null;
  shopifyRowIndex: number | null;
};

export type DryRunReport = {
  supplierCount: number;
  shopifyVariantCount: number;
  matchedCount: number;
  unmatchedSupplier: DiffRow[];
  unmatchedShopifySkus: string[];
  matchRate: number;
  damageCount: number;
  damages: DamageFlag[];
  changedCount: number;
  blankOverwriteCount: number;
  blankOverwrites: DiffRow[];
  sampleDiffs: DiffRow[];
  allDiffs: DiffRow[];
  changedDiffs: DiffRow[];
};

export type ParsedSheet = {
  headers: string[];
  rows: Record<string, unknown>[];
  fileName: string;
};
