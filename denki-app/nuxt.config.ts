import vuetify from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
    devServer: {
    port: 3000
  },
  build: {
    transpile: ['vuetify'],
  },
  // アプリケーションの基本URLを設定
  app: {
    baseURL: '/denki/',
    buildAssetsDir: '/_nuxt/'
  },

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css' // ★ これを追加
  ],
  
  // Vuetifyモジュールを有効化
  modules: [
    ['@pinia/nuxt']
  ],

  // Viteサーバーの設定
  vite: {
        ssr: {
          noExternal: ['vuetify'],
        },
        plugins: [
          vuetify({ autoImport: true }), // 👈 Vuetify を Vite 経由で有効化
        ],
        server: {
          allowedHosts: ['o-ishisugihara.com']
        },
        watch: {
          usePolling: true,
          interval: 100
        }
  },

  // apiのBaseURLを設定
    runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8081/api/denki'
    }
  },

  // 👇 フロント専用にする設定を追加
  ssr: false,
  nitro: {
    preset: 'static'
  }

})
