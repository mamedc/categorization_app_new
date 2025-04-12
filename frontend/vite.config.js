// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// import tsconfigPaths from "vite-tsconfig-paths" 
// ESSA ERA ALINHA ORIGINAL DO SETUP DO CHAKRA. MUDEI POIS TAVA DANDO ERRO
// A LINHA ABAIXO E TB A ALTERAÇÃO MAIS ABAIXO FOI SUGESTÃO DO GPT
import * as path from 'node:path'; // Explicitly import path

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // , tsconfigPaths()], LINHA ORIGINAL DO SETUP DO CHAKRA
  server: {port: 3000,},
  resolve: { // O RESOLVE TODO FOI INCLUSÃO DO GPT
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
