// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: false,
  ssr: true,
  modules: ['@nuxtjs/i18n', '@pinia/nuxt'],

  app: {
    head: {
      htmlAttrs: { lang: 'th-TH' },
      title: 'Opwatch — Official Watch Boutique',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Opwatch Official Boutique — Olym Pianus, Ogival & Opwatch fine automatic, Swiss & Japanese movement timepieces.'
        },
        { name: 'theme-color', content: '#121110' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Noto+Sans+Thai:wght@300;400;500;600&family=Noto+Serif+Thai:wght@400;500;600&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'th',
    locales: [
      { code: 'th', language: 'th-TH', name: 'ภาษาไทย', file: 'th.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    langDir: 'locales',
    restructureDir: false,
    detectBrowserLanguage: false,
    bundle: {
      optimizeTranslationDirective: false
    }
  },

  runtimeConfig: {
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Opwatch'
    }
  },

  nitro: {
    compressPublicAssets: true
  },

  vite: {
    server: {
      allowedHosts: true
    }
  }
})
