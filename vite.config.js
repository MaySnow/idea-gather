// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')
const isProduction = process.env.NODE_ENV === "production";
module.exports = defineConfig({
  base: isProduction ? "//img.mayxiaoyu.com" : "/",
  build: {
    outDir: './demo',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        iconSvg: resolve(__dirname, 'iconSvg/index.html')
      }
    }
  }
})