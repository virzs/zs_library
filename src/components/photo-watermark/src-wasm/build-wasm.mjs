import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

execSync(
  "wasm-pack build . --target web --out-dir ../wasm --out-name gen_brand_photo_pictrue",
  {
    cwd: currentDir,
    stdio: "inherit",
  },
);
