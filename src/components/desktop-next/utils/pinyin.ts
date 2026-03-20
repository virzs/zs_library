// GB2312 拼音边界字符表 — 每个声母取一个代表汉字。
// 通过 Intl.Collator("zh-CN") 二分查找，将汉字映射到 A–Z 首字母。
// 以下 Unicode 转义值均为刻意选取：每个值是 GB2312-1980 排序中对应声母分组的第一个字。
const PINYIN_BOUNDARIES: [string, string][] = [
  ["\u554A", "A"], // 啊
  ["\u82AD", "B"], // 芭
  ["\u64E6", "C"], // 擦
  ["\u642D", "D"], // 搭
  ["\u86FE", "E"], // 蛾
  ["\u53D1", "F"], // 发
  ["\u5676", "G"], // 噶
  ["\u54C8", "H"], // 哈
  ["\u51FB", "J"], // 击
  ["\u5580", "K"], // 喀
  ["\u5783", "L"], // 垃
  ["\u5988", "M"], // 妈
  ["\u62FF", "N"], // 拿
  ["\u54E6", "O"], // 哦
  ["\u556A", "P"], // 啪
  ["\u671F", "Q"], // 期
  ["\u7136", "R"], // 然
  ["\u4E09", "S"], // 三
  ["\u4ED6", "T"], // 他
  ["\u5B8C", "W"], // 完
  ["\u4E60", "X"], // 习
  ["\u538B", "Y"], // 压
  ["\u531D", "Z"], // 匝
];

const collator = new Intl.Collator("zh-CN", { sensitivity: "base" });

const sortedBoundaries = [...PINYIN_BOUNDARIES].sort((a, b) =>
  collator.compare(a[0], b[0]),
);

const pinyinCache = new Map<string, string>();

function chinesePinyinInitial(char: string): string | null {
  const code = char.codePointAt(0) ?? 0;
  if (code < 0x4e00 || code > 0x9fff) return null;

  if (pinyinCache.has(char)) return pinyinCache.get(char)!;

  let lo = 0;
  let hi = sortedBoundaries.length - 1;
  let result: string | null = null;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = collator.compare(char, sortedBoundaries[mid][0]);
    if (cmp >= 0) {
      result = sortedBoundaries[mid][1];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (result !== null) pinyinCache.set(char, result);
  return result;
}

export function getGroupLetter(name: string): string {
  if (!name) return "#";

  const first = name.charAt(0);
  const upper = first.toUpperCase();

  if (/^[A-Z]$/.test(upper)) return upper;

  const pinyin = chinesePinyinInitial(first);
  if (pinyin) return pinyin;

  return "#";
}
