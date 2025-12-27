import { invoke } from '@tauri-apps/api/core'

type InvokePayload = Record<string, unknown>

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

export async function invokeCmd<T>(cmd: string, payload?: InvokePayload): Promise<T> {
  try {
    return await invoke<T>(cmd, payload)
  } catch (e: unknown) {
    // 后端 AppError serialize => { message: string }
    const msg = isRecord(e) && typeof e.message === 'string' ? e.message : '未知错误'
    throw new Error(msg)
  }
}
