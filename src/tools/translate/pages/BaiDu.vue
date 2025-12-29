<script setup lang="ts">
import { SwapHorizontalOutline } from '@vicons/ionicons5'
import type { ApiKeysForm } from '@/settings/settings.types.ts'
import { invokeCmd } from '@/utils/tauri.ts'
import BaiDuText from '@/tools/translate/components/BaiDuText.vue'
import BaiDuImage from '@/tools/translate/components/BaiDuImage.vue'
import BaiDuDocument from '@/tools/translate/components/BaiDuDocument.vue'
import { BAIDU_MT_LANG_SELECT_GROUP_OPTIONS } from '@/tools/translate/types/language.types.ts'
import type { TranslateLangPair } from '@/tools/translate/types/translate.types.ts'

const types = [
  { label: '文本翻译', value: 'text' },
  { label: '图片翻译', value: 'image' },
  { label: '文档翻译', value: 'document' },
]

const translateType = ref<string>('text')

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

const translateLangPair = reactive<TranslateLangPair>({
  from: 'auto',
  to: 'en',
})

const handleSwap = () => {
  const temp = translateLangPair.from
  if (temp === 'auto') return
  translateLangPair.from = translateLangPair.to
  translateLangPair.to = temp
}

onMounted(() => {
  loadApiKeys()
})
</script>

<template>
  <div class="w-full h-full flex flex-col gap-20px">
    <n-tabs type="line" default-value="text" v-model:value="translateType">
      <n-tab v-for="item in types" :key="item.value" :name="item.value">
        {{ item.label }}
      </n-tab>
      <template #suffix>
        <div class="flex items-center gap-5px">
          <n-select
            v-model:value="translateLangPair.from"
            filterable
            :options="BAIDU_MT_LANG_SELECT_GROUP_OPTIONS"
            :bordered="false"
            class="w-150px"
            size="small"
          />
          <n-button text size="small" @click="handleSwap">
            <n-icon>
              <SwapHorizontalOutline />
            </n-icon>
          </n-button>
          <n-select
            v-model:value="translateLangPair.to"
            :options="BAIDU_MT_LANG_SELECT_GROUP_OPTIONS"
            :bordered="false"
            class="w-150px"
            size="small"
          />
        </div>
      </template>
    </n-tabs>
    <bai-du-text
      v-if="translateType === 'text'"
      :from="translateLangPair.from"
      :to="translateLangPair.to"
    />
    <bai-du-image v-if="translateType === 'image'" />
    <bai-du-document v-if="translateType === 'document'" />
  </div>
</template>

<style scoped lang="less"></style>
