## DesktopNext 布局单元测试

在仓库根目录运行以下命令。测试使用项目已安装的 TypeScript 和 Node.js 的测试工具，编译结果放在系统临时目录。

```sh
test_dir=$(mktemp -d) &&
  pnpm exec tsc --strict --skipLibCheck --target ES2020 --module commonjs --moduleResolution node \
    --outDir "$test_dir" tests/desktop-next-layout.test.ts &&
  node --test "$test_dir/tests/desktop-next-layout.test.js"
```

## DesktopNext 浏览器操作测试

先在仓库根目录安装项目依赖。测试使用 Playwright 驱动 Chrome 或 Chromium，并在本地启动 Vite。结束后会关闭浏览器、停止服务并清理测试缓存。

下面的命令适用于已安装 Google Chrome 的 macOS。Linux 用户可将 `CHROMIUM_PATH` 改为本机 Chrome 或 Chromium 可执行文件的路径。

```sh
test_tools=$(mktemp -d) &&
  npm install --prefix "$test_tools" playwright-core &&
  PLAYWRIGHT_MODULE="$test_tools/node_modules/playwright-core" \
  CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  node --test tests/desktop-next-browser/desktop.test.mjs
```

已有 Playwright 环境时，可直接将 `PLAYWRIGHT_MODULE` 指向已安装的 `playwright-core` 包目录。如果该版本已经下载了配套 Chromium，可省略 `CHROMIUM_PATH`。

测试覆盖新旧数据转换、自动分页与缩放、保留空位与紧凑排列、多格组件、文件夹、鼠标和触控拖动、取消操作、跨页交换、额外图标及刷新后恢复布局。测试同时检查实际屏幕坐标、保存的数据、浏览器运行时异常和控制台错误。
