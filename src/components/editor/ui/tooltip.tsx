"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal,
  Content: TooltipContent,
  Arrow: TooltipArrow,
} = TooltipPrimitive;

const Tooltip = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ trigger, content, ...props }, ref) => (
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <Portal>
        <TooltipContent
          sideOffset={5}
          ref={ref}
          className="p-2 rounded-md bg-background border border-muted"
          {...props}
        >
          {content}
        </TooltipContent>
      </Portal>
    </TooltipRoot>
  </TooltipProvider>
));

export {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow,
};
