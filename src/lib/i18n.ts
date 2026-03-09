export const languages = {
  en: {
    code: 'en',
    label: 'English',
    nav: {
      products: 'Products',
      about: 'About',
      safety: 'Safety',
      support: 'Support',
      download: 'Download',
      login: 'Log in',
    },
    hero: {
      heading: 'Swipe Right',
      cta: 'Create account',
    },
  },
  ru: {
    code: 'ru',
    label: 'Русский',
    nav: {
      products: 'Продукты',
      about: 'О нас',
      safety: 'Безопасность',
      support: 'Поддержка',
      download: 'Установить',
      login: 'Войдите',
    },
    hero: {
      heading: 'Свайпайте вправо',
      cta: 'Создать аккаунт',
    },
  },
  es: {
    code: 'es',
    label: 'Español',
    nav: {
      products: 'Productos',
      about: 'Nosotros',
      safety: 'Seguridad',
      support: 'Soporte',
      download: 'Descargar',
      login: 'Iniciar sesión',
    },
    hero: {
      heading: 'Desliza a la derecha',
      cta: 'Crear cuenta',
    },
  },
  de: {
    code: 'de',
    label: 'Deutsch',
    nav: {
      products: 'Produkte',
      about: 'Über uns',
      safety: 'Sicherheit',
      support: 'Support',
      download: 'Herunterladen',
      login: 'Anmelden',
    },
    hero: {
      heading: 'Wisch nach rechts',
      cta: 'Konto erstellen',
    },
  },
}

export type LangCode = keyof typeof languages
export type Translations = (typeof languages)[LangCode]
