// 公开配置。打赏收款码图片放在 public/tip/ 下；地址是公开收款地址，不是密钥。
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";

// 打赏：留空则不显示对应项
export const TIP_LINK_URL = ""; // Ko-fi / Buy Me a Coffee 链接，海外用户用卡或 PayPal
export const TIP_LINK_LABEL = "Tip with card or PayPal";
export const TIP_WECHAT_QR = ""; // 例如 "/tip/wechat.png"
export const TIP_ALIPAY_QR = ""; // 例如 "/tip/alipay.png"
export const TIP_USDC_ADDRESS = "";
export const TIP_USDC_NETWORK = ""; // 例如 "Base"

export const SITE_URL = "https://supplier-csv-clean.vercel.app";

export const HAS_TIP = Boolean(TIP_LINK_URL || TIP_WECHAT_QR || TIP_ALIPAY_QR || TIP_USDC_ADDRESS);
