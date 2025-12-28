<script setup lang="ts">
import AdTextarea from '@/ui/AdTextarea.vue'
import SvgIcon from '@/ui/SvgIcon.vue'
import { invokeCmd } from '@/utils/tauri.ts'
import { debounce } from 'lodash-es'

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
</script>

<template>
  <div class="w-full pr-20px flex-1 flex flex-col gap-20px">
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

<style scoped></style>
