import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor
        features={{
          image: {
            configure: {
              action: "https://tmpfiles.org/api/v1/upload",
              name: "file",
              formatResult: (response) => {
                return response.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
              },
            },
          },
        }}
      />
    </div>
  );
};
