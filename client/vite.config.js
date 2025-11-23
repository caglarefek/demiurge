import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // API isteklerini yönlendir
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
            // Resim isteklerini de yönlendir
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
            // --------------------------
        }
    }
})