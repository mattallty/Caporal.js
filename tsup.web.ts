import { defineConfig } from "tsup"

export default defineConfig((options) => {
  return {
    entry: {
      core: "src/web.ts",
    },
    sourcemap: true,
    target: ["chrome58"],
    clean: false,
    minify: !options.watch,
    splitting: false,
    format: ["iife"],
    globalName: "Caporal",
  }
})
