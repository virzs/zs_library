import { FC, ReactNode, useState } from "react";
import { cn } from "./utils";
import { AnimatePresence, HTMLMotionProps, motion } from "motion/react";
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
          className="zs-h-10 zs-w-10 zs-rounded-full zs-bg-gray-50 dark:zs-bg-neutral-900 zs-flex zs-items-center zs-justify-center"
        >
          <div className="zs-h-4 zs-w-4">{icon}</div>
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
  const { items = [], className, collapseIcon, autoHidden = false, itemBuilder, children } = props;

  const [open, setOpen] = useState(false);

  const handleCollapseBtnClick = () => {
    setOpen(!open);
  };

  return (
    <div className={cn("zs-relative zs-block", autoHidden ? "md:zs-hidden" : "", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="zs-absolute zs-bottom-full zs-mb-2 zs-inset-x-0 zs-flex zs-flex-col zs-gap-2"
          >
            {children ||
              items.map((item, idx) =>
                itemBuilder ? (
                  <MobileIconContainer key={item.title} {...item} index={idx} totalItems={items.length}>
                    {itemBuilder(item, idx, items)}
                  </MobileIconContainer>
                ) : (
                  <MobileIconContainer key={item.title} {...item} index={idx} totalItems={items.length} />
                )
              )}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={handleCollapseBtnClick}
        className="zs-h-10 zs-w-10 zs-rounded-full zs-bg-gray-50 dark:zs-bg-neutral-800 zs-flex zs-items-center zs-justify-center"
      >
        {collapseIcon ? (
          collapseIcon
        ) : (
          <RiMoreLine className="zs-h-5 zs-w-5 zs-text-neutral-500 dark:zs-text-neutral-400" />
        )}
      </button>
    </div>
  );
};

export default DockMobile;
