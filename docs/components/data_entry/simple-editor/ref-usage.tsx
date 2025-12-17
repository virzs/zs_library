import React, { useRef } from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  const editorRef = useRef(null);

  const handleLogHtml = () => {
    if (editorRef.current?.editor) {
      console.log(editorRef.current.editor.getHTML());
    }
  };

  return (
    <div>
      <button onClick={handleLogHtml} style={{ marginBottom: "8px" }}>
        Log HTML
      </button>
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
        <SimpleEditor ref={editorRef} />
      </div>
    </div>
  );
};
