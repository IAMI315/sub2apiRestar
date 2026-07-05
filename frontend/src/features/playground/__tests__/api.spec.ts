import { describe, expect, it, vi } from 'vitest'

const post = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post
    })
  }
}))

describe('playground feature API', () => {
  it('posts chat completion requests with the selected API key', async () => {
    post.mockResolvedValueOnce({ data: { choices: [] } })
    const { createChatCompletion } = await import('@/features/playground/api')

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

  it('posts image generation requests with the selected API key', async () => {
    post.mockResolvedValueOnce({ data: { data: [] } })
    const { createImageGeneration } = await import('@/features/playground/api')

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
