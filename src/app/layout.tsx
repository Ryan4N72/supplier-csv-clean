import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

const title = "Shopify Supplier CSV Cleaner";
const description =
  "Clean supplier CSVs, match SKUs with Shopify exports, and export price and inventory changes in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  keywords: [
    "Shopify CSV cleaner",
    "Shopify supplier CSV",
    "supplier spreadsheet",
    "Shopify inventory CSV",
    "Shopify price update",
  ],
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: title,
    title,
    description,
  },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
