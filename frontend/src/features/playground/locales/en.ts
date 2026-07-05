export default {
  nav: {
    chat: 'Chat',
    canvas: 'Canvas'
  },

  chat: {
    title: 'Chat',
    description: 'Choose one of your API keys and chat directly in the web UI.',
    selectKey: 'Select API key',
    selectModel: 'Select model',
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
    selectModel: 'Select model',
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
  },
}
