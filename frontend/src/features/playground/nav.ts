export interface PlaygroundNavItem {
  path: string
  label: string
  icon: unknown
}

export interface PlaygroundNavDependencies {
  t: (key: string) => string
  icons: {
    chat: unknown
    canvas: unknown
  }
}

export function createPlaygroundNavItems({ t, icons }: PlaygroundNavDependencies): PlaygroundNavItem[] {
  return [
    { path: '/chat', label: t('nav.chat'), icon: icons.chat },
    { path: '/canvas', label: t('nav.canvas'), icon: icons.canvas },
  ]
}
