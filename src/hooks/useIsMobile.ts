import { useEffect, useState } from "react";

/**
 * 判断是否移动端（仅 UA 判断）。
 * 平板不视为移动端（iPad/Android Tablet/Kindle 等排除）。
 */
export function useIsMobile(): boolean {
  const computeIsMobile = () => {
    if (typeof navigator === "undefined") return false;
    // 仅基于 UA 的判断，明确排除平板
    const ua = navigator.userAgent || "";

    const isIPad = /\biPad\b/i.test(ua);
    const isAndroid = /\bAndroid\b/i.test(ua);
    const hasMobile = /\bMobile\b/i.test(ua);
    const isAndroidTablet = isAndroid && !hasMobile; // Android 平板一般不含 Mobile
    const isTabletGeneric = /\bTablet\b/i.test(ua) || /\bSilk\b/i.test(ua); // Kindle Fire 使用 Silk

    if (isIPad || isAndroidTablet || isTabletGeneric) {
      return false; // 平板不判为移动端
    }

    const isPhone =
      /\biPhone\b/i.test(ua) ||
      /\biPod\b/i.test(ua) ||
      (isAndroid && hasMobile) ||
      /\bIEMobile\b/i.test(ua) ||
      /\bWindows Phone\b/i.test(ua) ||
      /\bOpera Mini\b/i.test(ua) ||
      /\bBlackBerry\b/i.test(ua);

    return Boolean(isPhone);
  };

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(computeIsMobile());
  }, []);

  return isMobile;
}
