import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui'

type Discrete = ReturnType<typeof createDiscreteApi> & {
  message: ReturnType<typeof createDiscreteApi>['message']
  dialog: ReturnType<typeof createDiscreteApi>['dialog']
  notification: ReturnType<typeof createDiscreteApi>['notification']
  loadingBar: ReturnType<typeof createDiscreteApi>['loadingBar']
}

let discrete: Discrete | null = null

/**
 * 初始化离散 API（可重复调用，后调用会覆盖配置）
 * 建议在 main.ts 中调用一次
 */
export function initDiscreteApi(options?: { theme?: 'light' | 'dark' }): Discrete {
  const config: ConfigProviderProps = {
    theme: options?.theme === 'dark' ? darkTheme : lightTheme,
  }

  // 你需要哪些就写哪些
  discrete = createDiscreteApi(['message', 'dialog', 'notification', 'loadingBar'], {
    configProviderProps: config,
  }) as Discrete

  return discrete
}

/** 获取离散 API（未 init 时自动用默认配置初始化一次） */
export function ui(): Discrete {
  if (!discrete) discrete = initDiscreteApi()
  return discrete
}

// 便捷导出：在任何 ts 文件直接用 message/dialog/notification/loadingBar
export const message = {
  success: (content: string) => ui().message.success(content),
  error: (content: string) => ui().message.error(content),
  info: (content: string) => ui().message.info(content),
  warning: (content: string) => ui().message.warning(content),
  loading: (content: string) => ui().message.loading(content),
}

export const dialog = () => ui().dialog
export const notification = () => ui().notification
export const loadingBar = () => ui().loadingBar
