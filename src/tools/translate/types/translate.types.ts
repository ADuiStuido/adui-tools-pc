/**
 * =========================
 * 百度图片翻译返回（最小可用结构）
 * =========================
 */
export interface BaiduPicTranslateRaw {
  data?: {
    content?: Array<{
      dst?: string
    }>
  }
  error_code?: number
  error_msg?: string
}

/**
 * =========================
 * 百度文档翻译 create 返回
 * =========================
 */
export interface BaiduDocCreateRaw {
  result?: {
    id?: string
  }
  error_code?: number
  error_msg?: string
}

/**
 * =========================
 * 百度文档翻译 query 返回
 * =========================
 */
export interface BaiduDocQueryRaw {
  result?: {
    status?: 'Running' | 'Succeeded' | 'Failed'
    output?: {
      files?: Array<{
        url?: string
        format?: string
      }>
    }
  }
  error_code?: number
  error_msg?: string
}
