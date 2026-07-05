import { describe, expect, it } from 'vitest'
import { playgroundRoutes } from '@/features/playground'

describe('playgroundRoutes', () => {
  it('exports authenticated chat and canvas route records', () => {
    const chatRoute = playgroundRoutes.find((route) => route.path === '/chat')
    const canvasRoute = playgroundRoutes.find((route) => route.path === '/canvas')

    expect(chatRoute?.name).toBe('Chat')
    expect(chatRoute?.meta?.requiresAuth).toBe(true)
    expect(chatRoute?.meta?.requiresAdmin).toBe(false)
    expect(chatRoute?.meta?.titleKey).toBe('chat.title')
    expect(chatRoute?.meta?.descriptionKey).toBe('chat.description')

    expect(canvasRoute?.name).toBe('Canvas')
    expect(canvasRoute?.meta?.requiresAuth).toBe(true)
    expect(canvasRoute?.meta?.requiresAdmin).toBe(false)
    expect(canvasRoute?.meta?.titleKey).toBe('canvas.title')
    expect(canvasRoute?.meta?.descriptionKey).toBe('canvas.description')
  })
})
