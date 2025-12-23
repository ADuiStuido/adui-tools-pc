export type ApiKeysForm = {
  translation: {
    baidu: {
      appId: string
      appSecret: string
    }
    youdao: {
      appId: string
      appSecret: string
    }
    deepl: {
      apiKey: string
      endpoint?: string
    }
  }
  ai: {
    openai: {
      apiKey: string
    }
    deepseek: {
      apiKey: string
    }
    qwen: {
      apiKey: string
    }
    doubao: {
      apiKey: string
    }
    wenxin: {
      apiKey: string
    }
    yuanbao: {
      apiKey: string
    }
  }
}
