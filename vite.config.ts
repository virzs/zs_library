import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import autoExternal from "rollup-plugin-auto-external";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
    }),
    visualizer({ open: false }),
    autoExternal(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "zs_library",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // external 交由 rollup-plugin-auto-external 处理
      // external: [/node_modules/],
      output: [
        {
          format: "es",
          name: "zs_library",
          intro: 'import "./style.css";',
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "@mdxeditor/editor": "MDXEditor",
            lexical: "Lexical",
          },
        },
        {
          format: "umd",
          name: "zs_library",
          intro: 'require("./style.css");',
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "@mdxeditor/editor": "MDXEditor",
            lexical: "Lexical",
          },
        },
      ],
    },
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console 语句
      },
    },
  },
});
