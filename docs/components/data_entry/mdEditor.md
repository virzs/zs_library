# Markdown 编辑器

## 基础示例

打开控制台，查看编辑器输入的信息

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

export default () => {
  const [value, setValue] = useState("");

  console.log(value);

  return (
    <div>
      <MdEditor
        onChange={(v) => {
          setValue(v);
        }}
      />
    </div>
  );
};
```

## 上传图片

使用 [tmpfiles](https://tmpfiles.org/) api 上传，1 小时后会自动删除

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

export default () => {
  const [value, setValue] = useState("");

  console.log(value);

  return (
    <div>
      <MdEditor
        onChange={(v) => {
          setValue(v);
        }}
        pluginConfig={{
          image: {
            imageUploadHandler: async (file) => {
              const body = new FormData();
              body.append("file", file);

              const ret = await fetch("https://tmpfiles.org/api/v1/upload", {
                method: "POST",
                body: body,
              });

              const res = (await ret.json()).data.url.replace(
                "tmpfiles.org/",
                "tmpfiles.org/dl/"
              );

              return res;
            },
          },
        }}
      />
    </div>
  );
};
```

## 实时预览

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

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
    <div style={{ display: "flex" }}>
      <div style={{ maxWidth: "50%", flexGrow: 1 }}>
        <MdEditor
          value={value}
          onChange={(v) => {
            setValue(v);
          }}
        />
      </div>
      <div style={{ maxWidth: "50%", flexGrow: 1, padding: "92px 12px 12px" }}>
        <MdEditor.Preview>{value}</MdEditor.Preview>
      </div>
    </div>
  );
};
```

## 主题

自动 `auto`，默认根据特定条件自动切换

``` html
<html style="color-scheme: light;"></html>
<html style="color-scheme: dark;"></html>
```

``` css
@media (prefers-color-scheme: dark) {}
```

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

export default () => {
  const [value, setValue] = useState("");

  return (
    <div>
      <MdEditor
        theme="auto"
        onChange={(v) => {
          setValue(v);
        }}
      />
    </div>
  );
};
```

浅色 `light`

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

export default () => {
  const [value, setValue] = useState("");

  return (
    <div>
      <MdEditor
        theme="light"
        onChange={(v) => {
          setValue(v);
        }}
      />
    </div>
  );
};
```

深色 `dark`

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

export default () => {
  const [value, setValue] = useState("");

  return (
    <div>
      <MdEditor
        theme="dark"
        onChange={(v) => {
          setValue(v);
        }}
      />
    </div>
  );
};
```