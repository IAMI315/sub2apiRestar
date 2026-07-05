import { describe, expect, it } from 'vitest'
import { createPlaygroundNavItems } from '@/features/playground'

describe('createPlaygroundNavItems', () => {
  it('returns chat and canvas nav items in order', () => {
    const icons = {
      chat: Symbol('chat-icon'),
      canvas: Symbol('canvas-icon'),
    }
    const t = (key: string) => `translated:${key}`

    const items = createPlaygroundNavItems({ t, icons })

    expect(items).toEqual([
      { path: '/chat', label: 'translated:nav.chat', icon: icons.chat },
      { path: '/canvas', label: 'translated:nav.canvas', icon: icons.canvas },
    ])
  })
})
