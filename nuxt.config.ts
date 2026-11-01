// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  future: {
    compatibilityVersion: 4
  },
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],
  components: [
    {
      path: '~/components/u',
      prefix: 'U',
      pathPrefix: false
    },
    {
      path: '~/components',
      pathPrefix: false
    }
  ],
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  app: {
    head: {
      title: 'ЮрКонтроль РК — AI-CRM Взыскания и Ведения Дел',
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Собственная AI-CRM платформа продаж и ведения дел по взысканию задолженности в Республике Казахстан' }
      ]
    }
  }
})
