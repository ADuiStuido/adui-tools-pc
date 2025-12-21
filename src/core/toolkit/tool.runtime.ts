/**
 * Tool Runtime（工具运行时）实现文件
 *
 * 本文件的职责：
 * 1) 生成 ToolRuntimeContext（给工具/插件使用的“唯一能力入口”）
 * 2) 统一封装 settings / storage / net / log 等能力
 * 3) 强制工具层与底层实现解耦（工具不允许直接 import DB/HTTP/Settings 实现）
 *
 * ✅ 正确用法：工具内部只使用 ctx.settings / ctx.storage / ctx.net / ctx.log
 * ❌ 禁止用法：工具内部直接 import invoke、sqlite、axios、localStorage 等
 *
 * 备注：
 * - 这里给的是“可落地的标准实现模板”
 * - 你可以把底层实现（Tauri commands / Rust / HTTP）替换掉，但 ToolRuntimeContext 不变
 */

import type { ToolRuntimeContext } from './tool.types'

/**
 * ----------------------------
 * 1) 依赖注入：Runtime 需要的底层能力
 * ----------------------------
 *
 * ToolRuntimeContext 的目标是“稳定的插件协议”，而这些依赖是“可替换的底层实现”。
 * 通过注入依赖（deps），你可以轻松实现：
 * - 真实环境：走 Tauri command（Rust / SQLite / Proxy）
 * - 单元测试：注入 mock（内存版 settings/storage/net）
 * - 调试环境：注入 console 日志 / 本地假数据
 */

/**
 * 设置服务（底层实现接口）
 *
 * - 你可以用：SQLite / 文件 / Tauri secure storage 等实现
 * - 这里只规定“能力接口”，不规定实现细节
 */
export interface SettingsService {
  /** 获取指定 key 的设置值（建议以 JSON 形式存储） */
  get<T = unknown>(key: string): Promise<T | null>

  /** 设置指定 key 的值 */
  set<T = unknown>(key: string, value: T): Promise<void>
}

/**
 * 会话存储服务（底层实现接口）
 *
 * - 这里以 conversations 为例，你后续可以继续扩展：
 *   - messages
 *   - tool_histories
 *   - prompt_templates
 *   - etc...
 * - 同样：只规定能力接口，不暴露 SQL
 */
export interface ConversationsRepository {
  list<T = unknown>(): Promise<T[]>
  create<TInput = unknown>(payload: TInput): Promise<string>
}

/**
 * StorageService（底层实现接口）
 *
 * - 把所有 repository 聚合起来
 * - 方便未来扩展更多表/业务域
 */
export interface StorageService {
  conversations: ConversationsRepository
}

/**
 * 统一网络请求服务（底层实现接口）
 *
 * - 你可以把它实现为：
 *   - 前端 fetch + 代理（如果你在前端处理）
 *   - tauri command：由 Rust 处理代理/证书/超时（推荐）
 * - req 的结构不在协议层强绑定，使用泛型保证可扩展
 */
export interface NetService {
  request<TResponse = unknown, TRequest = unknown>(req: TRequest): Promise<TResponse>
}

/**
 * 日志服务（底层实现接口）
 *
 * - 可以简单用 console
 * - 也可以对接你自己的 logger（写文件/调试面板）
 */
export interface Logger {
  info(message: string, data?: unknown): void
  error(message: string, error?: unknown): void
}

/**
 * Runtime 依赖集合（创建 ToolRuntimeContext 的必要注入）
 */
export interface ToolRuntimeDeps {
  settings: SettingsService
  storage: StorageService
  net: NetService
  log: Logger
}

/**
 * ----------------------------
 * 2) 创建工具运行时上下文：createToolRuntimeContext
 * ----------------------------
 *
 * 这是核心工厂函数：
 * - 输入：底层实现 deps
 * - 输出：稳定的 ToolRuntimeContext（插件协议）
 *
 * 设计原则：
 * - ctx 对工具来说是“只读能力入口”
 * - ctx 内部可以做：
 *   - 统一错误包装
 *   - 统一日志
 *   - 统一 key 命名规范（可选）
 *   - 统一数据校验（可选）
 */
export function createToolRuntimeContext(deps: ToolRuntimeDeps): ToolRuntimeContext {
  /**
   * 统一包装 settings.get
   *
   * - 在这里你可以加：
   *   - key 规范检查
   *   - 默认值策略
   *   - 读取日志（开发环境）
   */
  const settings: ToolRuntimeContext['settings'] = {
    async get<T = unknown>(key: string): Promise<T | null> {
      try {
        return await deps.settings.get<T>(key)
      } catch (err) {
        // 在协议层统一捕获，避免错误穿透到工具导致崩溃
        deps.log.error(`[settings.get] 读取失败: ${key}`, err)
        return null
      }
    },

    async set<T = unknown>(key: string, value: T): Promise<void> {
      try {
        await deps.settings.set<T>(key, value)
      } catch (err) {
        deps.log.error(`[settings.set] 写入失败: ${key}`, err)
        // 对于 set，建议抛出，让工具 UI 能反馈“保存失败”
        throw err
      }
    },
  }

  /**
   * 统一包装 storage
   *
   * - 这里示例只提供 conversations
   * - 你可以按域继续扩展：messages / histories / prompts
   * - 同样可以在这里做：
   *   - 参数校验
   *   - 统一异常处理
   *   - 性能统计（可选）
   */
  const storage: ToolRuntimeContext['storage'] = {
    conversations: {
      async list<T = unknown>(): Promise<T[]> {
        try {
          return await deps.storage.conversations.list<T>()
        } catch (err) {
          deps.log.error('[storage.conversations.list] 读取失败', err)
          // list 失败一般给空数组，让工具可正常渲染空态
          return []
        }
      },

      async create<TInput = unknown>(payload: TInput): Promise<string> {
        try {
          return await deps.storage.conversations.create<TInput>(payload)
        } catch (err) {
          deps.log.error('[storage.conversations.create] 创建失败', err)
          // create 失败一般要抛出，让上层能提示用户
          throw err
        }
      },
    },
  }

  /**
   * 统一包装 net.request
   *
   * - 最重要的价值是：工具层统一入口
   * - 代理、鉴权、超时、baseUrl 这些都由底层实现决定
   * - 在这里你可以做：
   *   - 统一错误结构（建议后续加 AppError）
   *   - 统一重试策略（可选）
   *   - 请求日志（开发环境）
   */
  const net: ToolRuntimeContext['net'] = {
    async request<TResponse = unknown, TRequest = unknown>(req: TRequest): Promise<TResponse> {
      try {
        return await deps.net.request<TResponse, TRequest>(req)
      } catch (err) {
        deps.log.error('[net.request] 请求失败', err)
        throw err
      }
    },
  }

  /**
   * 日志：直接透传即可
   *
   * - 如果你希望每条日志都带上 toolId，可以在这里做“带前缀的 logger”
   * - 例如：createToolRuntimeContextForTool(toolId, deps)
   */
  const log: ToolRuntimeContext['log'] = {
    info: (message, data) => deps.log.info(message, data),
    error: (message, error) => deps.log.error(message, error),
  }

  /**
   * 返回稳定的 ToolRuntimeContext
   *
   * 注意：
   * - 这里返回的对象就是“插件协议的运行时实现”
   * - 工具拿到 ctx 后，不应也不需要知道 deps 的存在
   */
  return {
    settings,
    storage,
    net,
    log,
  }
}

/**
 * ----------------------------
 * 3) 可选增强：为指定 toolId 创建带前缀的 ctx
 * ----------------------------
 *
 * 如果你希望日志里自动带上工具 ID，推荐用这个工厂函数：
 * - 工具无需手动加前缀
 * - 排查问题时更清晰
 *
 * 用法：
 *   const ctx = createToolRuntimeContextForTool('ai-chat', deps)
 */
export function createToolRuntimeContextForTool(
  toolId: string,
  deps: ToolRuntimeDeps,
): ToolRuntimeContext {
  const prefixedLogger: Logger = {
    info(message, data) {
      deps.log.info(`[${toolId}] ${message}`, data)
    },
    error(message, error) {
      deps.log.error(`[${toolId}] ${message}`, error)
    },
  }

  return createToolRuntimeContext({
    ...deps,
    log: prefixedLogger,
  })
}
