import * as XLSX from "xlsx";
import type { ParsedSheet } from "./types";

function isCsvName(name: string): boolean {
  return /\.csv$/i.test(name);
}

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

function cleanHeaders<T extends Record<string, unknown>>(
  rows: T[]
): { headers: string[]; rows: Record<string, unknown>[] } {
  if (rows.length === 0) return { headers: [], rows: [] };
  const rawHeaders = Object.keys(rows[0]);
  const headers = rawHeaders.map((h) => stripBom(String(h)).trim());
  const mapped = rows.map((row) => {
    const out: Record<string, unknown> = {};
    rawHeaders.forEach((h, i) => {
      out[headers[i]] = row[h];
    });
    return out;
  });
  return { headers, rows: mapped };
}

function workbookToSheet(workbook: XLSX.WorkBook, fileName: string): ParsedSheet {
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("文件中没有工作表");
  }
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  const cleaned = cleanHeaders(json);
  let headers = cleaned.headers;
  if (headers.length === 0) {
    const first = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
    headers = (first || []).map((h) => stripBom(String(h)).trim());
  }
  return { headers, rows: cleaned.rows, fileName };
}

/** 浏览器本地解析 Excel/CSV，不上传服务器 */
export async function parseFile(file: File): Promise<ParsedSheet> {
  if (isCsvName(file.name)) {
    const text = stripBom(await file.text());
    const workbook = XLSX.read(text, {
      type: "string",
      raw: false,
      cellDates: true,
      codepage: 65001,
    });
    return workbookToSheet(workbook, file.name);
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: "array",
    raw: false,
    cellDates: true,
    codepage: 65001,
  });
  return workbookToSheet(workbook, file.name);
}

/** 从 URL 拉取样例（仍在浏览器端解析，仅用于 demo） */
export async function parseSampleUrl(
  url: string,
  fileName: string
): Promise<ParsedSheet> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`无法加载样例: ${url}`);

  if (isCsvName(fileName) || isCsvName(url)) {
    const text = stripBom(await res.text());
    const workbook = XLSX.read(text, {
      type: "string",
      raw: false,
      cellDates: true,
      codepage: 65001,
    });
    return workbookToSheet(workbook, fileName);
  }

  const buffer = await res.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: "array",
    raw: false,
    cellDates: true,
    codepage: 65001,
  });
  return workbookToSheet(workbook, fileName);
}

export function findColumn(
  headers: string[],
  candidates: string[]
): string | null {
  const normalized = headers.map((h) => ({
    raw: h,
    key: String(h).trim().toLowerCase().replace(/\s+/g, " "),
  }));
  for (const c of candidates) {
    const target = c.toLowerCase();
    const hit = normalized.find((h) => h.key === target);
    if (hit) return hit.raw;
  }
  for (const c of candidates) {
    const target = c.toLowerCase();
    const hit = normalized.find(
      (h) => h.key.includes(target) || target.includes(h.key)
    );
    if (hit) return hit.raw;
  }
  return null;
}

export function cellStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    const m = v.getMonth() + 1;
    const d = v.getDate();
    const y = v.getFullYear();
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return String(v).trim();
}
