import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加載環境變量
  const env = loadEnv(mode, process.cwd())
  
  // 開發環境配置
  const devConfig = {
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5050",
          changeOrigin: true,
        },
      },
    },
  }
  
  // 生產環境配置
  const prodConfig = {
    // 生產環境不需要代理
  }
  
  return {
    plugins: [react()],
    ...(mode === 'production' ? prodConfig : devConfig)
  }
});

