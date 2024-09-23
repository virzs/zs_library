# Markdown 编辑器

## 基础示例

打开控制台，查看编辑器输入的信息

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

export default () => {
  const [value, setValue] = useState([]);

  console.log(value);

  return (
    <div>
      <MdEditor />
    </div>
  );
};
```

## 上传图片

使用 [tmpfiles](https://tmpfiles.org/) api 上传，1小时后会自动删除

```jsx
import React, { useState } from "react";
import { MdEditor } from "zs_library";

export default () => {
  const [value, setValue] = useState([]);

  console.log(value);

  return (
    <div>
      <MdEditor
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
