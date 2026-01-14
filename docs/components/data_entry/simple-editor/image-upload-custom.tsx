import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor
        features={{
          image: {
            configure: {
              customRequest: async ({ file, onProgress, onSuccess, onError }) => {
                try {
                  const formData = new FormData();
                  formData.append("file", file);

                  // 模拟上传进度
                  onProgress({ percent: 20 });

                  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (!response.ok) {
                    throw new Error("Upload failed");
                  }

                  // 模拟上传进度
                  onProgress({ percent: 100 });

                  const json = await response.json();

                  // tmpfiles.org 返回的是页面地址，需要转换为直接下载地址才能在 img 标签中显示
                  const url = json.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

                  onSuccess(url);
                } catch (error) {
                  onError(error instanceof Error ? error : new Error(String(error)));
                }
              },
            },
          },
        }}
      />
    </div>
  );
};
