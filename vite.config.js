import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: "lib",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "language/js": resolve(__dirname, "src/language/js.ts"),
        "language/python": resolve(__dirname, "src/language/python.ts"),
        "language/swift": resolve(__dirname, "src/language/swift.ts"),
      },
      name: "coldstitch",
      formats: ["es", "cjs"],
    },
  },
  plugins: [dts()],
});
