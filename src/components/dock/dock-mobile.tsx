import { FC, ReactNode, useState } from "react";
import { cn } from "./utils";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import { RiMoreLine } from "@remixicon/react";
import { DockItem } from ".";

export interface MobileIconContainerProps
  extends DockItem,
    Partial<Omit<HTMLMotionProps<"div">, "title" | "children">> {
  index: number;
  totalItems: number;
  children?: ReactNode;
}

export const MobileIconContainer: FC<MobileIconContainerProps> = (props) => {
  const { title, icon, href, index, totalItems, children, ...rest } = props;

  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 10,
        transition: {
          delay: index * 0.05,
        },
      }}
      transition={{ delay: (totalItems - 1 - index) * 0.05 }}
      {...rest}
    >
      {children || (
        <a
          href={href}
          className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center"
        >
          <div className="h-4 w-4">{icon}</div>
        </a>
      )}
    </motion.div>
  );
};

export interface DockMobileProps {
  className?: string;
  items?: DockItem[];
  collapseIcon?: ReactNode;
  autoHidden?: boolean;
  itemBuilder?: (item: DockItem, index: number, items: DockItem[]) => ReactNode;
  children?: ReactNode;
}

const DockMobile: FC<DockMobileProps> = (props) => {
  const {
    items = [],
    className,
    collapseIcon,
    autoHidden = false,
    itemBuilder,
    children,
  } = props;

  const [open, setOpen] = useState(false);

  const handleCollapseBtnClick = () => {
    setOpen(!open);
  };

  return (
    <div
      className={cn("relative block", autoHidden ? "md:hidden" : "", className)}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
          >
            {children ||
              items.map((item, idx) =>
                itemBuilder ? (
                  <MobileIconContainer
                    key={item.title}
                    {...item}
                    index={idx}
                    totalItems={items.length}
                  >
                    {itemBuilder(item, idx, items)}
                  </MobileIconContainer>
                ) : (
                  <MobileIconContainer
                    key={item.title}
                    {...item}
                    index={idx}
                    totalItems={items.length}
                  />
                )
              )}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={handleCollapseBtnClick}
        className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center"
      >
        {collapseIcon ? (
          collapseIcon
        ) : (
          <RiMoreLine className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        )}
      </button>
    </div>
  );
};

export default DockMobile;
