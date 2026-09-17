import type { DamageFlag } from "./types";

const SCI_RE = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/;
const DATE_LIKE_RE =
  /^(\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}|\d{1,2}-[A-Za-z]{3}-\d{2,4}|[A-Za-z]{3}\s+\d{1,2},?\s*\d{2,4})$/;
const THOUSAND_RE = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/;
const LEADING_ZERO_HINT = /^0\d+$/;

/** 检测 SKU / 数量上的 Excel 损坏迹象 */
export function detectSkuDamage(raw: string): DamageFlag[] {
  const flags: DamageFlag[] = [];
  const s = raw.trim();
  if (!s) {
    flags.push({
      type: "blank_sku",
      field: "sku",
      message: "SKU 为空",
      raw: s,
    });
    return flags;
  }
  if (SCI_RE.test(s)) {
    flags.push({
      type: "scientific_notation",
      field: "sku",
      message: `SKU 疑似科学计数法: ${s}`,
      raw: s,
    });
  }
  if (DATE_LIKE_RE.test(s) || /^\d{4}-\d{2}-\d{2}/.test(s)) {
    // 纯数字 SKU 被 Excel 当成日期后读出
    flags.push({
      type: "date_swallowed",
      field: "sku",
      message: `SKU 疑似被日期格式吞掉: ${s}`,
      raw: s,
    });
  }
  // 若原始文本曾带前导零但解析后丢失，调用方可用 hint；这里对纯数字短 SKU 给出提示性检查
  // 实际「前导零丢失」需对比供应商源文本；此处检测「看起来像被剥掉前导零」的常见模式：
  // 例如供应商列显示 1234 但列名/备注暗示条码，或单元格以数字形式存在。
  // MVP：若 SKU 全为数字且长度 < 典型条码，不自动标 leading_zero；由 normalize 保留文本。
  return flags;
}

export function detectInventoryDamage(raw: string): DamageFlag[] {
  const flags: DamageFlag[] = [];
  const s = raw.trim();
  if (!s) return flags;
  if (THOUSAND_RE.test(s)) {
    flags.push({
      type: "thousand_separator",
      field: "inventory",
      message: `库存含千分位分隔符: ${s}`,
      raw: s,
    });
  }
  if (SCI_RE.test(s)) {
    flags.push({
      type: "scientific_notation",
      field: "inventory",
      message: `库存为科学计数法: ${s}`,
      raw: s,
    });
  }
  return flags;
}

/** 规范化 SKU：展开科学计数法、去掉多余空白；尽量保留前导零（文本） */
export function normalizeSku(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  if (SCI_RE.test(s)) {
    try {
      const n = Number(s);
      if (Number.isFinite(n) && Number.isInteger(n)) {
        s = String(Math.trunc(n));
      }
    } catch {
      /* keep */
    }
  }
  // 去掉不可见字符
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  return s;
}

/** 解析价格 */
export function parsePrice(raw: string): number | null {
  const s = raw.trim().replace(/[￥$€£,\s]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** 解析库存（处理千分位、科学计数法） */
export function parseInventory(raw: string): number | null {
  let s = raw.trim();
  if (!s) return null;
  if (THOUSAND_RE.test(s)) {
    s = s.replace(/,/g, "");
  }
  if (SCI_RE.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  s = s.replace(/[^\d.\-]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** 额外：对比「文本单元格 vs 数字单元格」时标记前导零丢失 */
export function flagLeadingZeroLost(
  originalText: string,
  normalized: string
): DamageFlag | null {
  if (
    LEADING_ZERO_HINT.test(originalText.trim()) &&
    normalized === String(Number(originalText.trim()))
  ) {
    return {
      type: "leading_zero_lost",
      field: "sku",
      message: `前导零可能已丢失: 原文 "${originalText}" → "${normalized}"`,
      raw: originalText,
    };
  }
  // 若原文是数字字符串但 normalize 后与 Number 相同且原文有前导零特征（被 SheetJS raw:false 已变成无零）
  // 由调用方传入 hint
  return null;
}

export const DAMAGE_LABELS: Record<string, string> = {
  leading_zero_lost: "前导零丢失",
  scientific_notation: "科学计数法",
  date_swallowed: "日期吞掉 SKU",
  thousand_separator: "千分位数量",
  blank_sku: "空 SKU",
};
