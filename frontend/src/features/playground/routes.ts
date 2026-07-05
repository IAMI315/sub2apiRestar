import type { RouteRecordRaw } from 'vue-router'

export const playgroundRoutes: RouteRecordRaw[] = [
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('./views/ChatView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: false,
      title: 'Chat',
      titleKey: 'chat.title',
      descriptionKey: 'chat.description'
    }
  },
  {
    path: '/canvas',
    name: 'Canvas',
    component: () => import('./views/CanvasView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: false,
      title: 'Canvas',
      titleKey: 'canvas.title',
      descriptionKey: 'canvas.description'
    }
  }
]
