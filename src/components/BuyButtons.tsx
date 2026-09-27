import { LIFETIME_PAYMENT_URL, MONTHLY_PAYMENT_URL } from "@/lib/config";

const base =
  "inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold shadow-sm sm:w-auto";

function Buy({ url, label, primary }: { url: string; label: string; primary?: boolean }) {
  const style = primary
    ? "bg-slate-900 text-white hover:bg-slate-700"
    : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100";
  if (!url) {
    return (
      <span
        aria-disabled="true"
        title="Payment link not configured yet"
        className={`${base} cursor-not-allowed border border-dashed border-slate-300 bg-white text-slate-400`}
      >
        {label} (coming soon)
      </span>
    );
  }
  return (
    <a href={url} rel="noopener" className={`${base} ${style}`}>
      {label}
    </a>
  );
}

export function BuyButtons({ showTry = true }: { showTry?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {showTry && (
        <a
          href="/app"
          className={`${base} bg-indigo-600 text-white hover:bg-indigo-500`}
        >
          Try it Free
        </a>
      )}
      <Buy url={LIFETIME_PAYMENT_URL} label="Buy Lifetime — $29" primary />
      <Buy url={MONTHLY_PAYMENT_URL} label="Monthly — $9/mo" />
    </div>
  );
}
