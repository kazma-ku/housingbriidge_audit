import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This ensures your build output is clean
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
