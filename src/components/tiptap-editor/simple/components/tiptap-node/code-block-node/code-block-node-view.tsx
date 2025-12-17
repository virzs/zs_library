import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { useCallback, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../tiptap-ui-primitive/card";
import { Button } from "../../tiptap-ui-primitive/button";
import "./code-block-node.scss";
import { RiArrowDownSLine } from "@remixicon/react";

// Common languages list (reused from dropdown menu, should probably be a constant shared somewhere)
const LANGUAGES = [
  { label: "Plain Text", value: null },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "JSON", value: "json" },
  { label: "Markdown", value: "markdown" },
  { label: "Shell", value: "bash" },
  { label: "SQL", value: "sql" },
  { label: "XML", value: "xml" },
  { label: "YAML", value: "yaml" },
];

export const CodeBlockNodeView = ({ node, updateAttributes }: NodeViewProps) => {
  const currentLanguage = node.attrs.language;

  const currentLanguageLabel = useMemo(() => {
    if (!currentLanguage) return "Plain Text";
    const found = LANGUAGES.find((l) => l.value === currentLanguage);
    return found ? found.label : currentLanguage;
  }, [currentLanguage]);

  const setLanguage = useCallback(
    (lang: string | null) => {
      console.log("🚀 ~ CodeBlockNodeView ~ lang:", lang);
      updateAttributes({ language: lang });
    },
    [updateAttributes]
  );

  return (
    <NodeViewWrapper className="code-block-node-view relative group">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className="code-block-language-trigger" type="button">
            <span className="mr-1">{currentLanguageLabel}</span>
            <RiArrowDownSLine className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" portal>
          <Card>
            <CardBody className="p-1">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem key={lang.label} asChild>
                  <Button
                    type="button"
                    data-style="ghost"
                    data-size="small"
                    onClick={() => setLanguage(lang.value)}
                    style={{ width: "100%", justifyContent: "flex-start", fontWeight: "normal" }}
                  >
                    {lang.label}
                  </Button>
                </DropdownMenuItem>
              ))}
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
      <pre>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
};
