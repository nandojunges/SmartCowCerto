import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "SmartCow",
        short_name: "SmartCow",
        start_url: "/inicio",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1b5e20",
        orientation: "any",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [/^\/.*$/],
        navigateFallbackDenylist: [
          /^\/assets\//,
          /^\/icons\//,
          /^\/favicon\.ico$/,
          /^\/manifest\.webmanifest$/,
          /^\/registerSW\.js$/,
          /^\/workbox-.*\.js$/,
          /^\/sw\.js$/,
          /^\/rest\//,
          /^\/auth\//,
        ],
      },

      // ✅ A ÚNICA MUDANÇA: NÃO ATIVAR SW NO DEV
      devOptions: {
        enabled: false,
      },
    }),
  ],

  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
