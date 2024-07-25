import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'zs_library',
  },
  apiParser: {},
  resolve: {
    entryFile: './src/index.tsx',
  },
});
