<template>
  <AppLayout>
    <div class="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-dark-950">
      <div class="border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-dark-800 dark:bg-dark-900/90 sm:px-6">
        <div class="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('canvas.title') }}</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-dark-400">{{ t('canvas.description') }}</p>
          </div>
          <div class="grid gap-2 sm:grid-cols-2 lg:w-[560px]">
            <Select
              :model-value="selectedKeyId"
              :options="keyOptions"
              :placeholder="t('canvas.selectKey')"
              @update:model-value="handleKeyChange"
            />
            <Select
              v-model="model"
              :options="modelOptions"
              :placeholder="t('canvas.selectModel')"
              :disabled="loadingModels || modelOptions.length === 0"
            />
          </div>
        </div>
      </div>

      <main class="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_1fr]">
        <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-800 dark:bg-dark-900">
          <label class="input-label">{{ t('canvas.promptLabel') }}</label>
          <textarea
            v-model="prompt"
            data-test="canvas-prompt"
            rows="9"
            class="input resize-none"
            :placeholder="t('canvas.promptPlaceholder')"
          />

          <div class="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label class="input-label">{{ t('canvas.sizeLabel') }}</label>
              <Select v-model="size" :options="sizeOptions" />
            </div>
            <div>
              <label class="input-label">{{ t('canvas.countLabel') }}</label>
              <input v-model.number="count" type="number" min="1" max="4" class="input" />
            </div>
          </div>

          <button data-test="canvas-generate" class="btn btn-primary mt-5 w-full" :disabled="!canGenerate" @click="generateImage">
            <Icon v-if="generating" name="refresh" size="sm" class="animate-spin" />
            <Icon v-else name="sparkles" size="sm" />
            {{ generating ? t('canvas.generating') : t('canvas.generate') }}
          </button>
          <button v-if="generating" class="btn btn-secondary mt-3 w-full" @click="stopRequest">
            <Icon name="x" size="sm" />
            {{ t('canvas.stop') }}
          </button>

          <div v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {{ errorMessage }}
          </div>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-800 dark:bg-dark-900 sm:p-6">
          <div v-if="loadingKeys" class="flex min-h-[520px] items-center justify-center text-sm text-gray-500 dark:text-dark-400">
            {{ t('canvas.loadingKeys') }}
          </div>
          <EmptyState
            v-else-if="apiKeys.length === 0"
            :title="t('canvas.noKeysTitle')"
            :description="t('canvas.noKeysDescription')"
          />
          <div v-else-if="images.length === 0" class="flex min-h-[520px] flex-col items-center justify-center text-center">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <Icon name="sparkles" size="lg" />
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('canvas.emptyTitle') }}</h2>
            <p class="mt-2 max-w-md text-sm text-gray-500 dark:text-dark-400">{{ t('canvas.emptyDescription') }}</p>
          </div>
          <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="image in images"
              :key="image.id"
              type="button"
              class="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 text-left transition hover:border-primary-300 dark:border-dark-700 dark:bg-dark-800"
              @click="previewImage = image.src"
            >
              <img :src="image.src" :alt="image.revisedPrompt || prompt" class="aspect-square w-full object-cover" />
              <div v-if="image.revisedPrompt" class="line-clamp-2 px-3 py-2 text-xs text-gray-500 dark:text-dark-400">
                {{ image.revisedPrompt }}
              </div>
            </button>
          </div>
        </section>
      </main>

      <div v-if="previewImage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" @click="previewImage = ''">
        <img :src="previewImage" alt="" class="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Select from '@/components/common/Select.vue'
import Icon from '@/components/icons/Icon.vue'
import keysAPI from '@/api/keys'
import userChannelsAPI, { type UserAvailableChannel } from '@/api/channels'
import playgroundAPI from '@/features/playground/api'
import { useAuthStore } from '@/stores/auth'
import type { ApiKey } from '@/types'
import { buildModelOptionsForKey } from '@/utils/playgroundModels'

interface GeneratedImage {
  id: string
  src: string
  revisedPrompt: string
}

const { t } = useI18n()
const authStore = useAuthStore()

const apiKeys = ref<ApiKey[]>([])
const availableChannels = ref<UserAvailableChannel[]>([])
const selectedKeyId = ref<number | null>(null)
const model = ref('')
const prompt = ref('')
const size = ref('1024x1024')
const count = ref(1)
const images = ref<GeneratedImage[]>([])
const previewImage = ref('')
const loadingKeys = ref(false)
const loadingModels = ref(false)
const generating = ref(false)
const errorMessage = ref('')
const storageReady = ref(false)
let requestController: AbortController | null = null

interface CanvasSnapshot {
  selectedKeyId?: number | null
  model?: string
  prompt?: string
  size?: string
  count?: number
  images?: GeneratedImage[]
}

const sizeOptions = computed(() => [
  { value: '1024x1024', label: '1024x1024' },
  { value: '1024x1536', label: '1024x1536' },
  { value: '1536x1024', label: '1536x1024' }
])

const keyOptions = computed(() =>
  apiKeys.value.map((key) => ({
    value: key.id,
    label: `${key.name}${key.status === 'active' ? '' : ` (${t(`keys.status.${key.status}`)})`}`
  }))
)

const selectedKey = computed(() => apiKeys.value.find((key) => key.id === selectedKeyId.value) || null)
const modelOptions = computed(() => buildModelOptionsForKey(selectedKey.value, availableChannels.value))
const canGenerate = computed(() => !!selectedKey.value && prompt.value.trim().length > 0 && model.value.trim().length > 0 && modelOptions.value.length > 0 && !generating.value)
const storageKey = computed(() => `sub2api:playground:canvas:user:${authStore.user?.id ?? 'anonymous'}`)

function handleKeyChange(value: string | number | boolean | null) {
  selectedKeyId.value = typeof value === 'number' ? value : Number(value) || null
  syncModelSelection()
}

function readSnapshot(): CanvasSnapshot | null {
  try {
    const raw = window.localStorage.getItem(storageKey.value)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CanvasSnapshot
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function persistSnapshot() {
  if (!storageReady.value) return
  try {
    window.localStorage.setItem(storageKey.value, JSON.stringify({
      selectedKeyId: selectedKeyId.value,
      model: model.value,
      prompt: prompt.value,
      size: size.value,
      count: count.value,
      images: images.value
    }))
  } catch {
    // localStorage can be unavailable in private browsing or quota-limited environments.
  }
}

function restoreImages(snapshot: CanvasSnapshot | null) {
  if (!Array.isArray(snapshot?.images)) return
  images.value = snapshot.images
    .filter((image): image is GeneratedImage =>
      !!image
      && typeof image.id === 'string'
      && typeof image.src === 'string'
      && typeof image.revisedPrompt === 'string'
    )
}

function restoreSelection(snapshot: CanvasSnapshot | null, keys: ApiKey[]) {
  const savedKeyID = typeof snapshot?.selectedKeyId === 'number' ? snapshot.selectedKeyId : null
  const savedKey = savedKeyID != null ? keys.find((key) => key.id === savedKeyID) : null
  const activeKey = keys.find((key) => key.status === 'active') || keys[0]
  selectedKeyId.value = (savedKey || activeKey)?.id ?? null
  model.value = typeof snapshot?.model === 'string' ? snapshot.model : ''
  syncModelSelection()
}

function restorePromptSettings(snapshot: CanvasSnapshot | null) {
  if (typeof snapshot?.prompt === 'string') prompt.value = snapshot.prompt
  if (typeof snapshot?.size === 'string') size.value = snapshot.size
  if (typeof snapshot?.count === 'number') count.value = Math.min(Math.max(snapshot.count, 1), 4)
}

function syncModelSelection() {
  const options = modelOptions.value
  if (options.length === 0) {
    model.value = ''
    return
  }
  if (!options.some((option) => option.value === model.value)) {
    model.value = options[0].value
  }
}

async function loadInitialData() {
  loadingKeys.value = true
  loadingModels.value = true
  errorMessage.value = ''
  try {
    const [response, channels] = await Promise.all([
      keysAPI.list(1, 100, { sort_by: 'created_at', sort_order: 'desc' }),
      userChannelsAPI.getAvailable()
    ])
    apiKeys.value = response.items
    availableChannels.value = channels
    const snapshot = readSnapshot()
    restoreImages(snapshot)
    restorePromptSettings(snapshot)
    restoreSelection(snapshot, response.items)
    storageReady.value = true
    persistSnapshot()
  } catch (error: any) {
    errorMessage.value = error?.message || t('canvas.loadKeysFailed')
  } finally {
    loadingKeys.value = false
    loadingModels.value = false
  }
}

async function generateImage() {
  if (!canGenerate.value || !selectedKey.value) return
  errorMessage.value = ''
  requestController = new AbortController()
  generating.value = true
  try {
    const response = await playgroundAPI.createImageGeneration(
      selectedKey.value.key,
      {
        model: model.value.trim(),
        prompt: prompt.value.trim(),
        size: size.value,
        n: Math.min(Math.max(Number(count.value) || 1, 1), 4)
      },
      { signal: requestController.signal }
    )
    images.value = (response.data || []).map((item) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      src: item.url || `data:image/png;base64,${item.b64_json || ''}`,
      revisedPrompt: item.revised_prompt || ''
    })).filter((item) => item.src && !item.src.endsWith(','))
    persistSnapshot()
    if (images.value.length === 0) {
      errorMessage.value = t('canvas.emptyResponse')
    }
  } catch (error: any) {
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return
    errorMessage.value = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || t('canvas.generateFailed')
  } finally {
    generating.value = false
    requestController = null
  }
}

function stopRequest() {
  requestController?.abort()
  generating.value = false
}

onMounted(() => {
  void loadInitialData()
})

onUnmounted(() => {
  requestController?.abort()
})

watch([selectedKeyId, model, prompt, size, count, images], persistSnapshot, { deep: true })
</script>
