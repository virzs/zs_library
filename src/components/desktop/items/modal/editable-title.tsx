import { css, cx } from "@emotion/css";
import { FC, useState } from "react";
import { useSortableConfig } from "../../context/config/hooks";

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const EditableTitle: FC<EditableTitleProps> = ({ value, onChange, onBlur, placeholder = "标题" }) => {
  const [localValue, setLocalValue] = useState(value);
  const { theme } = useSortableConfig();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  return (
    <input
      className={cx(
        "zs-bg-transparent zs-text-center zs-text-xl zs-w-full zs-rounded-lg py-2 px-4",
        css`
          border-style: none;
          color: ${theme.token.items?.groupModal?.title?.textColor};
          font-weight: 600;
          letter-spacing: -0.5px;
          transition: all 0.2s ease-out;
          background: ${theme.token.items?.groupModal?.title?.backgroundColor};

          &:focus {
            outline: none;
            background: ${theme.token.items?.groupModal?.title?.focusBackgroundColor};
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 0 0 2px ${theme.token.items?.groupModal?.title?.shadowColor};
            transform: scale(1.02);
          }

          &:hover {
            background: ${theme.token.items?.groupModal?.title?.hoverBackgroundColor};
          }

          &::placeholder {
            color: ${theme.token.items?.groupModal?.title?.placeholderColor};
          }

          &::selection {
            background: ${theme.token.items?.groupModal?.title?.selectionBackgroundColor};
          }
        `
      )}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};

export default EditableTitle;
