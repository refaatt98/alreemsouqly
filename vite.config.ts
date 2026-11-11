import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 8080,
    proxy: {
      "/__l5e/assets-v1/": {
        target: "https://id-preview--9e64349d-8bca-43ae-a210-d89d89d8bf77.lovable.app",
        changeOrigin: true,
      },
    },
  },
});
