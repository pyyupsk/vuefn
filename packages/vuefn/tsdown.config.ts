import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/vite.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  exports: true,
  publint: { level: "suggestion" },
  attw: { profile: "esm-only", level: "error" },
});
