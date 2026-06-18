import axios from 'axios'

export interface PlaygroundChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionChoice {
  message?: {
    role?: string
    content?: string | null
  }
}

export interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[]
}

export interface ImageGenerationItem {
  url?: string
  b64_json?: string
  revised_prompt?: string
}

export interface ImageGenerationResponse {
  data?: ImageGenerationItem[]
}

const gatewayClient = axios.create({
  baseURL: '',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export async function createChatCompletion(
  apiKey: string,
  payload: {
    model: string
    messages: PlaygroundChatMessage[]
  },
  options?: { signal?: AbortSignal }
): Promise<ChatCompletionResponse> {
  const { data } = await gatewayClient.post<ChatCompletionResponse>('/v1/chat/completions', payload, {
    signal: options?.signal,
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })
  return data
}

export async function createImageGeneration(
  apiKey: string,
  payload: {
    model: string
    prompt: string
    size: string
    n: number
  },
  options?: { signal?: AbortSignal }
): Promise<ImageGenerationResponse> {
  const { data } = await gatewayClient.post<ImageGenerationResponse>('/v1/images/generations', payload, {
    signal: options?.signal,
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })
  return data
}

export const playgroundAPI = {
  createChatCompletion,
  createImageGeneration
}

export default playgroundAPI
