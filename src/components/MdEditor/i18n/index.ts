import zh_CN, { Translation } from "./zh_CN";

/**
 * @name 翻译
 */
export const $t = (
  key: string,
  defalutValue: string,
  interpolations: Record<string, string> | undefined
) => {
  const keyArray = key.split(".");

  //   从 zh_CN 中查找对应的翻译
  const msg = keyArray.reduce(
    (acc: string | Translation, cur) => {
      if (typeof acc === "string") {
        return acc;
      }
      return acc[cur] as Translation;
    },
    zh_CN
  );

  // 如果没有找到对应的翻译，返回默认值
  if (typeof msg !== "string") {
    return defalutValue;
  }

  return interpolations
    ? msg.replace(/{{(.*?)}}/g, (_, g) => interpolations[g])
    : msg;
};
