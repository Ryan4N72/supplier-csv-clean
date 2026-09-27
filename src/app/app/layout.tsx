import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaner · Shopify Supplier CSV Cleaner",
  description:
    "Upload a supplier CSV and your Shopify export, preview price and inventory changes, and download only the changed rows. Runs in your browser.",
  alternates: { canonical: "/app" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
