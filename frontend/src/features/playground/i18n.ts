export const playgroundEnMessages = {
  nav: {
    chat: 'Chat',
    canvas: 'Canvas'
  },

  pages: {
    chat: {
      title: 'Chat',
      description: 'Choose one of your API keys and chat directly in the web UI.',
      selectKey: 'Select API key',
      modelPlaceholder: 'Model, for example gpt-4o-mini',
      loadingKeys: 'Loading API keys...',
      noKeysTitle: 'No API keys yet',
      noKeysDescription: 'Create an API key first, then return here to start chatting.',
      emptyTitle: 'Start a new conversation',
      emptyDescription: 'Messages are sent through the selected API key to /v1/chat/completions.',
      inputPlaceholder: 'Type a message. Enter sends, Shift + Enter adds a line.',
      clear: 'Clear',
      stop: 'Stop',
      send: 'Send',
      loadKeysFailed: 'Failed to load API keys',
      sendFailed: 'Failed to send message',
      emptyResponse: 'The API did not return a displayable response.'
    },

    canvas: {
      title: 'Canvas',
      description: 'Choose one of your API keys and generate images directly in the web UI.',
      selectKey: 'Select API key',
      modelPlaceholder: 'Model, for example gpt-image-1',
      promptLabel: 'Prompt',
      promptPlaceholder: 'Describe the image you want to generate...',
      sizeLabel: 'Size',
      countLabel: 'Count',
      loadingKeys: 'Loading API keys...',
      noKeysTitle: 'No API keys yet',
      noKeysDescription: 'Create an API key first, then return here to generate images.',
      emptyTitle: 'Describe a scene and generate images',
      emptyDescription: 'Canvas sends requests through the selected API key to /v1/images/generations.',
      generate: 'Generate',
      generating: 'Generating...',
      stop: 'Stop',
      loadKeysFailed: 'Failed to load API keys',
      generateFailed: 'Failed to generate image',
      emptyResponse: 'The API did not return a displayable image.'
    }
  }
} as const

export const playgroundZhMessages = {
  nav: {
    chat: '聊天',
    canvas: '画布'
  },

  pages: {
    chat: {
      title: '聊天',
      description: '选择已创建的 API 密钥，直接在网页中发起对话。',
      selectKey: '选择 API 密钥',
      modelPlaceholder: '模型，例如 gpt-4o-mini',
      loadingKeys: '正在加载 API 密钥...',
      noKeysTitle: '暂无 API 密钥',
      noKeysDescription: '请先创建 API 密钥，然后回到这里开始聊天。',
      emptyTitle: '开始一次新的对话',
      emptyDescription: '输入问题后将通过所选 API 密钥调用 /v1/chat/completions。',
      inputPlaceholder: '输入消息，按 Enter 发送，Shift + Enter 换行',
      clear: '清空',
      stop: '停止',
      send: '发送',
      loadKeysFailed: '加载 API 密钥失败',
      sendFailed: '发送消息失败',
      emptyResponse: '接口未返回可显示的回复。'
    },

    canvas: {
      title: '画布',
      description: '选择已创建的 API 密钥，直接在网页中生成图片。',
      selectKey: '选择 API 密钥',
      modelPlaceholder: '模型，例如 gpt-image-1',
      promptLabel: '提示词',
      promptPlaceholder: '描述你想生成的图片...',
      sizeLabel: '尺寸',
      countLabel: '张数',
      loadingKeys: '正在加载 API 密钥...',
      noKeysTitle: '暂无 API 密钥',
      noKeysDescription: '请先创建 API 密钥，然后回到这里生成图片。',
      emptyTitle: '描述画面，生成图片',
      emptyDescription: '画布会通过所选 API 密钥调用 /v1/images/generations。',
      generate: '生成图片',
      generating: '生成中...',
      stop: '停止',
      loadKeysFailed: '加载 API 密钥失败',
      generateFailed: '生成图片失败',
      emptyResponse: '接口未返回可显示的图片。'
    }
  }
} as const
