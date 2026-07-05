import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import type { ApiKey } from '@/types'
import type { UserAvailableChannel } from '@/api/channels'
import ChatView from '../ChatView.vue'

const { listKeys, getAvailableChannels, createChatCompletion } = vi.hoisted(() => ({
  listKeys: vi.fn(),
  getAvailableChannels: vi.fn(),
  createChatCompletion: vi.fn()
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
    createChatCompletion
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
    id: 1,
    user_id: 42,
    key: 'sk-chat',
    name: 'Chat key',
    group_id: 101,
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
    name: 'OpenAI Channel',
    description: '',
    platforms: [
      {
        platform: 'openai',
        groups: [
          {
            id: 101,
            name: 'OpenAI Group',
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
          { name: 'gpt-4o-mini', platform: 'openai', pricing: null },
          { name: 'gpt-4o', platform: 'openai', pricing: null }
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
  return mount(ChatView, {
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

describe('ChatView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    listKeys.mockResolvedValue({
      items: [apiKey({ id: 1, key: 'sk-chat', name: 'Chat key', group_id: 101 })]
    })
    getAvailableChannels.mockResolvedValue(channels)
    createChatCompletion.mockResolvedValue({
      choices: [{ message: { content: 'assistant reply' } }]
    })
  })

  it('loads API keys and available models, then renders scoped model choices', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(listKeys).toHaveBeenCalled()
    expect(getAvailableChannels).toHaveBeenCalled()
    expect(wrapper.text()).toContain('gpt-4o-mini')
    expect(wrapper.text()).toContain('gpt-4o')
  })

  it('restores user-scoped local chat state', async () => {
    window.localStorage.setItem('sub2api:playground:chat:user:42', JSON.stringify({
      selectedKeyId: 1,
      model: 'gpt-4o',
      messages: [{ id: 'saved-1', role: 'user', content: 'saved message' }]
    }))

    const wrapper = mountView()
    await flushPromises()

    expect((wrapper.find('[data-test="chat.selectModel"]').element as HTMLSelectElement).value).toBe('gpt-4o')
    expect(wrapper.text()).toContain('saved message')
  })

  it('persists messages locally after sending', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-test="chat-input"]').setValue('hello')
    await wrapper.find('[data-test="chat-form"]').trigger('submit')
    await flushPromises()
    await nextTick()

    expect(createChatCompletion).toHaveBeenCalledWith(
      'sk-chat',
      expect.objectContaining({
        model: 'gpt-4o',
        messages: [expect.objectContaining({ role: 'user', content: 'hello' })]
      }),
      expect.any(Object)
    )
    const saved = JSON.parse(window.localStorage.getItem('sub2api:playground:chat:user:42') || '{}')
    expect(saved.messages).toEqual([
      expect.objectContaining({ role: 'user', content: 'hello' }),
      expect.objectContaining({ role: 'assistant', content: 'assistant reply' })
    ])
  })
})
