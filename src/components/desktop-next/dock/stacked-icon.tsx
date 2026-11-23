import { useSurfaceTheme } from "../contexts/config-context";
import React, { useState } from "react";
import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { baseTokens } from "../themes/base";
import { desktopSurface } from "../themes/material";
import { Theme } from "../themes";
import { DndSortItem } from "../types";

export interface StackedIconProps {
  onClick?: () => void;
  className?: string;
  theme?: Theme;
  apps?: DndSortItem[];
}

const MiniAppIcon: React.FC<{ app?: DndSortItem; background: string; color: string }> = ({ app, background, color }) => {
  const iconData = app?.data?.icon;
  const name = app?.data?.name ?? "";

  if (
    iconData &&
    typeof iconData === "string" &&
    (iconData.startsWith("http") || iconData.startsWith("https"))
  ) {
    return (
      <img
        src={iconData}
        alt={name}
        crossOrigin="anonymous"
        className="zs-w-full zs-h-full zs-object-cover"
      />
    );
  }

  if (iconData) {
    return <>{iconData}</>;
  }

  return (
    <div className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-font-bold zs-text-xs"
      style={{ background: app?.data?.iconColor ?? background, color }}>
      {name.charAt(0).toUpperCase() || "A"}
    </div>
  );
};

const LAYER_OFFSET = 4;
const LAYER_COUNT = 3;

const StackedIcon: React.FC<StackedIconProps> = ({
  onClick,
  className,
  theme: explicitTheme,
  apps = [],
}) => {
  const theme = useSurfaceTheme(explicitTheme);
  const [isHovered, setIsHovered] = useState(false);

  const base = baseTokens(theme);
  const iconTheme = theme?.token?.dock?.launchpad?.icon;
  const backgroundColor = iconTheme?.backgroundColor ?? base.backgroundColor;
  const borderColor = iconTheme?.borderColor ?? base.borderColor;
  const shadowColor = iconTheme?.shadowColor ?? base.shadowColor;
  const hoverGlowColor = iconTheme?.hoverGlowColor ?? base.highlightColor;

  const slots = Array.from({ length: 4 }, (_, i) => apps[i]);

  const containerSize = 56;
  const totalSpread = LAYER_OFFSET * (LAYER_COUNT - 1);
  const outerSize = containerSize + totalSpread;

  return (
    <motion.div
      className={cx("zs-cursor-pointer zs-flex-shrink-0 zs-relative", className)}
      style={{ width: outerSize, height: containerSize }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {Array.from({ length: LAYER_COUNT }, (_, layerIndex) => {
        const isTop = layerIndex === LAYER_COUNT - 1;
        const scale = 1 - (LAYER_COUNT - 1 - layerIndex) * 0.14;
        const opacity = isTop ? 1 : 0.45 + layerIndex * 0.2;

        const offsetStep = isHovered ? LAYER_OFFSET * 1.5 : LAYER_OFFSET;
        const x = layerIndex * offsetStep;
        const scaledSize = containerSize * scale;
        const y = (containerSize - scaledSize) / 2;

        return (
          <motion.div
            key={layerIndex}
            className={cx(
              "zs-absolute zs-overflow-hidden",
              css`
                width: ${containerSize}px;
                height: ${containerSize}px;
                border-radius: ${theme?.token?.items?.iconBorderRadius ?? `${Math.round(containerSize * 0.235)}px`};
                border: .5px solid transparent;
                ${isTop ? desktopSurface(theme, { backgroundColor, borderColor, shadowColor }) : `
                  background: ${backgroundColor};
                  box-shadow: inset 0 0 0 1px ${borderColor};
                `}
                ${isTop && isHovered ? `filter: drop-shadow(0 0 6px ${hoverGlowColor});` : ""}
                padding: 8px;
                box-sizing: border-box;
                z-index: ${layerIndex};
                top: 0;
                left: 0;
                transform-origin: top left;
              `,
            )}
            animate={{
              x,
              y,
              scale,
              opacity,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {isTop && (
              <div
                className="zs-grid zs-grid-cols-2 zs-grid-rows-2 zs-gap-[5px] zs-w-full zs-h-full"
              >
                {slots.map((app, i) => (
                  <div
                    key={app?.id ?? i}
                    className="zs-rounded-[4px] zs-overflow-hidden zs-w-full zs-h-full"
                  >
                    <MiniAppIcon app={app} background={base.backgroundColor} color={iconTheme?.textColor ?? base.textColor} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StackedIcon;
