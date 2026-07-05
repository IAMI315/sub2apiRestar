import en from './locales/en'
import zh from './locales/zh'

export { default as playgroundAPI } from './api'
export * from './api'
export { createPlaygroundNavItems, type PlaygroundNavDependencies, type PlaygroundNavItem } from './nav'
export { playgroundRoutes } from './routes'

export const playgroundLocales = { en, zh }
