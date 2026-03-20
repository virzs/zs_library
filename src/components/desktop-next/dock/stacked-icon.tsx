import React, { useState } from "react";
import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { Theme } from "../themes";
import { DndSortItem } from "../types";

export interface StackedIconProps {
  onClick?: () => void;
  className?: string;
  theme?: Theme;
  apps?: DndSortItem[];
}

const MiniAppIcon: React.FC<{ app?: DndSortItem }> = ({ app }) => {
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
    <div className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-bg-blue-500 zs-text-white zs-font-bold zs-text-xs">
      {name.charAt(0).toUpperCase() || "A"}
    </div>
  );
};

const LAYER_OFFSET = 4;
const LAYER_COUNT = 3;

const StackedIcon: React.FC<StackedIconProps> = ({
  onClick,
  className,
  theme,
  apps = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconTheme = theme?.token?.dock?.launchpad?.icon;
  const backgroundColor = iconTheme?.backgroundColor ?? "rgba(40, 40, 40, 0.9)";
  const borderColor = iconTheme?.borderColor ?? "rgba(255, 255, 255, 0.12)";
  const shadowColor = iconTheme?.shadowColor ?? "rgba(0, 0, 0, 0.4)";

  const slots = Array.from({ length: 4 }, (_, i) => apps[i]);

  const containerSize = 56;
  const totalSpread = LAYER_OFFSET * (LAYER_COUNT - 1);
  const outerSize = containerSize + totalSpread;

  return (
    <motion.div
      className={cx("zs-cursor-pointer zs-flex-shrink-0 zs-relative", className)}
      style={{ width: outerSize, height: containerSize }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
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
                border-radius: 14px;
                background: ${backgroundColor};
                border: 0.5px solid ${borderColor};
                box-shadow: 0 4px 12px ${shadowColor};
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
                className={css`
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  grid-template-rows: 1fr 1fr;
                   gap: 5px;
                  width: 100%;
                  height: 100%;
                `}
              >
                {slots.map((app, i) => (
                  <div
                    key={app?.id ?? i}
                    className={css`
                      border-radius: 4px;
                      overflow: hidden;
                      width: 100%;
                      height: 100%;
                    `}
                  >
                    <MiniAppIcon app={app} />
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
