import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 本番（build）は GitHub Pages のプロジェクトページ配下 /compriere/ で配信するため
// base を合わせる。開発（dev）はルート / のまま。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/compriere/' : '/',
  plugins: [react()],
}))
