import { defineConfig } from 'dumi';

// 检测是否在 windows 系统下
const isWin = process.platform === 'win32';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'zs_library',
  },
  // win 系统下 api 解析会报错，暂时关闭
  apiParser: isWin ? false : {},
  resolve: {
    entryFile: './src/index.tsx',
  },
  plugins: ['@umijs/plugins/dist/tailwindcss'],
  tailwindcss: {},
});
