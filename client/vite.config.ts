import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "../",
  server: {
    proxy: {
      "/api": {
        target: "http://114.148.254.131:3690",
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
  },
  plugins: [react()],
});
