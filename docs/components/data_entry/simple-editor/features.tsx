import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor
        features={{
          // 禁用撤销重做
          undoRedo: false,
          // 禁用代码块
          codeBlock: false,
          // 配置标题等级
          heading: {
            configure: {
              levels: [1, 2, 3],
            },
          },
          // 启用高亮并配置
          highlight: {
            configure: {
              multicolor: true,
            },
          },
        }}
      />
    </div>
  );
};
