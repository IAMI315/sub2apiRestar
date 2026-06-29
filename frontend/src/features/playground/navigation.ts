export type PlaygroundNavItemKey = 'chat' | 'canvas'

export interface PlaygroundNavItem {
  key: PlaygroundNavItemKey
  path: string
  labelKey: string
}

export const playgroundNavItems: PlaygroundNavItem[] = [
  { key: 'chat', path: '/chat', labelKey: 'nav.chat' },
  { key: 'canvas', path: '/canvas', labelKey: 'nav.canvas' }
]
