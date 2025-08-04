import { createContext } from "react";

// 创建hover状态context
export interface HoverContextType {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

export const HoverContext = createContext<HoverContextType>({
  hoveredIndex: null,
  setHoveredIndex: () => {},
});
