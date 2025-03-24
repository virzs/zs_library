export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

export const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "默认", // Default
    color: "var(--novel-black)",
  },
  {
    name: "紫色", // Purple
    color: "#9333EA",
  },
  {
    name: "红色", // Red
    color: "#E00000",
  },
  {
    name: "黄色", // Yellow
    color: "#EAB308",
  },
  {
    name: "蓝色", // Blue
    color: "#2563EB",
  },
  {
    name: "绿色", // Green
    color: "#008A00",
  },
  {
    name: "橙色", // Orange
    color: "#FFA500",
  },
  {
    name: "粉色", // Pink
    color: "#BA4081",
  },
  {
    name: "灰色", // Gray
    color: "#A8A29E",
  },
];

export const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "默认背景", // Default
    color: "var(--novel-highlight-default)",
  },
  {
    name: "紫色背景", // Purple
    color: "var(--novel-highlight-purple)",
  },
  {
    name: "红色背景", // Red
    color: "var(--novel-highlight-red)",
  },
  {
    name: "黄色背景", // Yellow
    color: "var(--novel-highlight-yellow)",
  },
  {
    name: "蓝色背景", // Blue
    color: "var(--novel-highlight-blue)",
  },
  {
    name: "绿色背景", // Green
    color: "var(--novel-highlight-green)",
  },
  {
    name: "橙色背景", // Orange
    color: "var(--novel-highlight-orange)",
  },
  {
    name: "粉色背景", // Pink
    color: "var(--novel-highlight-pink)",
  },
  {
    name: "灰色背景", // Gray
    color: "var(--novel-highlight-gray)",
  },
];