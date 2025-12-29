<script setup lang="ts">
import { HelpCircleOutline, Close } from '@vicons/ionicons5'
import type { BaiduPicTranslateRaw } from '@/tools/translate/translate.types.ts'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { invokeCmd } from '@/utils/tauri.ts'
import SvgIcon from '@/ui/SvgIcon.vue'

const message = useMessage()

const modalShow = ref<boolean>(false)

/** File -> number[]（对应 Rust Vec<u8>） */
async function fileToBytes(file: File): Promise<number[]> {
  const buf = await file.arrayBuffer()
  return Array.from(new Uint8Array(buf))
}

/** ===== 图片翻译 ===== */
type PicTranslateResult = {
  raw: BaiduPicTranslateRaw
}

const imageTranslating = ref(false)

async function handleImageRequest(options: UploadCustomRequestOptions) {
  const { file, onFinish, onError } = options
  const f = file.file
  if (!f) {
    onError?.()
    return
  }

  if (f.size > 10 * 1024 * 1024) {
    message.error('文件大小不能超过 10MB')
    onError?.()
    return
  }

  const mime = f.type.toLowerCase()
  const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp', 'image/tiff', 'image/tif']
  if (mime && !allowed.includes(mime)) {
    message.error('不支持的图片格式')
    onError?.()
    return
  }

  imageTranslating.value = true

  try {
    const bytes = await fileToBytes(f)

    const res = await invokeCmd<PicTranslateResult>('baidu_pic_translate', {
      payload: {
        image: bytes,
        mime: mime || 'image/png',
        from: 'auto',
        to: 'en',
        paste: 0,
      },
    })

    // ✅ 类型安全地提取文本
    const lines =
      res.raw.data?.content
        ?.map((item) => item.dst)
        .filter((x): x is string => typeof x === 'string') ?? []

    console.log(lines)

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
              <td class="content">支持 png、jpg、jpeg、bmp、tif，文件大小不超过 10MB</td>
            </tr>
          </tbody>
        </table>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped lang="less">
.desc-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px; /* 行间距 */
  font-size: 14px;
  color: #333;
}

.desc-table td {
  vertical-align: top;
}

/* 左侧类型列 */
.desc-table .label {
  width: 100px;
  padding: 6px 12px 6px 0;
  color: #666;
  white-space: nowrap;
}

.desc-table .label > div {
  position: relative;
  padding-left: 10px;
  font-weight: 500;
}

/* 左侧强调条 */
.border-l-emerald {
  border-left: 3px solid #10b981; /* emerald */
  padding-left: 8px;
}

/* 右侧内容列 */
.desc-table .content {
  padding: 6px 0;
  color: #444;
  line-height: 1.6;
}
</style>
