import { css, cx } from "@emotion/css";
import { FC, useState } from "react";

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const EditableTitle: FC<EditableTitleProps> = ({ value, onChange, onBlur, placeholder = "标题" }) => {
  const [localValue, setLocalValue] = useState(value);

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
          color: #1d1d1f;
          font-weight: 600;
          letter-spacing: -0.5px;
          transition: all 0.2s ease-out;

          &:focus {
            outline: none;
            background: rgba(0, 0, 0, 0.06);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
            transform: scale(1.02);
          }

          &:hover {
            background: rgba(0, 0, 0, 0.03);
          }

          &::placeholder {
            color: rgba(29, 29, 31, 0.6);
          }

          &::selection {
            background: rgba(0, 122, 255, 0.3);
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
