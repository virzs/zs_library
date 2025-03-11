"use client";

import { css } from "@emotion/css";
import RcTooltip from "rc-tooltip";
import { TooltipProps } from "rc-tooltip/lib/Tooltip";

const Tooltip = (props: TooltipProps) => {
  return (
    <RcTooltip
      classNames={{
        root: css`
          background-color: transparent;
          padding: 0;
          .rc-tooltip-content {
            border: none;
          }
        `,
        body: "!p-2 !rounded-md !bg-background !border !border-muted !text-secondary-foreground",
      }}
      showArrow={false}
      {...props}
    />
  );
};

export default Tooltip;
