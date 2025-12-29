<script setup lang="ts">
import { HelpCircleOutline, Close, CopyOutline } from '@vicons/ionicons5'
import type { UploadCustomRequestOptions, SelectOption } from 'naive-ui'
import { useClipboardItems } from '@vueuse/core'

import type { BaiduPicTranslateRaw } from '@/tools/translate/types/translate.types.ts'
import { invokeCmd } from '@/utils/tauri'
import SvgIcon from '@/ui/SvgIcon.vue'

const message = useMessage()

/** ========== UI 状态 ========== */
const modalShow = ref<boolean>(false)
const imageTranslating = ref<boolean>(false)

const imagePreviewUrl = ref<string | null>(null) // 左侧原图
const pastedPreviewUrl = ref<string | null>(null) // 右侧整图贴合（blob url）

/** ========== Clipboard（必须用 useClipboardItems） ========== */
const { copy: copyItems, copied, isSupported: clipboardSupported } = useClipboardItems()

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

/** ========== 语言参数（固定 paste=1：整图贴合） ========== */
type LangCode =
  | 'auto'
  | 'zh'
  | 'en'
  | 'cht'
  | 'jp'
  | 'kor'
  | 'may'
  | 'th'
  | 'ara'
  | 'vie'
  | 'hi'
  | 'pt'
  | 'fra'
  | 'de'
  | 'it'
  | 'spa'
  | 'ru'
  | 'nl'
  | 'dan'
  | 'swe'
  | 'id'
  | 'pl'
  | 'rom'
  | 'tr'
  | 'el'
  | 'hu'

const form = reactive<{
  from: LangCode
  to: Exclude<LangCode, 'auto'>
}>({
  from: 'auto',
  to: 'en',
})

const langOptions: SelectOption[] = [
  { label: '自动检测', value: 'auto' },
  { label: '中文', value: 'zh' },
  { label: '英语', value: 'en' },
  { label: '中文（繁体）', value: 'cht' },
  { label: '日语', value: 'jp' },
  { label: '韩语', value: 'kor' },
  { label: '马来语', value: 'may' },
  { label: '泰语', value: 'th' },
  { label: '阿拉伯语', value: 'ara' },
  { label: '越南语', value: 'vie' },
  { label: '印地语', value: 'hi' },
  { label: '葡萄牙语', value: 'pt' },
  { label: '法语', value: 'fra' },
  { label: '德语', value: 'de' },
  { label: '意大利语', value: 'it' },
  { label: '西班牙语', value: 'spa' },
  { label: '俄语', value: 'ru' },
  { label: '荷兰语', value: 'nl' },
  { label: '丹麦语', value: 'dan' },
  { label: '瑞典语', value: 'swe' },
  { label: '印尼语', value: 'id' },
  { label: '波兰语', value: 'pl' },
  { label: '罗马尼亚语', value: 'rom' },
  { label: '土耳其语', value: 'tr' },
  { label: '希腊语', value: 'el' },
  { label: '匈牙利语', value: 'hu' },
]

/** ========== 百度返回（只用必要字段：content + pasteImg） ========== */
type Point = { x: number; y: number }

type ContentItem = {
  src?: string
  dst?: string
  rect?: string // "left top wide high"
  points?: Point[] // 4 points
}

type PicTranslateData = {
  from?: string
  to?: string
  sumSrc?: string
  sumDst?: string
  content?: ContentItem[]
  pasteImg?: string // paste=1
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

function revokeUrl(url: string | null) {
  if (url) URL.revokeObjectURL(url)
}

function cleanupPreviewUrls() {
  revokeUrl(imagePreviewUrl.value)
  imagePreviewUrl.value = null
  revokeUrl(pastedPreviewUrl.value)
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

function base64ToBlobUrl(base64: string, mime: string): string {
  const pure = base64.includes(',') ? base64.split(',')[1] : base64
  const bin = atob(pure)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const blob = new Blob([bytes], { type: mime })
  return URL.createObjectURL(blob)
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

/** ========== 上传并翻译（固定 paste=1） ========== */
type PicTranslateInvokePayload = {
  image: number[]
  mime: 'image/jpeg' | 'image/png' | 'image/webp'
  from: LangCode
  to: Exclude<LangCode, 'auto'>
  paste: 1
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

  if (form.to === 'auto') {
    message.error('目标语言不可设置为 auto')
    onError?.()
    return
  }

  cleanupPreviewUrls()
  result.value = null

  imagePreviewUrl.value = URL.createObjectURL(f)

  imageTranslating.value = true
  try {
    const bytes = await fileToBytes(f)

    const payload: PicTranslateInvokePayload = {
      image: bytes,
      mime,
      from: form.from,
      to: form.to,
      paste: 1,
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
    if (ecNum !== 0)
      throw new Error(raw.error_msg || `图片翻译失败（error_code=${String(raw.error_code)}）`)

    const data = raw.data ?? null
    if (!data?.pasteImg) throw new Error('未返回整图贴合图片（pasteImg 为空）')

    result.value = data
    pastedPreviewUrl.value = base64ToBlobUrl(data.pasteImg, mime)

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
      <!-- 左侧：上传 + 原图 -->
      <template #1>
        <div class="w-full h-full pr-20px flex flex-col gap-12px">
          <!-- 参数栏 -->
          <div class="param-bar">
            <div class="param-item">
              <div class="label">源语言</div>
              <n-select v-model:value="form.from" :options="langOptions" size="small" />
            </div>

            <div class="param-item">
              <div class="label">目标语言</div>
              <n-select
                v-model:value="form.to"
                :options="langOptions.filter((x) => x.value !== 'auto')"
                size="small"
              />
            </div>

            <div class="ml-auto flex items-center gap-8px">
              <n-button text @click="modalShow = true">
                <template #icon>
                  <n-icon size="20"><HelpCircleOutline /></n-icon>
                </template>
                格式说明
              </n-button>
            </div>
          </div>

          <n-upload
            v-if="!imagePreviewUrl"
            accept="image/jpeg,image/png,image/webp"
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
                  <n-text class="text-14px" depth="3"> jpg/png/webp，≤4MB </n-text>
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

      <!-- 右侧：整图贴合 + 浮层可复制文本 -->
      <template #2>
        <div class="w-full h-full ml-20px flex flex-col gap-12px">
          <div v-if="!imagePreviewUrl" class="empty h-full flex items-center justify-center">
            <n-text depth="3">上传图片后在这里查看整图贴合结果</n-text>
          </div>

          <template v-else>
            <!-- 整图贴合区域 -->
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

                <!-- 右下角：一键复制全文 -->
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
              </template>

              <template v-else>
                <div class="h-full flex items-center justify-center">
                  <n-spin v-if="imageTranslating" size="small" />
                  <n-text v-else depth="3">暂无贴合图</n-text>
                </div>
              </template>
            </div>

            <!-- 可选：下方也给一个文本区（便于全选复制） -->
            <div class="result-panel">
              <div class="result-header">
                <div class="title">译文（可全选复制）</div>
                <div class="actions">
                  <n-text v-if="copied" depth="3">已复制</n-text>
                </div>
              </div>
              <pre class="block-pre">{{ sumDst || '暂无译文' }}</pre>
            </div>
          </template>
        </div>
      </template>
    </n-split>

    <n-modal v-model:show="modalShow">
      <n-card style="width: 420px" size="small" :bordered="false" role="dialog" aria-modal="true">
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
              <td class="content">
                仅支持 jpg / png /
                webp（mime：image/jpeg、image/png、image/webp，小写），文件大小不超过
                4MB；固定整图贴合（paste=1）
              </td>
            </tr>
            <tr>
              <td class="label">
                <div class="border-l-emerald">复制：</div>
              </td>
              <td class="content">
                浮在图片上的文字可直接框选复制；双击某段可复制该段；右下角支持复制全文（使用 VueUse
                useClipboardItems）
              </td>
            </tr>
          </tbody>
        </table>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped lang="less">
.param-bar {
  display: flex;
  align-items: end;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fafafa;
}
.param-item {
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.param-item .label {
  font-size: 12px;
  color: #666;
}

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

/* 右侧整图贴合容器 */
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

/* 覆盖层：不挡整体，但单块文字可交互选中 */
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
  font-size: 12px;

  background: rgba(255, 255, 255, 0.55);
  border-radius: 6px;

  white-space: pre-wrap;
  word-break: break-word;
}

/* 下方文本区 */
.result-panel {
  border-radius: 8px;
  background: #fafafa;
  padding: 12px;
  overflow: auto;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.result-header .title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.block-pre {
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  background: #fff;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  font-size: 13px;
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
