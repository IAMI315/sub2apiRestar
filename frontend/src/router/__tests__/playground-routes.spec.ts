import { describe, expect, it } from 'vitest'
import router from '@/router'

describe('playground routes', () => {
  it('注册聊天和画布路由且要求登录', () => {
    const chatRoute = router.getRoutes().find((route) => route.path === '/chat')
    const canvasRoute = router.getRoutes().find((route) => route.path === '/canvas')

    expect(chatRoute?.name).toBe('Chat')
    expect(chatRoute?.meta.requiresAuth).toBe(true)
    expect(chatRoute?.meta.requiresAdmin).toBe(false)
    expect(canvasRoute?.name).toBe('Canvas')
    expect(canvasRoute?.meta.requiresAuth).toBe(true)
    expect(canvasRoute?.meta.requiresAdmin).toBe(false)
  })
})
