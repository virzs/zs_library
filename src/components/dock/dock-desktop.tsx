import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "./utils";
import {
  ElementType,
  FC,
  MouseEvent,
  ReactNode,
  useRef,
  useState,
} from "react";
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
    componentClassName = "rounded-full bg-gray-200 dark:bg-neutral-800",
    titleClassName = "rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700",
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

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );

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
      className={cn(
        "aspect-square flex items-center justify-center relative",
        componentClassName
      )}
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
                "px-2 py-0.5 whitespace-pre absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs",
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
        className={cn("flex items-center justify-center", childrenClassName)}
      >
        {typeof children === "function"
          ? children({ widthIcon, heightIcon, fontSizeTransform })
          : children || icon}
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
    className = "rounded-2xl bg-gray-50 dark:bg-neutral-900",
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
      className={cn(
        "mx-auto hidden md:flex h-16 gap-4 items-end px-4 pb-3",
        className
      )}
    >
      {children ||
        items.map((item) =>
          itemBuilder ? (
            itemBuilder(item, mouseX)
          ) : (
            <DesktopIconContainer mouseX={mouseX} key={item.title} {...item} />
          )
        )}
    </Component>
  );
};

export default DockDesktop;
