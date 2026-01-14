import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption } from "vite";
import dts from "vite-plugin-dts";
import autoExternal from "rollup-plugin-auto-external";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
    }),
    visualizer({ open: false }) as unknown as PluginOption,
    autoExternal() as unknown as PluginOption,
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
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-is",
        /^@radix-ui\/.*/,
        /^@emotion\/.*/,
        "motion/react",
        /^@tiptap\/.*/,
        /^prosemirror-.*/,
        "react-syntax-highlighter",
        /^react-syntax-highlighter($|\/.*)/,
        /^react-syntax-highlighter\/dist\/esm\/styles\/prism\/.*$/,
        /^react-syntax-highlighter\/dist\/esm\/styles\/hljs\/.*$/,
      ],
      output: [
        {
          format: "es",
          name: "zs_library",
          intro: 'import "./index.css";',
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
            "react-is": "ReactIs",
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
