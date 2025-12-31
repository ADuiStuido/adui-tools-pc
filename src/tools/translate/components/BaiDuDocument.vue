<script setup lang="ts">
import { HelpCircleOutline, Close } from '@vicons/ionicons5'
import type {
  BaiduDocCreateRaw,
  BaiduDocQueryRaw,
  TranslateLangPair,
} from '@/tools/translate/types/translate.types.ts'
import { invokeCmd } from '@/utils/tauri.ts'
import type { UploadCustomRequestOptions } from 'naive-ui'
import SvgIcon from '@/common/components/SvgIcon.vue'

const message = useMessage()

const fileTypes = ['img', 'pdf', 'word', 'ppt', 'text']

const props = defineProps<TranslateLangPair>()

const modalShow = ref<boolean>(false)

/** File -> number[]（对应 Rust Vec<u8>） */
async function fileToBytes(file: File): Promise<number[]> {
  const buf = await file.arrayBuffer()
  return Array.from(new Uint8Array(buf))
}

/** ===== 文档翻译 ===== */
type DocCreateResult = {
  raw: BaiduDocCreateRaw
}
type DocQueryResult = {
  raw: BaiduDocQueryRaw
}
const docTranslating = ref(false)

/** 简单轮询工具（2s 一次，最多 60 次 = 2 分钟） */
async function pollDocResult(id: string): Promise<BaiduDocQueryRaw> {
  for (let i = 0; i < 60; i++) {
    const res = await invokeCmd<DocQueryResult>('baidu_doc_translate_query', {
      payload: { id },
    })

    const status = res.raw.result?.status

    if (status === 'Succeeded') {
      return res.raw
    }

    if (status === 'Failed') {
      throw new Error(res.raw.error_msg || '文档翻译失败')
    }

    await new Promise((r) => setTimeout(r, 2000))
  }

  throw new Error('文档翻译超时')
}

async function handleDocRequest(options: UploadCustomRequestOptions) {
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

  // 允许格式（按你 UI 文案）
  const ext = f.name.split('.').pop()?.toLowerCase() || ''
  const allowed = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'wps']
  if (!allowed.includes(ext)) {
    message.error('不支持的文档格式')
    onError?.()
    return
  }

  docTranslating.value = true
  try {
    const bytes = await fileToBytes(f)

    // 1) create
    const created = await invokeCmd<DocCreateResult>('baidu_doc_translate_create', {
      payload: {
        from: props.from,
        to: props.to,
        file: bytes,
        format: ext,
        filename: f.name,
        trans_image: 1,
        output_format: 'docx',
      },
    })

    const id = created.raw.result?.id
    if (!id) {
      throw new Error(created.raw.error_msg || '创建文档翻译任务失败')
    }

    message.info('已创建任务，正在翻译…')

    // 2) poll
    const finalRaw = await pollDocResult(id)

    // 3) 从返回里取结果
    // 百度通常会返回下载链接 / 文件信息（字段你需要根据 finalRaw 实际结构取）
    // 先把整个 raw 打印出来，你对照一下再决定抽取哪个字段
    console.log('文档最终结果 raw:', finalRaw)

    // 你可以先简单把 json stringify 塞到右侧结果区做调试

    message.success('文档翻译完成')
    onFinish?.()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : '文档翻译失败'

    message.error(msg)
    onError?.()
  } finally {
    docTranslating.value = false
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
            :custom-request="handleDocRequest"
            :disabled="docTranslating"
          >
            <n-upload-dragger class="h-full">
              <div class="h-full flex flex-col justify-center items-center gap-10px">
                <n-text class="text-16px" depth="3"> 点击或拖拽上传 </n-text>

                <div class="flex justify-center items-center gap-10px">
                  <n-icon
                    size="40"
                    v-for="item in fileTypes.filter((x) => x !== 'img')"
                    :key="item"
                  >
                    <svg-icon :name="`file-${item}`" />
                  </n-icon>
                </div>

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

                <n-spin v-if="docTranslating" size="small" />
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
                <div class="border-l-emerald">文档翻译：</div>
              </td>
              <td class="content">
                支持 doc、docx、pdf、xls、xlsx、ppt、pptx、txt、wps， 暂不支持有密码保护的
                PDF，文件大小不超过 10MB
              </td>
            </tr>
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
