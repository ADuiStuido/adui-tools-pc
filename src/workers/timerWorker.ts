/// <reference lib="webworker" />

type WorkerCommand = 'start' | 'stop' | 'reset'

interface WorkerMessage {
  type: WorkerCommand
  interval?: number
  payload?: unknown
}

interface WorkerTickMessage {
  type: 'tick'
  payload?: unknown
  timestamp: number
}

let timer: number | null = null

const ctx: DedicatedWorkerGlobalScope = self as never

ctx.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, interval = 1000, payload } = e.data

  switch (type) {
    case 'start':
      if (timer === null) {
        timer = self.setInterval(() => {
          const message: WorkerTickMessage = {
            type: 'tick',
            payload,
            timestamp: Date.now(),
          }
          ctx.postMessage(message)
        }, interval)
      }
      break

    case 'stop':
      if (timer !== null) {
        self.clearInterval(timer)
        timer = null
      }
      break

    case 'reset':
      if (timer !== null) {
        self.clearInterval(timer)
      }
      timer = self.setInterval(() => {
        const message: WorkerTickMessage = {
          type: 'tick',
          payload,
          timestamp: Date.now(),
        }
        ctx.postMessage(message)
      }, interval)
      break

    default:
      // TS 能保证走不到这里，但留着更安全
      console.error('Unknown command:', type)
  }
}
