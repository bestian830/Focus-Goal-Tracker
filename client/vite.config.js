import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加載環境變量
  const env = loadEnv(mode, process.cwd())
  
  // 確保生產環境的 API URL 設置正確
  const apiUrl = env.VITE_API_URL || 'http://localhost:5050'
  console.log(`Building with API URL: ${apiUrl} in mode: ${mode}`)
  
  // 確保環境變量在生產構建中也可用
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<\/head>/,
          `<script>window.ENV = ${JSON.stringify({ VITE_API_URL: apiUrl })}</script></head>`
        )
      }
    }
  }
  
  return {
    plugins: [react(), htmlPlugin()],
    define: {
      // 定義全局常量
      'process.env.VITE_API_URL': JSON.stringify(apiUrl)
    },
    server: {
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  }
});

