<script setup lang="ts">
import { ref } from 'vue'
import ApiKeysForm from '@/settings/components/ApiKeysForm.vue'
import NetworkForm from '@/settings/components/NetworkForm.vue'

type SettingKey =
  | 'general'
  | 'ai'
  | 'credentials'
  | 'baidu'
  | 'youdao'
  | 'deepl'
  | 'openai'
  | 'deepseek'
  | 'network'
  | 'data'

interface SettingItem {
  key: SettingKey
  label: string
  children?: readonly SettingItem[]
}

const settingTypes: readonly SettingItem[] = [
  { key: 'general', label: '基础设置' },
  { key: 'ai', label: 'AI 设置' },
  {
    key: 'credentials',
    label: 'API Keys',
    children: [
      { key: 'baidu', label: '百度翻译' },
      { key: 'youdao', label: '有道翻译' },
      { key: 'deepl', label: 'DeepL' },
      { key: 'openai', label: 'OpenAI' },
      { key: 'deepseek', label: 'DeepSeek' },
    ],
  },
  { key: 'network', label: '网络代理' },
  { key: 'data', label: '数据管理' },
]

const settingsContainer = (): HTMLElement => {
  return document.getElementById('settings-container')!
}

/** 只用到 scrollTo，所以给一个最小实例类型即可（不使用 any） */
interface AnchorInst {
  scrollTo: (href: string) => void
}

const anchorRef = ref<AnchorInst | null>(null)

const handleAnchorClick = (key: SettingKey): void => {
  // 交给 naive-ui 的 scrollTo 做滚动（它会对 offset-target 生效）
  anchorRef.value?.scrollTo(`#${key}`)
}
</script>

<template>
  <div class="w-full h-full">
    <n-row :gutter="20">
      <n-col :span="4">
        <n-anchor
          ref="anchorRef"
          show-background
          :offset-target="settingsContainer"
          affix
          :trigger-top="24"
          :top="88"
          :bound="40"
        >
          <n-anchor-link
            v-for="item in settingTypes"
            :key="item.key"
            :title="item.label"
            :href="`#${item.key}`"
            @click.capture.prevent="handleAnchorClick(item.key)"
          >
            <template v-if="item.children">
              <n-anchor-link
                v-for="child in item.children"
                :key="child.key"
                :title="child.label"
                :href="`#${child.key}`"
                @click.capture.prevent="handleAnchorClick(child.key)"
              />
            </template>
          </n-anchor-link>
        </n-anchor>
      </n-col>

      <n-col span="20">
        <div id="settings-container" class="overflow-auto" style="height: calc(100vh - 104px)">
          <div v-for="item in settingTypes" :key="item.key" :id="item.key">
            <n-divider title-placement="left">
              <div class="title text-20px">{{ item.label }}</div>
            </n-divider>

            <api-keys-form v-if="item.key === 'credentials'" />
            <network-form v-else-if="item.key === 'network'" />
            <div v-else class="h-500px"></div>

            <!-- 关键：子锚点如果页面里没有同名 id，就补一个“定位点” -->
            <template v-if="item.children?.length">
              <div
                v-for="child in item.children"
                :key="child.key"
                :id="child.key"
                style="height: 0; overflow: hidden"
              />
            </template>
          </div>
        </div>
      </n-col>
    </n-row>
  </div>
</template>

<style scoped lang="less">
.title {
  background: linear-gradient(125deg, #5b2b82 0%, #5b2b82 50%, #6cff00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
