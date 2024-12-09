import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";
import { pluginTypeDoc } from "@rspress/plugin-typedoc";
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
        path.join(__dirname, "src", "components", "desktop", "index.tsx"),
      ],
    }),
  ],
  ssg: false,
});
