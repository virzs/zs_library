/* eslint-disable @typescript-eslint/no-explicit-any */

class SortableUtils {
  /** 清理重复id */
  public static uniqueArray = <T extends { id: string | number }>(array: T[]): T[] =>
    array.reduce((acc: T[], current) => {
      const x = acc.find((item: any) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

  public static quickJSONCheck = (str: any) => {
    // 前置过滤：必须是字符串且非空
    if (typeof str !== "string" || str.trim() === "") return false;

    // 阶段1：检查最外层结构是否为对象或数组
    const outerStructure = /^\s*(\{.*\}|\[.*\])\s*$/.test(str);
    if (!outerStructure) {
      // 阶段2：允许基础类型（字符串/数字/布尔/null）
      const basicType = /^\s*(".*?"|[\d.]+|true|false|null)\s*$/.test(str);
      return basicType;
    }

    // 阶段3：快速检查引号、括号匹配等基础错误
    try {
      // 用反引号包裹字符串避免转义问题，模拟解析
      new Function(`return ${str.replace(/"/g, '\\"')}`)();
      return true;
    } catch {
      return false;
    }
  };
}

export default SortableUtils;
