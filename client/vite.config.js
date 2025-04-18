import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, ".");

  // Ensure the API URL is set correctly in production
  const apiUrl = env.VITE_API_URL || "http://localhost:5050";
  console.log(`Building with API URL: ${apiUrl} in mode: ${mode}`);

  // Ensure environment variables are available in production build
  const htmlPlugin = () => {
    return {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(
          /<\/head>/,
          `<script>window.ENV = ${JSON.stringify({
            VITE_API_URL: apiUrl,
          })}</script></head>`
        );
      },
    };
  };

  // Development environment configuration
  const devConfig = {
    server: {
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  };

  // Production environment configuration
  const prodConfig = {
    // No proxy needed in production
  };

  return {
    plugins: [react(), htmlPlugin()],
    ...(mode === "production" ? prodConfig : devConfig),
  };
});
