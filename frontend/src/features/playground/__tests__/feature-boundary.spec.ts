import { describe, expect, it } from 'vitest'

import { playgroundAPI } from '@/features/playground/api'
import { playgroundEnMessages, playgroundZhMessages } from '@/features/playground/i18n'
import { playgroundNavItems } from '@/features/playground/navigation'
import { playgroundRoutes } from '@/features/playground/routes'

describe('playground feature boundary', () => {
  it('exposes chat and canvas routes from the feature module', () => {
    expect(playgroundRoutes.map((route) => route.path)).toEqual(['/chat', '/canvas'])
    expect(playgroundRoutes.map((route) => route.name)).toEqual(['Chat', 'Canvas'])

    for (const route of playgroundRoutes) {
      expect(route.meta?.requiresAuth).toBe(true)
      expect(route.meta?.requiresAdmin).toBe(false)
      expect(typeof route.component).toBe('function')
    }
  })

  it('exposes sidebar navigation items from the feature module', () => {
    expect(playgroundNavItems.map((item) => item.path)).toEqual(['/chat', '/canvas'])
    expect(playgroundNavItems.map((item) => item.labelKey)).toEqual(['nav.chat', 'nav.canvas'])
  })

  it('exposes playground API methods from the feature module', () => {
    expect(playgroundAPI).toHaveProperty('createChatCompletion')
    expect(playgroundAPI).toHaveProperty('createImageGeneration')
  })

  it('owns chat and canvas locale messages', () => {
    expect(playgroundEnMessages.nav.chat).toBe('Chat')
    expect(playgroundEnMessages.pages.chat.title).toBe('Chat')
    expect(playgroundEnMessages.pages.canvas.title).toBe('Canvas')
    expect(playgroundZhMessages.nav.chat).toBe('聊天')
    expect(playgroundZhMessages.pages.chat.title).toBe('聊天')
    expect(playgroundZhMessages.pages.canvas.title).toBe('画布')
  })
})
