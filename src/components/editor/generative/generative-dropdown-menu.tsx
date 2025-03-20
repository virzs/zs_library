import {
  RiDeleteBinLine,
  RiFileCopyLine,
  RiRepeatLine,
} from "@remixicon/react";
import { FC } from "react";
import { DropdownMenu, MenuItem } from "../ui/dropdown-menu";
import { DropdownProps } from "rc-dropdown";

const GenerativeDropdownMenu: FC<DropdownProps> = ({ children, ...rest }) => {
  const subMenuItems: MenuItem[] = [
    { key: "copy", icon: <RiFileCopyLine size={16} />, label: "复制" },
    { key: "paste", icon: <RiFileCopyLine size={16} />, label: "粘贴" },
  ];

  const menuItems: MenuItem[] = [
    {
      key: "transform",
      type: "submenu",
      icon: <RiRepeatLine size={16} />,
      label: "转换成",
      children: subMenuItems,
    },
    {
      key: "duplicate",
      icon: <RiFileCopyLine size={16} />,
      label: "创建副本",
    },
    { key: "divider", type: "divider" },
    {
      key: "delete",
      icon: <RiDeleteBinLine size={16} />,
      label: "删除",
      className: "text-red-500",
    },
  ];

  return (
    <DropdownMenu items={menuItems} {...rest}>
      {children}
    </DropdownMenu>
  );
};

export default GenerativeDropdownMenu;
