# Markdown 渲染

## 依赖

```json
{
  "react-markdown": "^9.0.1",
  "rehype-raw": "^7.0.0",
  "remark-emoji": "^5.0.1",
  "remark-gfm": "^4.0.0",
  "react-syntax-highlighter": "^15.6.1",
  "rc-image": "^7.11.0",
  "github-markdown-css": "^5.8.1"
}
```

## 基础示例

```jsx
import React, { useState } from "react";
import { Markdown } from "zs_library";

export default () => {
  const [value, setValue] = useState(`
# h1

## h2

### h3

#### h4

##### h5

###### h6

**粗体** *斜体* <u>下划线 </u> \`code\`

~~删除线~~ <sup>上标</sup> <sub>下标</sub>

* 无序列表
* 无序列表
* 无序列表

1. 有序列表
2. 有序列表
3. 有序列表

* [ ] 任务列表
* [x] 任务列表
* [x] 任务列表

[链接](https://google.com "链接")

![](https://images.pexels.com/photos/21533286/pexels-photo-21533286.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1 "图片")

| 序号 | 姓名 | 年龄 |
| -- | -- | -- |
| 1  | x  | 13 |
| 2  | s  | 17 |

\`\`\`js
console.log('Hello World');
\`\`\`
`);

  return (
    <div>
      <Markdown>{value}</Markdown>
    </div>
  );
};
```
