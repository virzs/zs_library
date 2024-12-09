import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";
import { pluginApiDocgen } from "@rspress/plugin-api-docgen";

export default defineConfig({
  // 文档根目录
  root: "docs",
  title: "zs_library",
  description: "个人业务相关的组件库",
  plugins: [
    pluginPreview(),
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
