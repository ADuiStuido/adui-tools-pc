import type { RouteRecordRaw } from 'vue-router'

/**
 * 工具唯一标识
 *
 * - 在整个应用内必须唯一
 * - 一旦发布后不建议随意修改（会影响路由、存储、设置等）
 * - 推荐使用 kebab-case，例如：`ai-chat`、`json`
 */
export type ToolId = string

/**
 * 工具的基础元信息
 *
 * 仅用于：
 * - 菜单展示
 * - 排序
 * - 搜索
 *
 * ❗ 不应在此处放业务逻辑相关字段
 */
export interface ToolMeta {
  /** 工具唯一 ID */
  id: ToolId

  /** 工具显示名称 */
  name: string

  /**
   * 工具图标
   *
   * - 可以是 icon key
   * - 也可以是组件名
   * - 具体解析方式由 App Shell 决定
   */
  icon?: string

  /**
   * 工具在侧边栏中的排序权重
   *
   * - 数值越小越靠前
   * - 未设置时由注册顺序决定
   */
  order?: number

  /**
   * 搜索关键字
   *
   * - 用于工具搜索 / 快速跳转
   * - 不参与业务逻辑
   */
  keywords?: string[]
}

/**
 * 工具插件接口（Tool Plugin Contract）
 *
 * 每一个工具都必须实现该接口，并通过 Tool Registry 注册。
 *
 * 设计目标：
 * - 工具即插件
 * - 工具之间完全解耦
 * - 工具不能直接访问底层能力（DB / HTTP / 设置）
 */
export interface ToolPlugin {
  /**
   * 工具的基础描述信息
   */
  meta: ToolMeta

  /**
   * 返回该工具的路由配置
   *
   * - 所有工具路由会被统一挂载到 `/tools/*` 下
   * - 工具只需要关心自己的子路由
   * - 不允许在工具中注册全局路由
   */
  routes: () => RouteRecordRaw[]

  /**
   * 是否启用该工具
   *
   * - 用于按配置、权限、环境控制工具是否可用
   * - 常见场景：
   *   - 未配置 API Key 时禁用 AI 工具
   *   - 实验性工具默认关闭
   *
   * @param ctx 工具运行时上下文
   */
  enabled?: (ctx: ToolRuntimeContext) => boolean

  /**
   * 工具初始化钩子
   *
   * - 在工具被注册后、首次使用前调用
   * - 可用于：
   *   - 读取历史数据
   *   - 注册快捷键
   *   - 初始化状态
   *
   * ❗ 不建议在此执行重 IO 操作
   */
  setup?: (ctx: ToolRuntimeContext) => Promise<void> | void
}

/**
 * 工具运行时上下文（Tool Runtime Context）
 *
 * 这是工具与「应用核心能力」之间的唯一桥梁：
 *
 * - 工具 ❌ 不能直接访问：
 *   - SQLite
 *   - localStorage
 *   - fetch / axios
 *   - 全局 settings
 *
 * - 工具 ✅ 只能通过该上下文获取能力
 *
 * 这样设计的好处：
 * - 强制解耦
 * - 便于测试
 * - 便于后续插件化 / 沙箱化
 */
export interface ToolRuntimeContext {
  /**
   * 应用设置读写接口
   *
   * - 所有设置均通过 key-value 形式存储
   * - value 通常为 JSON 可序列化对象
   * - 工具不关心设置的存储方式（SQLite / 文件等）
   */
  settings: {
    /**
     * 获取设置值
     *
     * @param key 设置 key（推荐使用命名空间，例如：`ai.chatgpt.apiKey`）
     */
    get<T = unknown>(key: string): Promise<T | null>

    /**
     * 写入设置值
     *
     * @param key 设置 key
     * @param value 设置值
     */
    set<T = unknown>(key: string, value: T): Promise<void>
  }

  /**
   * 本地存储访问接口（业务级）
   *
   * - 不暴露 SQL
   * - 不暴露表结构
   * - 所有存储操作由核心层统一管理
   */
  storage: {
    /**
     * 会话相关存储
     *
     * - 常用于 AI 对话、翻译历史等
     * - 具体数据结构由使用方自行定义
     */
    conversations: {
      /**
       * 获取会话列表
       *
       * @returns 会话列表，具体结构由调用方定义
       */
      list<T = unknown>(): Promise<T[]>

      /**
       * 创建新会话
       *
       * @param payload 会话创建参数
       * @returns 新创建会话的 ID
       */
      create<TInput = unknown>(payload: TInput): Promise<string>
    }
  }

  /**
   * 网络请求接口
   *
   * - 所有请求统一经过该接口
   * - 自动处理：
   *   - 代理配置
   *   - 错误包装
   *   - 认证信息
   */
  net: {
    /**
     * 发起网络请求
     *
     * @param req 请求描述（具体结构由核心层定义）
     * @returns 响应数据
     */
    request<TResponse = unknown, TRequest = unknown>(req: TRequest): Promise<TResponse>
  }

  /**
   * 日志接口
   *
   * - 用于调试与错误追踪
   * - 具体输出方式由核心层决定（console / 文件 / devtools）
   */
  log: {
    /**
     * 记录普通信息日志
     */
    info(message: string, data?: unknown): void

    /**
     * 记录错误日志
     */
    error(message: string, error?: unknown): void
  }
}
