# 供应商 CSV 清洗 → Shopify 导入准备（MVP）

本地浏览器工具：上传**供应商脏 Excel/CSV** + **Shopify 产品导出**，按 SKU 映射到 Handle/变体，检测常见 Excel 损坏，干跑核对后**仅下载价格/库存有变更**的 UTF-8 BOM CSV。

> **100% 浏览器本地处理**：使用 SheetJS（`xlsx`）在客户端解析，**不会**把文件内容上传到任何服务器 API。

## 快速开始

```bash
cd supplier-csv-clean
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，点击「加载演示样例」即可在约 3 分钟内走完：上传 → 干跑 → 下载。

生产构建：

```bash
npm run build
npm start
```

## 演示路径（3 分钟）

1. 打开应用，点 **加载演示样例**（或自行上传 `public/samples/` 下的文件）
2. 查看干跑面板：匹配率、损坏数、空白覆盖警告、变更样例
3. 点 **下载变更 CSV**，得到带 UTF-8 BOM、仅变更行的 Shopify 可导入文件

样例文件：

| 文件 | 说明 |
|------|------|
| `public/samples/supplier-catalog.csv` / `.xlsx` | 供应商目录（列：SKU / Name / Price / Inventory；含科学计数法、日期型 SKU、千分位库存、未匹配 SKU、空价格等） |
| `public/samples/shopify-products-export.csv` / `.xlsx` | 模拟 Shopify Products Export（含 Option 变体） |

样例干跑预期（约）：匹配 7 行、变更约 5 行、未匹配含 `3/15/24` 与 `ONLY-SUPPLIER`、空白覆盖 1（`BAG-01`）、损坏含科学计数法/日期/千分位。

## 功能清单（已实现）

1. **双文件上传**：供应商目录 + Shopify 导出（xlsx/csv）
2. **SKU → Handle 映射**：支持 Option1/2/3 变体；输出未匹配供应商 SKU 报告
3. **Excel 损坏检测**：科学计数法、日期吞掉 SKU、千分位数量、前导零丢失（启发式）、空 SKU
4. **仅导出变更行**：只写价格/库存相对 Shopify 有变化的行；UTF-8 BOM；列仅含 Handle / Option / Variant SKU / Variant Price / Variant Inventory Qty（未变更字段留空，避免误覆盖）
5. **干跑检查清单**：匹配率、损坏计数、空白覆盖警告、样例 diff
6. **纯前端**：无服务端上传、无 Shopify API

## MVP 边界（不做）

- Shopify Admin API / 自动同步
- FTP、定时 cron
- AI 清洗、PDF 解析
- 完整新品创建 / 多店铺 / PIM
- 用户登录与鉴权

## 列名识别

供应商表会尝试匹配：`SKU` / `货号` / `条码`、`Price` / `价格` / `供货价`、`Inventory` / `库存` / `数量` / `Qty` 等。

Shopify 表需要标准导出列：`Handle`、`Variant SKU`、`Variant Price`、`Variant Inventory Qty`，以及可选的 `Option1/2/3 Name/Value`。

CSV 按 UTF-8 解析（自动去除 BOM），中文列名在 UTF-8 文件下可用。

## 部署说明

本应用为 Next.js App Router 前端（业务逻辑全在 `"use client"`）。可部署到 Vercel：将项目根目录 `supplier-csv-clean` 作为 Root Directory 导入即可。

```bash
npm run build
```

部署后仍是浏览器本地处理文件；请勿另行添加会接收文件内容的 API 路由。

## 技术栈

- Next.js 14（App Router）+ TypeScript + Tailwind CSS
- SheetJS `xlsx`（客户端）

## 已知限制

- 同一 SKU 多变体时仅取 Shopify 导出中**首次出现**的行
- 前导零检测为启发式；严重损坏的 Excel 仍需人工核对
- 供应商价格/库存为空时**不会**写入空值覆盖店铺（会在干跑中警告）
- 未做单位换算、多货币、多库存地点
- 中文 UI；错误信息以中文为主

## 许可

仅供内部演示与 MVP 验证。
