import { LIFETIME_PAYMENT_URL } from "@/lib/config";

const base =
  "inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold shadow-sm sm:w-auto";

// 付款链接未配置时不显示购买按钮，避免首屏出现点不了的按钮
export function BuyButtons({ showTry = true }: { showTry?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {showTry && (
        <a href="/app" className={`${base} bg-indigo-600 text-white hover:bg-indigo-500`}>
          Try it Free
        </a>
      )}
      {LIFETIME_PAYMENT_URL && (
        <a
          href={LIFETIME_PAYMENT_URL}
          rel="noopener"
          className={`${base} bg-slate-900 text-white hover:bg-slate-700`}
        >
          Buy Lifetime — $29
        </a>
      )}
    </div>
  );
}
