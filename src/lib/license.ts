// 付费墙：不接服务器，不走网络（保持 CSP connect-src 'none'）。
// 解锁码只以 SHA-256 形式放在包里；明文只放在支付平台的收据 / 感谢页。
// 可被技术用户绕过，第一版收入够用。换码：设置 NEXT_PUBLIC_UNLOCK_CODE_HASH 并重新部署。
export const FREE_EXPORT_LIMIT = 20;

const UNLOCK_HASH =
  process.env.NEXT_PUBLIC_UNLOCK_CODE_HASH ||
  "bf02a0394a02088ae72692a7e901c27d1b49268706976a5a2da4a9604dd97461";

const STORAGE_KEY = "scc-unlocked-v1";

function normalize(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === UNLOCK_HASH;
  } catch {
    return false;
  }
}

export async function tryUnlock(code: string): Promise<boolean> {
  const hash = await sha256Hex(normalize(code));
  if (hash !== UNLOCK_HASH) return false;
  try {
    localStorage.setItem(STORAGE_KEY, UNLOCK_HASH);
  } catch {
    /* 隐私模式下存不住：本次会话仍解锁 */
  }
  return true;
}
