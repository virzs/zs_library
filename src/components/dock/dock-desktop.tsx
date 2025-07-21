import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "./utils";
import { ElementType, FC, MouseEvent, ReactNode, useRef, useState } from "react";
import { DockItem } from ".";

export interface DesktopIconContainerProps
  extends DockItem,
    Partial<Omit<HTMLMotionProps<"div">, "title" | "children">> {
  mouseX: MotionValue;
  children?:
    | ReactNode
    | ((params: {
        widthIcon: MotionValue<number>;
        heightIcon: MotionValue<number>;
        fontSizeTransform: MotionValue<string>;
      }) => ReactNode);
  as?: ElementType;
  componentClassName?: string;
  titleClassName?: string;
  childrenClassName?: string;
}

export const DesktopIconContainer: FC<DesktopIconContainerProps> = (props) => {
  const {
    mouseX,
    title,
    icon,
    href,
    children,
    as: Component = motion.div,
    componentClassName = "zs-rounded-full zs-bg-gray-200 dark:zs-bg-neutral-800",
    titleClassName = "zs-rounded-md zs-bg-gray-100 zs-border dark:zs-bg-neutral-800 dark:zs-border-neutral-900 dark:zs-text-white zs-border-gray-200 zs-text-neutral-700",
    childrenClassName,
    ...rest
  } = props;

  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  // 创建一个用于字体大小的动态值
  const fontSizeTransform = useTransform(widthIcon, (value) => `${value}px`);

  const [hovered, setHovered] = useState(false);

  const ele = (
    <Component
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("zs-aspect-square zs-flex zs-items-center zs-justify-center zs-relative", componentClassName)}
      {...rest}
    >
      {title && (
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className={cn(
                "zs-px-2 zs-py-0.5 zs-whitespace-pre zs-absolute zs-left-1/2 zs--translate-x-1/2 zs--top-8 zs-w-fit zs-text-xs",
                titleClassName
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <motion.div
        style={{
          width: widthIcon,
          height: heightIcon,
          fontSize: fontSizeTransform,
        }}
        className={cn("zs-flex zs-items-center zs-justify-center", childrenClassName)}
      >
        {typeof children === "function" ? children({ widthIcon, heightIcon, fontSizeTransform }) : children || icon}
      </motion.div>
    </Component>
  );

  if (!href) return ele;

  return <a href={href}>{ele}</a>;
};

export interface DockDesktopProps {
  className?: string;
  items?: DockItem[];
  itemBuilder?: (item: DockItem, mouseX: MotionValue) => ReactNode;
  children?: ReactNode;
  mouseX?: MotionValue;
  as?: ElementType;
}

const DockDesktop: FC<DockDesktopProps> = (props) => {
  const {
    items = [],
    className = "zs-rounded-2xl zs-bg-gray-50 dark:zs-bg-neutral-900",
    itemBuilder,
    children,
    mouseX: propMouseX,
    as: Component = motion.div,
  } = props;

  const privMoveX = useMotionValue(Infinity);

  const mouseX = propMouseX ?? privMoveX;
  return (
    <Component
      onMouseMove={(e: MouseEvent<HTMLElement>) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("zs-mx-auto zs-hidden md:zs-flex zs-h-16 zs-gap-4 zs-items-end zs-px-4 zs-pb-3", className)}
    >
      {children ||
        items.map((item) =>
          itemBuilder ? itemBuilder(item, mouseX) : <DesktopIconContainer mouseX={mouseX} key={item.title} {...item} />
        )}
    </Component>
  );
};

export default DockDesktop;
