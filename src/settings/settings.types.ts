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

export const ProxyMode = {
  disable: 'disable',
  system: 'system',
  manual: 'manual',
} as const

export type ProxyMode = (typeof ProxyMode)[keyof typeof ProxyMode]

export const ProxyProtocol = {
  http: 'http',
  https: 'https',
  socks5: 'socks5',
} as const

export type ProxyProtocol = (typeof ProxyProtocol)[keyof typeof ProxyProtocol]

export type NetworkProxyForm = {
  mode: ProxyMode

  /** 手动代理配置（mode === manual 才使用） */
  protocol?: ProxyProtocol
  host?: string
  port?: number

  /** 认证 */
  username?: string
  password?: string

  /** 域名绕过 */
  noProxy?: string[]
}
