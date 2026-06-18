import { describe, expect, it, vi } from 'vitest'

const post = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post
    })
  }
}))

describe('playgroundAPI', () => {
  it('聊天请求携带用户选择的 API Key', async () => {
    post.mockResolvedValueOnce({ data: { choices: [] } })
    const { createChatCompletion } = await import('@/api/playground')

    await createChatCompletion('sk-test-chat', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hello' }]
    })

    expect(post).toHaveBeenCalledWith(
      '/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'hello' }]
      },
      expect.objectContaining({
        headers: { Authorization: 'Bearer sk-test-chat' }
      })
    )
  })

  it('图片生成请求携带用户选择的 API Key', async () => {
    post.mockResolvedValueOnce({ data: { data: [] } })
    const { createImageGeneration } = await import('@/api/playground')

    await createImageGeneration('sk-test-image', {
      model: 'gpt-image-1',
      prompt: 'draw a cat',
      size: '1024x1024',
      n: 1
    })

    expect(post).toHaveBeenCalledWith(
      '/v1/images/generations',
      {
        model: 'gpt-image-1',
        prompt: 'draw a cat',
        size: '1024x1024',
        n: 1
      },
      expect.objectContaining({
        headers: { Authorization: 'Bearer sk-test-image' }
      })
    )
  })
})
