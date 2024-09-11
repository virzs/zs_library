# Hello World

```jsx
import React, { useState } from "react";
import { Editor } from "zs_library";

export default () => {
  const [value, setValue] = useState([]);

  console.log(value);

  return (
    <div>
      <Editor
        value={value}
        onChange={(v) => {
          setValue(v);
        }}
      />
      <Editor readOnly value={value} />
    </div>
  );
};
```
