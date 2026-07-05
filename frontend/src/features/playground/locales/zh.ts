export default {
  nav: {
    chat: '聊天',
    canvas: '画布'
  },

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
  },
}
