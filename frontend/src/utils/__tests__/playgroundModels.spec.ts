import { describe, expect, it } from 'vitest'
import type { ApiKey } from '@/types'
import type { UserAvailableChannel } from '@/api/channels'
import { buildModelOptionsForKey } from '@/utils/playgroundModels'

function apiKey(overrides: Partial<ApiKey>): ApiKey {
  return {
    id: 1,
    user_id: 10,
    key: 'sk-test',
    name: 'Test key',
    group_id: null,
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
  },
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
          { name: 'gpt-4o-mini', platform: 'openai', pricing: null }
        ]
      }
    ]
  }
]

describe('buildModelOptionsForKey', () => {
  it('returns only models from the selected API key group', () => {
    const options = buildModelOptionsForKey(apiKey({ group_id: 101 }), channels)

    expect(options.map((option) => option.value)).toEqual(['gpt-4o', 'gpt-4o-mini'])
    expect(options[0]).toMatchObject({
      label: 'gpt-4o · openai · OpenAI Channel',
      platform: 'openai',
      channelName: 'OpenAI Channel'
    })
  })

  it('returns all visible models for an ungrouped API key', () => {
    const options = buildModelOptionsForKey(apiKey({ group_id: null }), channels)

    expect(options.map((option) => option.value)).toEqual([
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-image-1'
    ])
  })

  it('deduplicates model names across visible channels', () => {
    const options = buildModelOptionsForKey(apiKey({ group_id: null }), channels)

    expect(options.filter((option) => option.value === 'gpt-4o-mini')).toHaveLength(1)
  })

  it('returns an empty list when no API key is selected', () => {
    expect(buildModelOptionsForKey(null, channels)).toEqual([])
  })
})
