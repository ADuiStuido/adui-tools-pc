<script setup lang="ts">
import { HelpCircleOutline, Close, CopyOutline } from '@vicons/ionicons5'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { useClipboardItems } from '@vueuse/core'
import type {
  BaiduPicTranslateRaw,
  TranslateLangPair,
} from '@/tools/translate/types/translate.types.ts'
import { invokeCmd } from '@/utils/tauri'
import SvgIcon from '@/ui/SvgIcon.vue'
import type { BaiduMtLangCode } from '@/tools/translate/types/language.types.ts'

const message = useMessage()

/** ========== UI 状态 ========== */
const props = defineProps<TranslateLangPair>()
const modalShow = ref<boolean>(false)
const imageTranslating = ref<boolean>(false)

const imagePreviewUrl = ref<string | null>(null) // 左侧原图
const pastedPreviewUrl = ref<string | null>(null) // 右侧展示图（paste=2 下复用原图 url）

/** ========== Clipboard（必须用 useClipboardItems） ========== */
const { copy: copyItems, isSupported: clipboardSupported } = useClipboardItems()

function toClipboardItems(text: string): ClipboardItem[] {
  const mime = 'text/plain'
  const blob = new Blob([text], { type: mime })
  return [new ClipboardItem({ [mime]: blob })]
}

async function copyText(text: string): Promise<void> {
  const t = text.trim()
  if (!t) return
  if (!clipboardSupported.value) {
    message.error('当前环境不支持 Clipboard API')
    return
  }
  try {
    await copyItems(toClipboardItems(t))
    message.success('已复制')
  } catch (e) {
    message.error((e as Error).message)
  }
}

/** ========== 百度返回（只用必要字段：content + pasteImg（块区）） ========== */
type Point = { x: number; y: number }

type ContentItem = {
  src?: string
  dst?: string
  rect?: string // "left top wide high"
  points?: Point[] // 4 points
  pasteImg?: string // paste=2：块区贴合 base64（这里暂不拼贴整图）
}

type PicTranslateData = {
  from?: string
  to?: string
  sumSrc?: string
  sumDst?: string
  content?: ContentItem[]
  pasteImg?: string // paste=1 才有；paste=2 不依赖
}

type PicTranslateResult = { raw: BaiduPicTranslateRaw }

const result = ref<PicTranslateData | null>(null)

const sumSrc = computed<string>(() => result.value?.sumSrc ?? '')
const sumDst = computed<string>(() => {
  if (result.value?.sumDst) return result.value.sumDst
  const lines = result.value?.content ?? []
  const dsts = lines
    .map((x) => (x.dst ?? '').trim())
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
  return dsts.join('\n')
})

/** ========== File / URL helpers ========== */
async function fileToBytes(file: File): Promise<number[]> {
  const buf = await file.arrayBuffer()
  return Array.from(new Uint8Array(buf))
}

function cleanupPreviewUrls() {
  const left = imagePreviewUrl.value
  const right = pastedPreviewUrl.value

  // ⚠️ paste=2 下我们让左右可能复用同一个 objectURL，避免 revoke 两次
  if (left && right && left === right) {
    URL.revokeObjectURL(left)
  } else {
    if (left) URL.revokeObjectURL(left)
    if (right) URL.revokeObjectURL(right)
  }

  imagePreviewUrl.value = null
  pastedPreviewUrl.value = null
}

function handleReupload() {
  cleanupPreviewUrls()
  result.value = null
}

function inferMime(fileMime: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const m = fileMime.toLowerCase()
  if (m === 'image/png') return 'image/png'
  if (m === 'image/webp') return 'image/webp'
  return 'image/jpeg'
}

/** ========== 右侧：图片 contain 布局计算（用于浮层坐标换算） ========== */
type Layout = { scale: number; offsetX: number; offsetY: number }

const pastedWrapEl = ref<HTMLDivElement | null>(null)
const pastedImgEl = ref<HTMLImageElement | null>(null)

const naturalSize = ref<{ w: number; h: number } | null>(null)
const layout = ref<Layout | null>(null)

function computeContainLayout() {
  const wrap = pastedWrapEl.value
  const nat = naturalSize.value
  if (!wrap || !nat) return

  const cw = wrap.clientWidth
  const ch = wrap.clientHeight
  if (cw <= 0 || ch <= 0) return

  const scale = Math.min(cw / nat.w, ch / nat.h)
  const renderW = nat.w * scale
  const renderH = nat.h * scale
  const offsetX = (cw - renderW) / 2
  const offsetY = (ch - renderH) / 2

  layout.value = { scale, offsetX, offsetY }
}

function onPastedImgLoad() {
  const img = pastedImgEl.value
  if (!img) return
  naturalSize.value = { w: img.naturalWidth, h: img.naturalHeight }
  computeContainLayout()
}

let ro: ResizeObserver | null = null
onMounted(() => {
  if (pastedWrapEl.value) {
    ro = new ResizeObserver(() => computeContainLayout())
    ro.observe(pastedWrapEl.value)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  cleanupPreviewUrls()
})

/** ========== 浮层文本块计算（points 优先，其次 rect） ========== */
type OverlayBox = {
  text: string
  left: number
  top: number
  width: number
  height: number
}

const overlayBoxes = computed<OverlayBox[]>(() => {
  const data = result.value
  if (!data?.content) return []

  return data.content
    .map((it): OverlayBox | null => {
      const text = (it.dst ?? '').trim()
      if (!text) return null

      if (it.points && it.points.length >= 4) {
        const xs = it.points.map((p) => p.x)
        const ys = it.points.map((p) => p.y)
        const left = Math.min(...xs)
        const top = Math.min(...ys)
        const right = Math.max(...xs)
        const bottom = Math.max(...ys)
        const width = right - left
        const height = bottom - top
        if (!Number.isFinite(width) || !Number.isFinite(height)) return null
        return { text, left, top, width, height }
      }

      if (it.rect) {
        const parts = it.rect.split(/\s+/).map((n) => Number(n))
        if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
          const [left, top, width, height] = parts
          return { text, left, top, width, height }
        }
      }

      return null
    })
    .filter((x): x is OverlayBox => x !== null)
})

/** ========== 上传并翻译（paste 固定为 2） ========== */
type PicTranslateInvokePayload = {
  image: number[]
  mime: 'image/jpeg' | 'image/png' | 'image/webp'
  from: BaiduMtLangCode
  to: BaiduMtLangCode
  paste: 2
  v: 3
}

async function handleImageRequest(options: UploadCustomRequestOptions) {
  const { file, onFinish, onError } = options
  const f = file.file
  if (!f) {
    onError?.()
    return
  }

  // 文档要求：jpg/png/webp ≤ 4MB
  const MAX = 4 * 1024 * 1024
  if (f.size > MAX) {
    message.error('文件大小不能超过 4MB')
    onError?.()
    return
  }

  const mime = inferMime(f.type || 'image/jpeg')
  const allowed: ReadonlyArray<string> = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(mime)) {
    message.error('仅支持 jpg/png/webp 格式')
    onError?.()
    return
  }

  cleanupPreviewUrls()
  result.value = null

  // ✅ 生成一次 objectURL，左右复用（DOM 不变前提下让右侧也有图可显示）
  const previewUrl = URL.createObjectURL(f)
  imagePreviewUrl.value = previewUrl
  pastedPreviewUrl.value = previewUrl

  imageTranslating.value = true
  try {
    const bytes = await fileToBytes(f)

    const payload: PicTranslateInvokePayload = {
      image: bytes,
      mime,
      from: props.from,
      to: props.to,
      paste: 2,
      v: 3,
    }

    const res = await invokeCmd<PicTranslateResult>('baidu_pic_translate', { payload })

    // 以最小假设读取字段（避免 any）
    const raw = res.raw as unknown as {
      error_code?: number | string
      error_msg?: string
      data?: PicTranslateData
    }

    const ecNum =
      typeof raw.error_code === 'string' ? Number(raw.error_code) : (raw.error_code ?? -1)

    if (ecNum !== 0) {
      throw new Error(raw.error_msg || `图片翻译失败（error_code=${String(raw.error_code)}）`)
    }

    const data = raw.data ?? null
    if (!data) throw new Error('翻译失败：返回 data 为空')

    // paste=2 主要依赖 content（含 dst / points / rect）
    result.value = data

    message.success('图片翻译完成')
    onFinish?.()
  } catch (e) {
    message.error((e as Error).message)
    onError?.()
  } finally {
    imageTranslating.value = false
  }
}
</script>

<template>
  <div class="w-full h-full">
    <n-split direction="horizontal" class="h-full" :max="0.75" :min="0.25">
      <template #1>
        <div class="w-full h-full pr-20px">
          <n-upload
            v-if="!imagePreviewUrl"
            accept="image/*"
            style="height: 100%"
            trigger-style="height: 100%"
            :max="1"
            :show-file-list="false"
            :custom-request="handleImageRequest"
            :disabled="imageTranslating"
          >
            <n-upload-dragger class="h-full">
              <div class="h-full flex flex-col justify-center items-center gap-10px">
                <n-icon size="40">
                  <svg-icon name="file-img" />
                </n-icon>
                <n-text class="text-16px" depth="3"> 截图粘贴/拖拽/点击上传图片 </n-text>

                <div class="flex items-center gap-10px">
                  <n-text class="text-14px" depth="3"> 文件大小不超过10MB </n-text>
                  <n-divider vertical />
                  <n-button text @click.stop="modalShow = true">
                    <template #icon>
                      <n-icon size="20"><HelpCircleOutline /></n-icon>
                    </template>
                    格式说明
                  </n-button>
                </div>

                <n-spin v-if="imageTranslating" size="small" />
              </div>
            </n-upload-dragger>
          </n-upload>
          <div v-else class="image-preview w-full h-full relative">
            <img
              :src="imagePreviewUrl"
              class="max-w-full max-h-full rounded-6px shadow"
              alt="原图预览"
            />
            <div class="absolute bottom-10px right-10px flex gap-8px">
              <n-button size="small" secondary @click="handleReupload"> 重新上传 </n-button>
            </div>
          </div>
        </div>
      </template>

      <template #2>
        <div class="w-full h-full ml-20px flex flex-col gap-12px">
          <div ref="pastedWrapEl" class="pasted-wrap w-full grow relative">
            <template v-if="pastedPreviewUrl">
              <img
                ref="pastedImgEl"
                :src="pastedPreviewUrl"
                class="pasted-img rounded-6px shadow"
                alt="整图贴合预览"
                @load="onPastedImgLoad"
              />

              <!-- 浮层：文字可选中复制；双击某段直接复制（useClipboardItems） -->
              <div v-if="layout" class="overlay-layer absolute inset-0">
                <div
                  v-for="(b, idx) in overlayBoxes"
                  :key="idx"
                  class="overlay-text"
                  :style="{
                    left: layout.offsetX + b.left * layout.scale + 'px',
                    top: layout.offsetY + b.top * layout.scale + 'px',
                    width: Math.max(1, b.width * layout.scale) + 'px',
                    height: Math.max(1, b.height * layout.scale) + 'px',
                  }"
                  :title="b.text"
                  @dblclick="copyText(b.text)"
                >
                  {{ b.text }}
                </div>
              </div>

              <!-- 右下角：一键复制全文 / 原文 -->
              <div class="absolute bottom-10px right-10px flex gap-8px">
                <n-button size="small" secondary :disabled="!sumDst" @click="copyText(sumDst)">
                  <template #icon>
                    <n-icon size="16"><CopyOutline /></n-icon>
                  </template>
                  复制全文
                </n-button>
                <n-button size="small" secondary :disabled="!sumSrc" @click="copyText(sumSrc)">
                  <template #icon>
                    <n-icon size="16"><CopyOutline /></n-icon>
                  </template>
                  复制原文
                </n-button>
              </div>

              <!-- 顶部小提示：已复制（可选） -->
            </template>
          </div>
        </div>
      </template>
    </n-split>

    <n-modal v-model:show="modalShow">
      <n-card style="width: 400px" size="small" :bordered="false" role="dialog" aria-modal="true">
        <template #header> 支持格式说明 </template>
        <template #header-extra>
          <n-icon size="20" @click="modalShow = false" class="cursor-pointer select-none">
            <Close />
          </n-icon>
        </template>
        <table class="desc-table">
          <tbody>
            <tr>
              <td class="label">
                <div class="border-l-emerald">图片翻译：</div>
              </td>
              <td class="content">仅支持 jpg / png / webp，文件大小不超过 4MB</td>
            </tr>
            <tr>
              <td class="label">
                <div class="border-l-emerald">复制：</div>
              </td>
              <td class="content">浮在图上的文字可框选复制；双击某段可复制该段</td>
            </tr>
          </tbody>
        </table>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped lang="less">
/* 预览容器 */
.image-preview {
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-preview img {
  object-fit: contain;
}

/* 右侧容器（DOM 不变：仍叫 pasted-wrap） */
.pasted-wrap {
  background: #fafafa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.pasted-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

/* 覆盖层：整体不挡，但单块文字可交互选中 */
.overlay-layer {
  pointer-events: none;
}
.overlay-text {
  position: absolute;
  pointer-events: auto;
  user-select: text;
  cursor: text;

  padding: 2px 4px;
  line-height: 1.3;
  font-size: 16px;

  background: rgba(255, 255, 255, 0.55);
  border-radius: 6px;

  white-space: pre-wrap;
  word-break: break-word;
}

.copied-tip {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  pointer-events: none;
}

/* 弹窗表格 */
.desc-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  font-size: 14px;
  color: #333;
}
.desc-table td {
  vertical-align: top;
}
.desc-table .label {
  width: 110px;
  padding: 6px 12px 6px 0;
  color: #666;
  white-space: nowrap;
}
.desc-table .label > div {
  position: relative;
  padding-left: 10px;
  font-weight: 500;
}
.border-l-emerald {
  border-left: 3px solid #10b981;
  padding-left: 8px;
}
.desc-table .content {
  padding: 6px 0;
  color: #444;
  line-height: 1.6;
}
</style>
