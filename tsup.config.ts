import { defineConfig } from "tsup"

export default defineConfig((options) => {
  return {
    entry: ["src/index.ts"],
    sourcemap: true,
    clean: true,
    minify: !options.watch,
    splitting: false,
    outDir: "dist",
    format: ["cjs", "esm"],
    dts: true,
  }
})
