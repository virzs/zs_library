# Hello World

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
