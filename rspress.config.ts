import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";
import { pluginTypeDoc } from "@rspress/plugin-typedoc";
import { pluginApiDocgen } from "@rspress/plugin-api-docgen";
import path from "path";

export default defineConfig({
  // 文档根目录
  root: "docs",
  title: "zs_library",
  description: "个人业务相关的组件库",
  plugins: [
    pluginPreview(),
    pluginTypeDoc({
      entryPoints: [
        path.join(__dirname, "src", "components", "md-editor", "index.tsx"),
        path.join(__dirname, "src", "components", "md-editor", "editor.tsx"),
        path.join(__dirname, "src", "components", "md-editor", "preview.tsx"),
        path.join(__dirname, "src", "components", "desktop", "index.tsx"),
      ],
    }),
    pluginApiDocgen({
      entries: {
        editor: "./src/components/md-editor/editor.tsx",
        desktop: "./src/components/desktop/index.tsx",
      },
      apiParseTool: "react-docgen-typescript",
    }),
  ],
  ssg: false,
});
