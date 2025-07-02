import { FC } from "react";
import ReactJson from "react-json-view";
import { SortItem } from "../../types";
import BaseModal from "./base-modal";

export interface ItemInfoModalProps {
  data: SortItem | null;
  onClose: () => void;
}

/**
 * 查看当前项的详细信息，开发模式下会额外显示原始数据
 */
const ItemInfoModal: FC<ItemInfoModalProps> = (props) => {
  const { data, onClose } = props;

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
        <div className="zs-p-2 zs-rounded-md zs-bg-[#272822]">
          <ReactJson src={data as object} theme="monokai" />
        </div>
      )}
    </BaseModal>
  );
};

export default ItemInfoModal;
