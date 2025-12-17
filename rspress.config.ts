import { pluginPreview } from "@rspress/plugin-preview";
import { pluginPlayground } from "@rspress/plugin-playground";
import { defineConfig } from "rspress/config";

export default defineConfig({
  // 文档根目录
  root: "docs",
  title: "zs_library",
  description: "个人业务相关的组件库",
  plugins: [
    pluginPreview(),
    pluginPlayground({
      defaultDirection: "vertical",
    }),
  ],
  ssg: false,
  mediumZoom: {
    selector: ".rspress-doc img:not(.rspress-preview-card img)",
  },
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/virzs/zs_library",
      },
    ],
  },
  route: {
    extensions: [".md", ".mdx"],
  },
});
