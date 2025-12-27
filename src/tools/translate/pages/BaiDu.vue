<script setup lang="ts">
import SvgIcon from '@/ui/SvgIcon.vue'
import AdTextarea from '@/ui/AdTextarea.vue'
import { HelpCircleOutline, Close, CopyOutline } from '@vicons/ionicons5'
import type { ApiKeysForm } from '@/settings/settings.types.ts'
import { invokeCmd } from '@/utils/tauri.ts'
import { debounce } from 'lodash-es'
import { useClipboardItems } from '@vueuse/core'

const types = [
  { label: '文本翻译', value: 'text' },
  { label: '图片翻译', value: 'image' },
  { label: '文档翻译', value: 'document' },
]

const translateType = ref<string>('text')

const fileTypes = ['img', 'pdf', 'word', 'ppt', 'text']

const text = ref<string>('')

const translationResult = ref<string>('123123')

const debouncedTranslate = debounce(async (val: string) => {
  try {
    const result = await invokeCmd<{
      from: string
      to: string
      dst: string
      raw: unknown
    }>('baidu_text_translate', {
      payload: {
        q: val,
        from: 'auto',
        to: 'en',
        term_ids: null,
      },
    })

    translationResult.value = result.dst

    console.log('翻译结果:', result.dst)
  } catch (e) {
    console.warn(e)
  }
}, 500)

watch(
  () => text.value,
  (val) => {
    const v = val?.trim()
    if (!v) return
    debouncedTranslate(v)
  },
)

const modalShow = ref<boolean>(false)

const modalType = ref<string>('')
const handleTips = (type: string) => {
  modalType.value = type
  modalShow.value = true
}

const message = useMessage()

async function loadApiKeys() {
  try {
    const data = await invokeCmd<ApiKeysForm>('settings_get_api_keys')
    if (data?.translation.baidu && Object.values(data?.translation.baidu).some((x) => !x))
      message.warning('百度翻译尚未配置')
  } catch (e) {
    // 读取失败不一定要打扰用户
    console.warn(e)
  }
}

const { copy, isSupported } = useClipboardItems()

const handleCopy = async () => {
  if (!isSupported.value) {
    message.error('当前环境不支持复制')
    return
  }

  await copy([
    new ClipboardItem({
      'text/plain': new Blob([translationResult.value], {
        type: 'text/plain',
      }),
    }),
  ])

  message.success('已复制')
}

onMounted(() => {
  loadApiKeys()
})
</script>

<template>
  <n-split direction="horizontal" class="h-full" :max="0.75" :min="0.25">
    <template #1>
      <div class="w-full h-full flex flex-col gap-20px">
        <n-tabs type="line" default-value="text" v-model:value="translateType">
          <n-tab v-for="item in types" :key="item.value" :name="item.value">
            {{ item.label }}
          </n-tab>
        </n-tabs>

        <div v-if="translateType === 'text'" class="w-full pr-20px flex-1 flex flex-col gap-20px">
          <ad-textarea
            class="text-20px"
            v-model="text"
            show-limit
            :max="5000"
            autofocus
            show-clear
            show-copy
            show-paste
          />
          <n-upload
            multiple
            directory-dnd
            action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
            :max="1"
          >
            <n-upload-dragger>
              <n-text depth="3"> 上传图片/文档 </n-text>
              <n-p depth="3" style="margin: 8px 0 0 0">
                <div class="flex justify-center items-center gap-10px">
                  <n-icon size="26" v-for="item in fileTypes" :key="item">
                    <svg-icon :name="`file-${item}`" />
                  </n-icon>
                </div>
              </n-p>
            </n-upload-dragger>
          </n-upload>
        </div>
        <div v-else-if="translateType === 'image'" class="w-full pr-20px flex-1">
          <n-upload
            style="height: 100%"
            trigger-style="height: 100%"
            multiple
            directory-dnd
            action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
            :max="1"
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
                  <n-button text @click.stop="handleTips('image')">
                    <template #icon>
                      <n-icon size="20">
                        <HelpCircleOutline />
                      </n-icon>
                    </template>
                    格式说明
                  </n-button>
                </div>
              </div>
            </n-upload-dragger>
          </n-upload>
        </div>
        <div v-else-if="translateType === 'document'" class="w-full pr-20px flex-1">
          <n-upload
            style="height: 100%"
            trigger-style="height: 100%"
            multiple
            directory-dnd
            action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
            :max="1"
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
                  <n-button text @click.stop="handleTips('document')">
                    <template #icon>
                      <n-icon size="20">
                        <HelpCircleOutline />
                      </n-icon>
                    </template>
                    格式说明
                  </n-button>
                </div>
              </div>
            </n-upload-dragger>
          </n-upload>
        </div>

        <n-modal v-model:show="modalShow">
          <n-card
            style="width: 400px"
            size="small"
            :bordered="false"
            role="dialog"
            aria-modal="true"
          >
            <template #header> 支持格式说明 </template>
            <template #header-extra>
              <n-icon size="20" @click="modalShow = false" class="cursor-pointer select-none">
                <Close />
              </n-icon>
            </template>
            <table class="desc-table">
              <tbody>
                <tr v-if="modalType === 'document'">
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

    <template #2>
      <div class="pl-20px text-20px w-full h-full relative">
        <div class="w-full h-full overflow-y-auto">
          <div class="translation-text">{{ translationResult }}</div>
        </div>
        <div class="absolute top-0 right-20px" v-if="translationResult">
          <n-button text @click="handleCopy">
            <n-icon>
              <CopyOutline />
            </n-icon>
          </n-button>
        </div>
      </div>
    </template>
  </n-split>
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

.translation-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}
</style>
