import { SigmaIcon } from "lucide-react";
import { useEditor } from "novel";
import { Button } from "../ui/button";
import { cx } from "@emotion/css";
import Tooltip from "../ui/tooltip";

export const MathSelector = () => {
  const { editor } = useEditor();

  if (!editor) return null;

  return (
    <Tooltip overlay="标记为公式" placement="top">
      <Button
        variant="ghost"
        size="sm"
        className="rounded-md w-12"
        onClick={() => {
          if (editor.isActive("math")) {
            editor.chain().focus().unsetLatex().run();
          } else {
            const { from, to } = editor.state.selection;
            const latex = editor.state.doc.textBetween(from, to);

            if (!latex) return;

            editor.chain().focus().setLatex({ latex }).run();
          }
        }}
      >
        <SigmaIcon
          className={cx("size-4", { "text-blue-500": editor.isActive("math") })}
          strokeWidth={2.3}
        />
      </Button>
    </Tooltip>
  );
};
