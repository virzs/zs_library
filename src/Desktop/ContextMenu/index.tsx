'use client';

import { css, cx } from '@emotion/css';
import {
  RiCloseCircleLine,
  RiInformationLine,
  RiPencilRuler2Line,
  RiShareLine,
} from '@remixicon/react';
import { AnimatePresence, Variants, motion } from 'framer-motion';
import React, { FC, useEffect, useRef } from 'react';
import { configMap } from '../config';
import { useSortable } from '../hook';
import { SortItemBaseConfig } from '../types';

const itemVariants: Variants = {
  menuShow: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  menuHide: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

interface ContextButtonProps {
  icon: any;
  title: string;
  onClick?: () => void;
}

const ContextButton: FC<ContextButtonProps> = (props) => {
  const { icon, title, onClick } = props;

  return (
    <motion.div
      className={css`
        &:hover {
          background-color: #f3f4f6;
        }
        @media (prefers-color-scheme: dark) {
          color: black;
        }
        font-size: 0.75rem;
        line-height: 1rem;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
        border-radius: 0.5rem;
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      variants={itemVariants}
    >
      <motion.div
        className={cx(
          'py-1.5 px-3 rounded-lg',
          css`
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            border-radius: 0.5rem;
          `,
        )}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className={cx(
            css`
              margin-bottom: 0.375rem;
              display: flex;
              justify-content: center;
            `,
          )}
        >
          {icon}
        </motion.div>
        <motion.div>{title}</motion.div>
      </motion.div>
    </motion.div>
  );
};

const ContextMenu: FC = () => {
  const {
    contextMenu,
    setContextMenu,
    hideContextMenu,
    setShowInfoItemData,
    removeItem,
    updateItemConfig,
  } = useSortable();
  const ref = useRef<HTMLDivElement>(null);

  const { rect, data } = contextMenu ?? {};
  const { left = 0, bottom = 0, width = 0 } = rect ?? {};
  const { config = {} } = data ?? {};

  // 点击空白处关闭
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        hideContextMenu();
        return;
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [hideContextMenu]);

  const getAllSizes = () => {
    const config: SortItemBaseConfig = configMap[contextMenu?.data?.type];
    const dimensions = [];
    for (let row = 1; row <= (config?.maxRow ?? 2); row++) {
      for (let col = 1; col <= (config?.maxCol ?? 2); col++) {
        dimensions.push(`${row}x${col}`);
      }
    }
    return dimensions;
  };

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={ref}
          className={cx(
            css`
              position: fixed;
              transform: translateX(-50%);
              z-index: 1001;
              top: ${bottom}px;
              left: ${left + width / 2}px;
            `,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <motion.div
            className={cx(
              css`
                border-radius: 0.5rem;
                overflow: hidden;
              `,
            )}
          >
            {config.allowResize !== false && (
              <motion.ul
                className={css`
                  background-color: white;
                  padding: 0.25rem;
                  margin: 0;
                `}
              >
                {[
                  {
                    label: '修改大小',
                    key: 'size',
                    icon: <RiPencilRuler2Line size={14} />,
                    items: getAllSizes().map((size) => ({
                      label: size,
                      key: size,
                      onClick: () => {
                        const [row, col] = size.split('x').map(Number);
                        updateItemConfig(contextMenu.data.id, {
                          row,
                          col,
                        });
                      },
                    })),
                  },
                ].map((i) => (
                  <motion.li
                    className={css`
                      padding-top: 0.5rem;
                      padding-bottom: 0.5rem;
                      padding-left: 0.75rem;
                      padding-right: 0.75rem;
                    `}
                    key={i.key}
                  >
                    <motion.p
                      className={css`
                        display: flex;
                        align-items: center;
                        font-size: 0.875rem;
                        line-height: 1.25rem;
                        gap: 0.5rem;
                        padding-bottom: 0.5rem;
                      `}
                    >
                      {i.icon} {i.label}
                    </motion.p>
                    <motion.div
                      className={css`
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 0.25rem;
                      `}
                    >
                      {i.items.map((it) => (
                        <motion.div
                          className={cx(
                            'py-1 px-2 hover:bg-gray-100 rounded transition-all cursor-pointer text-center text-sm',
                            css`
                              padding-top: 0.25rem;
                              padding-bottom: 0.25rem;
                              padding-left: 0.5rem;
                              padding-right: 0.5rem;
                              border-radius: 0.25rem;
                              transition: all 0.3s;
                              font-size: 0.875rem;
                              line-height: 1.25rem;
                              cursor: pointer;
                              text-align: center;
                              &:hover {
                                background-color: #f3f4f6;
                              }
                            `,
                            `${config.row}x${config.col}` === it.key &&
                              css`
                                background-color: #f3f4f6;
                              `,
                          )}
                          key={it.key}
                          onClick={it.onClick}
                        >
                          {it.label}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
          <motion.div
            className={cx(
              css`
                display: flex;
                background-color: white;
                margin-top: 0.5rem;
                border-radius: 0.5rem;
                overflow: hidden;
                padding: 0.25rem;
              `,
            )}
          >
            <ContextButton icon={<RiShareLine size={20} />} title="分享" />
            <ContextButton
              icon={<RiInformationLine size={20} />}
              title="信息"
              onClick={() => {
                setShowInfoItemData(contextMenu.data);
                hideContextMenu();
              }}
            />
            <ContextButton
              icon={<RiCloseCircleLine size={20} />}
              title="移除"
              onClick={() => {
                setContextMenu(null);
                removeItem(contextMenu.data.id);
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
