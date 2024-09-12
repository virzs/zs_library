import {
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertFrontmatter,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  quotePlugin,
  StrikeThroughSupSubToggles,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";

export async function expressImageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append("image", image);
  const response = await fetch("/uploads/new", {
    method: "POST",
    body: formData,
  });
  const json = (await response.json()) as { url: string };
  return json.url;
}

export const ALL_PLUGINS = [
  toolbarPlugin({
    toolbarContents: () => (
      <>
        <UndoRedo />
        <BoldItalicUnderlineToggles />
        <CodeToggle />
        <CreateLink />
        <InsertImage />
        <InsertTable />
        <ListsToggle />
        <StrikeThroughSupSubToggles />
        <InsertCodeBlock />
        <InsertFrontmatter />
        <InsertThematicBreak />
      </>
    ),
  }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin({
    imageAutocompleteSuggestions: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
    imageUploadHandler: async () =>
      Promise.resolve("https://picsum.photos/200/300"),
  }),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: "JavaScript",
      css: "CSS",
      txt: "Plain Text",
      tsx: "TypeScript",
      "": "Unspecified",
    },
  }),
  diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
  markdownShortcutPlugin(),
];
