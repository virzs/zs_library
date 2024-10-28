import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { FC } from 'react';
import ReactJson from 'react-json-view';
import { SortItem } from '../../types';

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
    <Dialog
      visible={!!data}
      onClose={() => {
        onClose();
      }}
      animation="zoom"
      maskAnimation="fade"
      mousePosition={
        data?.pageX && data?.pageY
          ? {
              x: data?.pageX,
              y: data?.pageY,
            }
          : null
      }
      footer={null}
      title={data?.data?.name ?? '信息'}
    >
      {data && (
        <div>
          <div className="mb-2">开发者信息</div>
          <div className="p-2 rounded-md bg-[#272822]">
            <ReactJson src={data as object} theme="monokai" />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default ItemInfoModal;
