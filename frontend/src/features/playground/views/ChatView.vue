<template>
  <AppLayout>
    <div class="flex min-h-[calc(100vh-4rem)] flex-col bg-gray-50 dark:bg-dark-950">
      <div class="border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-dark-800 dark:bg-dark-900/90 sm:px-6">
        <div class="mx-auto flex max-w-5xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('chat.title') }}</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-dark-400">{{ t('chat.description') }}</p>
          </div>
          <div class="grid gap-2 sm:grid-cols-2 lg:w-[520px]">
            <Select
              :model-value="selectedKeyId"
              :options="keyOptions"
              :placeholder="t('chat.selectKey')"
              @update:model-value="handleKeyChange"
            />
            <input
              v-model="model"
              type="text"
              class="input"
              :placeholder="t('chat.modelPlaceholder')"
            />
          </div>
        </div>
      </div>

      <main class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-4 sm:px-6">
        <div class="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-800 dark:bg-dark-900 sm:p-6">
          <div v-if="loadingKeys" class="flex h-full min-h-[360px] items-center justify-center text-sm text-gray-500 dark:text-dark-400">
            {{ t('chat.loadingKeys') }}
          </div>
          <EmptyState
            v-else-if="apiKeys.length === 0"
            :title="t('chat.noKeysTitle')"
            :description="t('chat.noKeysDescription')"
          />
          <div v-else-if="messages.length === 0" class="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <Icon name="chat" size="lg" />
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('chat.emptyTitle') }}</h2>
            <p class="mt-2 max-w-md text-sm text-gray-500 dark:text-dark-400">{{ t('chat.emptyDescription') }}</p>
          </div>
          <div v-else class="space-y-5">
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[84%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6"
                :class="message.role === 'user'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-800 dark:bg-dark-800 dark:text-gray-100'"
              >
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {{ errorMessage }}
        </div>

        <form class="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-dark-800 dark:bg-dark-900" @submit.prevent="sendMessage">
          <textarea
            v-model="draft"
            rows="3"
            class="w-full resize-none rounded-xl border-0 bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-dark-400"
            :placeholder="t('chat.inputPlaceholder')"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="mt-2 flex items-center justify-between gap-3">
            <button type="button" class="btn btn-ghost btn-sm" :disabled="messages.length === 0 || sending" @click="clearMessages">
              {{ t('chat.clear') }}
            </button>
            <button v-if="sending" type="button" class="btn btn-secondary btn-sm" @click="stopRequest">
              <Icon name="x" size="sm" />
              {{ t('chat.stop') }}
            </button>
            <button v-else type="submit" class="btn btn-primary btn-sm" :disabled="!canSend">
              <Icon name="arrowUp" size="sm" />
              {{ t('chat.send') }}
            </button>
          </div>
        </form>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Select from '@/components/common/Select.vue'
import Icon from '@/components/icons/Icon.vue'
import keysAPI from '@/api/keys'
import playgroundAPI, { type PlaygroundChatMessage } from '@/features/playground/api'
import type { ApiKey } from '@/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const { t } = useI18n()

const apiKeys = ref<ApiKey[]>([])
const selectedKeyId = ref<number | null>(null)
const model = ref('gpt-4o-mini')
const draft = ref('')
const messages = ref<ChatMessage[]>([])
const loadingKeys = ref(false)
const sending = ref(false)
const errorMessage = ref('')
let requestController: AbortController | null = null

const keyOptions = computed(() =>
  apiKeys.value.map((key) => ({
    value: key.id,
    label: `${key.name}${key.status === 'active' ? '' : ` (${t(`keys.status.${key.status}`)})`}`
  }))
)

const selectedKey = computed(() => apiKeys.value.find((key) => key.id === selectedKeyId.value) || null)
const canSend = computed(() => !!selectedKey.value && draft.value.trim().length > 0 && model.value.trim().length > 0 && !sending.value)

function handleKeyChange(value: string | number | boolean | null) {
  selectedKeyId.value = typeof value === 'number' ? value : Number(value) || null
}

function appendMessage(role: ChatMessage['role'], content: string) {
  messages.value.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content
  })
}

async function loadKeys() {
  loadingKeys.value = true
  errorMessage.value = ''
  try {
    const response = await keysAPI.list(1, 100, { sort_by: 'created_at', sort_order: 'desc' })
    apiKeys.value = response.items
    const activeKey = response.items.find((key) => key.status === 'active') || response.items[0]
    selectedKeyId.value = activeKey?.id ?? null
  } catch (error: any) {
    errorMessage.value = error?.message || t('chat.loadKeysFailed')
  } finally {
    loadingKeys.value = false
  }
}

async function sendMessage() {
  if (!canSend.value || !selectedKey.value) return
  const content = draft.value.trim()
  draft.value = ''
  errorMessage.value = ''
  appendMessage('user', content)

  requestController = new AbortController()
  sending.value = true
  try {
    const payloadMessages: PlaygroundChatMessage[] = messages.value.map((message) => ({
      role: message.role,
      content: message.content
    }))
    const response = await playgroundAPI.createChatCompletion(
      selectedKey.value.key,
      {
        model: model.value.trim(),
        messages: payloadMessages
      },
      { signal: requestController.signal }
    )
    const answer = response.choices?.[0]?.message?.content?.trim() || t('chat.emptyResponse')
    appendMessage('assistant', answer)
  } catch (error: any) {
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return
    errorMessage.value = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || t('chat.sendFailed')
  } finally {
    sending.value = false
    requestController = null
  }
}

function stopRequest() {
  requestController?.abort()
  sending.value = false
}

function clearMessages() {
  messages.value = []
  errorMessage.value = ''
}

onMounted(() => {
  void loadKeys()
})

onUnmounted(() => {
  requestController?.abort()
})
</script>
