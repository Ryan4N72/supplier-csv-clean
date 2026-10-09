import { BuyButtons } from "@/components/BuyButtons";
import { TipJar } from "@/components/TipJar";
import { HAS_TIP } from "@/lib/config";
import { SUPPORT_EMAIL } from "@/lib/config";

const steps = [
  { t: "Upload your supplier CSV", d: "CSV or Excel, with SKU, price and inventory columns." },
  { t: "Match it with your Shopify export", d: "SKUs are matched to your products. Broken Excel cells are flagged." },
  { t: "Download only the changed rows", d: "A Shopify-ready CSV with just the price and inventory updates." },
];

const audience = [
  "Shopify store owners",
  "Dropshippers",
  "Stores working with supplier spreadsheets",
  "Anyone who regularly updates price or inventory",
];

const faqs = [
  {
    q: "How do I update Shopify prices and inventory from a supplier CSV?",
    a: "Export your products from Shopify admin, upload that file and your supplier's CSV or Excel file here, check the dry run, then import the downloaded CSV back into Shopify with \"Overwrite existing products\" on. Only the variants whose price or inventory changed are in the file.",
  },
  {
    q: "Why does my supplier spreadsheet break SKUs?",
    a: "Excel often turns long barcodes into scientific notation (1.23E+12), drops leading zeros, or reads codes like 3-15 as dates. The cleaner flags those rows so you can fix them before importing.",
  },
  {
    q: "Is my file uploaded anywhere?",
    a: "No. Everything runs in your browser and the page is blocked from sending data to any server.",
  },
  {
    q: "Is it free?",
    a: "Yes. No account, no row limit.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Supplier CSV Cleaner",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web browser",
      url: "https://supplier-csv-clean.vercel.app/",
      description:
        "Free tool that matches a supplier CSV with your Shopify product export and outputs only the price and inventory changes as a Shopify-ready CSV.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="flex items-center justify-between gap-3 py-5 text-sm">
        <span className="font-semibold text-slate-900">Supplier CSV Cleaner</span>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="text-slate-600 hover:text-slate-900">
            Free
          </a>
          <a href="/app" className="font-semibold text-indigo-700 hover:underline">
            Open app
          </a>
        </div>
      </nav>

      <section className="py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Clean Supplier CSVs for Shopify
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Match supplier spreadsheets with your Shopify export and update only the
          products that actually changed.
        </p>
        <p className="mt-3 text-sm font-medium text-emerald-700">
          Your files stay in your browser. Nothing is uploaded.
        </p>
        <div className="mt-8">
          <BuyButtons />
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.t} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-10">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-950">Privacy first</h2>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900">
            Your files never leave your browser. The page is served with a
            Content-Security-Policy of <code>connect-src &apos;none&apos;</code>, so
            it cannot send network requests. You can check this in your browser&apos;s
            developer tools under Network.
          </p>
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-xl font-semibold text-slate-900">Who is this for?</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {audience.map((a) => (
            <li key={a} className="flex gap-2 text-sm text-slate-700">
              <span className="text-indigo-600">✓</span>
              {a}
            </li>
          ))}
        </ul>
      </section>

      <section id="faq" className="py-10">
        <h2 className="text-xl font-semibold text-slate-900">FAQ</h2>
        <div className="mt-5 space-y-5">
          {faqs.map((f) => (
            <div key={f.q}>
              <h3 className="text-sm font-semibold text-slate-900">{f.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="scroll-mt-6 py-10">
        <h2 className="text-xl font-semibold text-slate-900">Free to use</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          No account, no row limit, no upload. Export every changed row.
          {HAS_TIP && " If it saves you time, you can leave a tip below."}
        </p>
        <div className="mt-6">
          <BuyButtons />
        </div>
      </section>

      <footer className="mt-10 border-t border-slate-200 py-8 text-xs text-slate-500">
        <p>
          Supplier CSV Cleaner · Works with Shopify product CSV exports. Not affiliated
          with Shopify.
          {SUPPORT_EMAIL && (
            <>
              {" "}Contact:{" "}
              <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </>
          )}
        </p>
        <TipJar />
      </footer>
    </main>
  );
}
