import {
  RiDeleteBinLine,
  RiFileCopyLine,
  RiRepeatLine,
} from "@remixicon/react";
import { FC } from "react";
import { DropdownMenu, MenuItem } from "../ui/dropdown-menu";
import { DropdownProps } from "rc-dropdown";
import { useEditor } from "novel";
import { NodeSelection } from "@tiptap/pm/state";
import { NODE_SELECTOR_ITEMS } from "../lib/nodes";

const GenerativeDropdownMenu: FC<DropdownProps> = ({ children, ...rest }) => {
  const { editor } = useEditor();

  // 删除当前块
  const handleDelete = () => {
    if (!editor) return;

    // 如果当前有节点选择，则删除该节点
    if (editor.state.selection instanceof NodeSelection) {
      editor.commands.deleteSelection();
      editor.commands.focus();
    }
  };

  // 复制当前块到下一行
  const handleDuplicate = () => {
    if (!editor) return;

    // 检查当前是否有节点选择
    if (editor.state.selection instanceof NodeSelection) {
      const node = editor.state.selection.node;
      const pos = editor.state.selection.to;

      // 创建相同类型的节点，复制属性和内容
      editor
        .chain()
        .insertContentAt(pos, {
          type: node.type.name,
          attrs: { ...node.attrs },
          content: node.content.toJSON(),
        })
        .focus()
        .run();
    }
  };

  // 转换节点类型菜单项
  const transformMenuItems: MenuItem[] = NODE_SELECTOR_ITEMS.map((item) => ({
    key: `transform-${item.name}`,
    icon: <item.icon size={16} />,
    label: item.name,
    onClick: () => {
      if (!editor) return;
      if (editor.state.selection instanceof NodeSelection) {
        item.command(editor);
      }
    },
    isActive: item.isActive(editor),
  }));

  const menuItems: MenuItem[] = [
    {
      key: "transform",
      type: "submenu",
      icon: <RiRepeatLine size={16} />,
      label: "转换成",
      children: transformMenuItems,
    },
    {
      key: "duplicate",
      icon: <RiFileCopyLine size={16} />,
      label: "创建副本",
      onClick: handleDuplicate,
    },
    { key: "divider", type: "divider" },
    {
      key: "delete",
      icon: <RiDeleteBinLine size={16} />,
      label: "删除",
      className: "text-red-500",
      onClick: handleDelete,
    },
  ];

  return (
    <DropdownMenu items={menuItems} {...rest}>
      {children}
    </DropdownMenu>
  );
};

export default GenerativeDropdownMenu;
