
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  base: './',

  server: {
    port: 5173,
    strictPort: false,
    host: "0.0.0.0",
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },

  preview: {
    port: 4173,
    strictPort: false,
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three/")) {
            return "three-core";
          }

          if (
            id.includes("@react-three/fiber") ||
            id.includes("@react-three/drei")
          ) {
            return "three-react";
          }

          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("/node_modules/react/")
          ) {
            return "react-vendor";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }
        },
      },
    },
  },
});

