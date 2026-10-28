// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: false,
  ssr: true,
  modules: ['@nuxtjs/i18n', '@pinia/nuxt'],

  app: {
    router: {
      middleware: ['install']
    },
    head: {
      htmlAttrs: { lang: 'th-TH' },
      title: 'Opwatch — Timeless Watches',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Opwatch — curated automatic and dress watches. Crafted for those who value time.' },
        { name: 'theme-color', content: '#1a1a1a' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap'
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
    // Keep locales at <root>/locales instead of the module's restructured i18n/ folder.
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
  }
})
