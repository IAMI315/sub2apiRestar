import type { UserAvailableChannel } from '@/api/channels'
import type { ApiKey } from '@/types'

export interface PlaygroundModelOption {
  value: string
  label: string
  platform: string
  channelName: string
  [key: string]: unknown
}

export function buildModelOptionsForKey(
  key: ApiKey | null,
  channels: UserAvailableChannel[]
): PlaygroundModelOption[] {
  if (!key) return []

  const optionsByModel = new Map<string, PlaygroundModelOption>()

  for (const channel of channels) {
    for (const section of channel.platforms || []) {
      const groupMatches = key.group_id == null
        || section.groups.some((group) => group.id === key.group_id)
      if (!groupMatches) continue

      for (const model of section.supported_models || []) {
        const modelName = model.name.trim()
        if (!modelName || optionsByModel.has(modelName)) continue
        const platform = model.platform || section.platform
        optionsByModel.set(modelName, {
          value: modelName,
          label: `${modelName} · ${platform} · ${channel.name}`,
          platform,
          channelName: channel.name
        })
      }
    }
  }

  return [...optionsByModel.values()].sort((a, b) => a.value.localeCompare(b.value))
}
