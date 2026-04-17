import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/scheduler")
          ) {
            return "react-vendor";
          }

          if (
            id.includes("node_modules/@radix-ui") ||
            id.includes("node_modules/cmdk") ||
            id.includes("node_modules/vaul")
          ) {
            return "radix-vendor";
          }

          if (
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/axios") ||
            id.includes("node_modules/axios-retry")
          ) {
            return "data-vendor";
          }

          if (id.includes("node_modules/recharts")) {
            return "chart-vendor";
          }

          if (
            id.includes("node_modules/@mediapipe") ||
            id.includes("node_modules/@yudiel/react-qr-scanner")
          ) {
            return "ai-vendor";
          }

          if (
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/motion")
          ) {
            return "ui-vendor";
          }

          return;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@screens": path.resolve(__dirname, "./src/screens"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@navigation": path.resolve(__dirname, "./src/navigation"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@providers": path.resolve(__dirname, "./src/providers"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
});
