import { useState } from "react";
import { IdPhotoChecker } from "zs_library";

const PASS_COLOR = "#4ade80";
const FAIL_COLOR = "#f87171";

export default function GuidePreview() {
  const [pass, setPass] = useState(false);

  const color = pass ? PASS_COLOR : FAIL_COLOR;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <IdPhotoChecker
        autoStart={false}
        width={400}
        height={500}
        guideBorderPassColor={color}
        guideBorderFailColor={color}
      />
      <button
        onClick={() => setPass((v) => !v)}
        style={{
          padding: "8px 20px",
          borderRadius: 6,
          border: "none",
          backgroundColor: pass ? FAIL_COLOR : PASS_COLOR,
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        切换为{pass ? "未通过" : "通过"}状态
      </button>
    </div>
  );
}
