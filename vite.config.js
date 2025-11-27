import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    // 输出目录，最终扩展加载 dist 作为根目录
    outDir: "dist",
    rollupOptions: {
      // 指定入口文件
      input: {
        wallet: resolve(__dirname, "wallet.js")
      },
      output: {
        // 打包后的入口文件名
        entryFileNames: "js/[name].bundle.js",
        // 代码分块文件名
        chunkFileNames: "js/[name].js",
        // 静态资源文件名
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
});
