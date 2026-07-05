import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import type { ApiKey } from '@/types'
import type { UserAvailableChannel } from '@/api/channels'
import CanvasView from '../CanvasView.vue'

const { listKeys, getAvailableChannels, createImageGeneration } = vi.hoisted(() => ({
  listKeys: vi.fn(),
  getAvailableChannels: vi.fn(),
  createImageGeneration: vi.fn()
}))

vi.mock('@/api/keys', () => ({
  default: {
    list: listKeys
  }
}))

vi.mock('@/api/channels', () => ({
  default: {
    getAvailable: getAvailableChannels
  },
  userChannelsAPI: {
    getAvailable: getAvailableChannels
  }
}))

vi.mock('@/api/playground', () => ({
  default: {
    createImageGeneration
  }
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 42 }
  })
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key
    })
  }
})

function apiKey(overrides: Partial<ApiKey>): ApiKey {
  return {
    id: 2,
    user_id: 42,
    key: 'sk-image',
    name: 'Image key',
    group_id: 202,
    status: 'active',
    ip_whitelist: [],
    ip_blacklist: [],
    last_used_at: null,
    quota: 0,
    quota_used: 0,
    expires_at: null,
    created_at: '2026-07-05T00:00:00Z',
    updated_at: '2026-07-05T00:00:00Z',
    rate_limit_5h: 0,
    rate_limit_1d: 0,
    rate_limit_7d: 0,
    usage_5h: 0,
    usage_1d: 0,
    usage_7d: 0,
    window_5h_start: null,
    window_1d_start: null,
    window_7d_start: null,
    reset_5h_at: null,
    reset_1d_at: null,
    reset_7d_at: null,
    ...overrides
  }
}

const channels: UserAvailableChannel[] = [
  {
    name: 'Image Channel',
    description: '',
    platforms: [
      {
        platform: 'openai',
        groups: [
          {
            id: 202,
            name: 'Image Group',
            platform: 'openai',
            subscription_type: 'standard',
            rate_multiplier: 1,
            peak_rate_enabled: false,
            peak_start: '',
            peak_end: '',
            peak_rate_multiplier: 1,
            is_exclusive: false
          }
        ],
        supported_models: [
          { name: 'gpt-image-1', platform: 'openai', pricing: null },
          { name: 'gpt-4o-image', platform: 'openai', pricing: null }
        ]
      }
    ]
  }
]

const SelectStub = {
  props: ['modelValue', 'options', 'placeholder'],
  emits: ['update:modelValue'],
  template: `
    <select
      :data-test="placeholder"
      :value="modelValue ?? ''"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  `
}

function mountView() {
  return mount(CanvasView, {
    global: {
      stubs: {
        AppLayout: { template: '<div><slot /></div>' },
        EmptyState: { template: '<div data-test="empty-state" />' },
        Icon: { template: '<span />' },
        Select: SelectStub,
        Teleport: true
      }
    }
  })
}

describe('CanvasView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    listKeys.mockResolvedValue({
      items: [apiKey({ id: 2, key: 'sk-image', name: 'Image key', group_id: 202 })]
    })
    getAvailableChannels.mockResolvedValue(channels)
    createImageGeneration.mockResolvedValue({
      data: [{ b64_json: 'abc123', revised_prompt: 'better prompt' }]
    })
  })

  it('loads API keys and available models, then renders scoped model choices', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(listKeys).toHaveBeenCalled()
    expect(getAvailableChannels).toHaveBeenCalled()
    expect(wrapper.text()).toContain('gpt-image-1')
    expect(wrapper.text()).toContain('gpt-4o-image')
  })

  it('restores user-scoped local canvas state', async () => {
    window.localStorage.setItem('sub2api:playground:canvas:user:42', JSON.stringify({
      selectedKeyId: 2,
      model: 'gpt-image-1',
      prompt: 'saved prompt',
      size: '1536x1024',
      count: 2,
      images: [{ id: 'saved-image', src: 'data:image/png;base64,saved', revisedPrompt: 'saved revised' }]
    }))

    const wrapper = mountView()
    await flushPromises()

    expect((wrapper.find('[data-test="canvas.selectModel"]').element as HTMLSelectElement).value).toBe('gpt-image-1')
    expect((wrapper.find('[data-test="canvas-prompt"]').element as HTMLTextAreaElement).value).toBe('saved prompt')
    expect(wrapper.text()).toContain('saved revised')
  })

  it('persists generated images locally after a successful request', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-test="canvas-prompt"]').setValue('draw a cat')
    await wrapper.find('[data-test="canvas-generate"]').trigger('click')
    await flushPromises()
    await nextTick()

    expect(createImageGeneration).toHaveBeenCalledWith(
      'sk-image',
      expect.objectContaining({
        model: 'gpt-4o-image',
        prompt: 'draw a cat',
        size: '1024x1024',
        n: 1
      }),
      expect.any(Object)
    )
    const saved = JSON.parse(window.localStorage.getItem('sub2api:playground:canvas:user:42') || '{}')
    expect(saved.images).toEqual([
      expect.objectContaining({
        src: 'data:image/png;base64,abc123',
        revisedPrompt: 'better prompt'
      })
    ])
  })
})
