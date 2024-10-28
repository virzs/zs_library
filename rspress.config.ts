import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";

export default defineConfig({
  // 文档根目录
  root: "docs",
  title: "zs_library",
  description: "个人业务相关的组件库",
  plugins: [pluginPreview()],
  ssg: false,
});
