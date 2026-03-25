# zs_library

[![NPM version](https://img.shields.io/npm/v/zs_library.svg?style=flat)](https://npmjs.org/package/zs_library)
[![NPM downloads](http://img.shields.io/npm/dm/zs_library.svg?style=flat)](https://npmjs.org/package/zs_library)

个人业务组件库 React

## 组件列表

### 布局

| 组件 | 说明 |
| --- | --- |
| `DesktopNext` | 基于 motion 实现的轻量级桌面组件，类似 iPadOS 桌面效果。支持拖拽排序、拖拽合并文件夹、多页分页、右键菜单、组件注册表、主题定制、布局持久化。**推荐使用** |
| `Desktop` | 基于 react-sortablejs 封装实现的桌面组件，支持排序、文件夹、分页、本地存储、主题定制、右键菜单和 Dock 栏。**已废弃，请使用 DesktopNext** |
| `Dock` | macOS / iOS 风格的 Dock 栏组件，支持桌面端（放大悬浮动效）和移动端两种模式 |

### 数据录入

| 组件 | 说明 |
| --- | --- |
| `SimpleEditor` | 基于 Tiptap 的富文本编辑器，支持常见文本格式、图片上传、AI 辅助写作、多种输出格式（HTML / JSON / Markdown）、受控模式 |
| `IdPhotoChecker` | 基于 @vladmandic/human 的实时证件照检测组件，支持边框偏离检测、戴帽检测、戴眼镜检测、面部遮挡检测，提供中文提示 |
| `MdEditor` | Markdown 编辑器，支持实时预览、图片上传、主题切换。**已废弃，请使用 SimpleEditor** |

### 数据展示

| 组件 | 说明 |
| --- | --- |
| `GeoMap` | 基于 react-map-gl 和 maplibre-gl 的中国地理地图组件，支持按缩放级别自动加载/卸载行政区划数据、自定义数据源 |
| `Markdown` | Markdown 渲染组件，支持 GFM、代码高亮、图片预览、emoji |
| `PhotoWatermark` | 基于 Canvas 的照片水印生成组件，支持多品牌相机风格、自动提取 EXIF 信息、Canvas/HTML 双渲染模式 |

## 编码规范

参考 [Angular coding style guide](https://angular.dev/style-guide#file-structure-conventions)

## LICENSE

MIT
