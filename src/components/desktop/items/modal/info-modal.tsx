import { FC } from "react";
import ReactJson from "react-json-view";
import { css, cx } from "@emotion/css";
import { useSortableConfig } from "../../context/config/hooks";
import { SortItem } from "../../types";
import { BaseModal } from "../../modal";

export interface ItemInfoModalProps {
  data: SortItem | null;
  onClose: () => void;
}

/**
 * 查看当前项的详细信息，开发模式下会额外显示原始数据
 */
const ItemInfoModal: FC<ItemInfoModalProps> = (props) => {
  const { data, onClose } = props;
  const { theme } = useSortableConfig();

  return (
    <BaseModal
      visible={!!data}
      onClose={onClose}
      title={`${data?.data?.name}开发者信息`}
      mousePosition={
        data?.pageX && data?.pageY
          ? {
              x: data?.pageX,
              y: data?.pageY,
            }
          : null
      }
    >
      {data && (
        <div
          className={cx(
            "zs-p-2 zs-rounded-md",
            css`
              background-color: ${theme.token.items?.infoModalBackgroundColor};
            `
          )}
        >
          <ReactJson src={data as object} theme="monokai" />
        </div>
      )}
    </BaseModal>
  );
};

export default ItemInfoModal;
