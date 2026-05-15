import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";

function fcmConfigPlugin(): Plugin {
  return {
    name: "fcm-config",
    configResolved() {
      const config = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || "",
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.VITE_FIREBASE_APP_ID || "",
      };
      const content = `self.__FCM_CONFIG__ = ${JSON.stringify(config)};\n`;
      fs.writeFileSync("public/fcm-config.js", content);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), fcmConfigPlugin()],
  server: {
    allowedHosts: true, // Thêm dòng này để cho phép tất cả các host
  },
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
      "@assets": path.resolve(__dirname, "./public/assets"),
      "@screens": path.resolve(__dirname, "./src/screens"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@navigation": path.resolve(__dirname, "./src/navigation"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@providers": path.resolve(__dirname, "./src/providers"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Tự động inject biến và mixins vào tất cả các file SCSS
        additionalData: `@use "@/styles/_variables.scss" as *;\n@use "@/styles/_mixins" as *;`,
      },
    },
  },
});
