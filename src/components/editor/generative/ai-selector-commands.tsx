import {
  ArrowDownWideNarrow,
  CheckCheck,
  RefreshCcwDot,
  StepForward,
  WrapText,
} from "lucide-react";
import { getPrevText, useEditor } from "novel";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";

const options = [
  {
    value: "improve",
    label: "改进写作", // Improve writing
    icon: RefreshCcwDot,
  },
  {
    value: "fix",
    label: "修正语法", // Fix grammar
    icon: CheckCheck,
  },
  {
    value: "shorter",
    label: "缩短文本", // Make shorter
    icon: ArrowDownWideNarrow,
  },
  {
    value: "longer",
    label: "扩展文本", // Make longer
    icon: WrapText,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();

  return (
    <>
      <CommandGroup heading="编辑或校对选中文本">  {/* Edit or review selection */}
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              const slice = editor!.state.selection.content();
              const text = editor!.storage.markdown.serializer.serialize(
                slice.content
              );
              onSelect(text, value);
            }}
            className="flex gap-2 px-4"
            key={option.value}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="使用 AI 完成更多">  {/* Use AI to do more */}
        <CommandItem
          onSelect={() => {
            const pos = editor!.state.selection.from;
            const text = getPrevText(editor!, pos);
            onSelect(text, "continue");
          }}
          value="continue"
          className="gap-2 px-4"
        >
          <StepForward className="h-4 w-4 text-purple-500" />
          继续写作
          {/* Continue writing */}
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
