import React from "react";
import { cx } from "@emotion/css";
import StackedIcon from "./stacked-icon";
import { Theme } from "../themes";
import { DndSortItem } from "../types";

export interface LaunchpadButtonProps {
  onClick?: () => void;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  theme?: Theme;
  apps?: DndSortItem[];
}

const LaunchpadButton: React.FC<LaunchpadButtonProps> = ({
  onClick,
  className,
  theme,
  apps,
}) => {
  return (
    <StackedIcon
      onClick={onClick}
      className={cx("zs-flex-shrink-0", className)}
      theme={theme}
      apps={apps}
    />
  );
};

export default LaunchpadButton;
