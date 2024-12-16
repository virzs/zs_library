import { FC, ReactNode, useState } from "react";
import { cn } from "./utils";
import { AnimatePresence, motion } from "framer-motion";
import { RiMoreLine } from "@remixicon/react";
import { DockItem } from ".";

export interface DockMobileProps {
  className?: string;
  items: DockItem[];
  collapseIcon?: ReactNode;
  autoHidden?: boolean;
}

const DockMobile: FC<DockMobileProps> = (props) => {
  const { items, className, collapseIcon, autoHidden = false } = props;

  const [open, setOpen] = useState(false);

  const handleCollapseBtnClick = () => {
    setOpen(!open);
  };

  return (
    <div
      className={cn(
        "relative block",
        autoHidden ? "md:hidden" : "",
        className
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
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
