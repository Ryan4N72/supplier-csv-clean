import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "供应商 CSV 清洗 · Shopify 导入准备",
  description:
    "本地浏览器工具：供应商脏 Excel/CSV + Shopify 产品导出 → 仅变更行的可导入 CSV。文件不上传服务器。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
