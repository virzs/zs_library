import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import libCss from "vite-plugin-libcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
    }),
    visualizer({ open: false }),
    libCss(),
  ],
  css: {
    preprocessorOptions: {
      css: {},
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
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      // external: ['react', 'react-dom'],
      external: (id) => /node_modules/.test(id),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console 语句
      },
    },
  },
});
