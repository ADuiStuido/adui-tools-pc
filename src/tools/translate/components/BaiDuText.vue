<script setup lang="ts">
import AdTextarea from '@/common/components/AdTextarea.vue'
import SvgIcon from '@/common/components/SvgIcon.vue'
import { invokeCmd } from '@/utils/tauri.ts'
import { debounce } from 'lodash-es'
import { CopyOutline } from '@vicons/ionicons5'
import { useClipboardItems } from '@vueuse/core'
import type { TranslateLangPair } from '@/tools/translate/types/translate.types.ts'

const message = useMessage()

const props = defineProps<TranslateLangPair>()

const fileTypes = ['img', 'pdf', 'word', 'ppt', 'text']

const text = ref<string>('')

const translationResult = ref<string>('')

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
        from: props.from,
        to: props.to,
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
</script>

<template>
  <n-split direction="horizontal" class="h-full" :max="0.75" :min="0.25">
    <template #1>
      <div class="w-full h-full pr-20px flex flex-col gap-20px">
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
.translation-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}
</style>
