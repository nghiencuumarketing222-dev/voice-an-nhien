import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { anNhienTtsPlugin } from "./server/ttsPlugin.ts";

export default defineConfig({
  plugins: [react(), anNhienTtsPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    allowedHosts: true,
    watch: {
      ignored: ["**/*.mp3", "**/tmp/**"],
    },
  },
});
