
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    strictPort: false,
    host: "0.0.0.0",
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
