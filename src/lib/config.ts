// 付款与联系方式配置：在 Vercel 项目 Environment Variables 里设置，改完需重新部署。
// 不要把任何支付密钥写进仓库；这里只放公开的付款链接（Lemon Squeezy / Gumroad / Stripe Payment Link）。
export const LIFETIME_PAYMENT_URL = process.env.NEXT_PUBLIC_LIFETIME_PAYMENT_URL ?? "";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";

export const SITE_URL = "https://supplier-csv-clean.vercel.app";
