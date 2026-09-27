import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Thank you · Shopify Supplier CSV Cleaner",
  robots: { index: false },
};

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Thanks for your purchase!
      </h1>
      <p className="mt-3 text-slate-600">
        Your payment went through. A receipt has been sent to your email by the
        payment provider.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">What to do next</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
        <li>
          Find your unlock code in your receipt email or on the checkout confirmation
          page.
        </li>
        <li>
          Open the cleaner at{" "}
          <a className="font-medium text-indigo-700 underline" href="/app">
            supplier-csv-clean.vercel.app/app
          </a>{" "}
          and bookmark it.
        </li>
        <li>In Shopify admin, go to Products and export your products as CSV.</li>
        <li>Upload your supplier file and the Shopify export, then run the dry run.</li>
        <li>
          Under the results, paste your unlock code once. It is saved in this browser,
          and every export now includes all changed rows.
        </li>
        <li>Download the CSV with only the changed rows.</li>
        <li>In Shopify, import that CSV and choose to overwrite existing products.</li>
      </ol>

      <p className="mt-8 text-sm text-slate-600">
        No account or login is needed. Your files are processed in your browser and
        never uploaded.
        {SUPPORT_EMAIL && (
          <>
            {" "}Questions or a file that doesn&apos;t work? Email{" "}
            <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            .
          </>
        )}
      </p>

      <a
        href="/app"
        className="mt-8 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Open the cleaner
      </a>
    </main>
  );
}
