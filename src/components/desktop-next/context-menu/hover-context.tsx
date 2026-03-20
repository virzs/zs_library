import { createContext } from "react";

export interface HoverContextType {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

export const HoverContext = createContext<HoverContextType>({
  hoveredIndex: null,
  setHoveredIndex: () => {},
});
