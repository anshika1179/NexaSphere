import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      "next/image": "/src/shared/next-image.jsx",
      "next/dynamic": "/src/shared/next-dynamic.jsx",
    },
  },
  // Supports Vercel (/) and GitHub Pages (/NexaSphere/) via env var
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
    }),
  ],
  server: {
    port: 5175,
    proxy: {
      "/api": "http://localhost:8080",
      "/healthz": "http://localhost:8080",
    },
  },
});
