import { TIP_WECHAT_QR, TIP_ALIPAY_QR, TIP_USDC_ADDRESS, TIP_USDC_NETWORK } from "@/lib/config";

// 打赏区：三项都没配置时整块不显示
export function TipJar() {
  if (!TIP_WECHAT_QR && !TIP_ALIPAY_QR && !TIP_USDC_ADDRESS) return null;
  return (
    <section id="tip" className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
      <h2 className="text-sm font-semibold text-slate-900">Leave a tip (optional)</h2>
      <p className="mt-1 text-xs text-slate-500">
        The tool is free. If it saved you time, a tip helps keep it running.
      </p>
      <div className="mt-4 flex flex-wrap gap-6">
        {TIP_WECHAT_QR && (
          <figure className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIP_WECHAT_QR} alt="WeChat Pay QR code" width={160} height={160} className="h-40 w-40 rounded-lg border border-slate-200 object-contain" />
            <figcaption className="mt-1 text-xs">WeChat Pay</figcaption>
          </figure>
        )}
        {TIP_ALIPAY_QR && (
          <figure className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIP_ALIPAY_QR} alt="Alipay QR code" width={160} height={160} className="h-40 w-40 rounded-lg border border-slate-200 object-contain" />
            <figcaption className="mt-1 text-xs">Alipay</figcaption>
          </figure>
        )}
      </div>
      {TIP_USDC_ADDRESS && (
        <div className="mt-4 text-xs">
          <p className="font-medium text-slate-900">
            USDC{TIP_USDC_NETWORK ? ` (${TIP_USDC_NETWORK} only)` : ""}
          </p>
          <code className="mt-1 block break-all rounded bg-slate-100 px-2 py-1 font-mono text-slate-800">
            {TIP_USDC_ADDRESS}
          </code>
        </div>
      )}
    </section>
  );
}
