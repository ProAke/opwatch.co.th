// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: false,
  ssr: true,
  modules: ['@nuxtjs/i18n', '@pinia/nuxt'],

  app: {
    head: {
      htmlAttrs: { lang: 'th-TH' },
      title: 'Olym Pianus · Opwatch — Official Watch Boutique',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Olym Pianus, Ogival & Opwatch Official Boutique — Inspired by the ultimate glory of the Olympic spirit, fusing exquisite craftsmanship and contemporary watchmaking.'
        },
        { name: 'theme-color', content: '#0a0a0a' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Great+Vibes&family=Montserrat:wght@200;300;400;500;600&family=Noto+Sans+Thai:wght@300;400;500;600&family=Noto+Serif+Thai:wght@400;500;600&display=swap'
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
