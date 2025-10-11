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

  /**
   * 计算容器在给定 item 尺寸下的一行可容纳列数及行宽
   */
  public static computeRowWidth = (
    el: HTMLElement,
    itemSize = 112
  ): { cols: number; width: number; marginLeft: number } => {
    const style = window.getComputedStyle(el);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const columnGap = parseFloat(style.columnGap) || 0;

    const innerWidth = el.clientWidth - paddingLeft - paddingRight;
    // 基础可容纳列数（至少为1）
    let cols = Math.max(1, Math.floor((innerWidth + columnGap) / (itemSize + columnGap)));
    const usedWidth = cols * itemSize + (cols - 1) * columnGap;
    const leftover = innerWidth - usedWidth; // 剩余空间（不含尾部gap）

    // 如果剩余空间达到一个item宽度的90%，则近似算作还能放下一个item
    if (leftover >= itemSize * 0.9) {
      cols += 1;
    }

    const width = cols * itemSize + (cols - 1) * columnGap;
    // 如果设置的宽度比实际可用宽度更大，则计算左侧负 margin 进行居中补偿
    const marginLeft = width > innerWidth ? Math.round((innerWidth - width) / 2) : 0;
    return { cols, width, marginLeft };
  };
}

export default SortableUtils;
