<script setup lang="ts">
import type { ApiKeysForm } from '@/settings/settings.types.ts'
import SvgIcon from '@/ui/SvgIcon.vue'
import AdBlock from '@/ui/Ad-Block.vue'

const apiKeysForm = reactive<ApiKeysForm>({
  translation: {
    baidu: {
      appId: '',
      appSecret: '',
    },
    youdao: {
      appId: '',
      appSecret: '',
    },
    deepl: {
      apiKey: '',
      endpoint: '',
    },
  },
  ai: {
    openai: { apiKey: '' },
    deepseek: { apiKey: '' },
    qwen: { apiKey: '' },
    doubao: { apiKey: '' },
    wenxin: { apiKey: '' },
    yuanbao: { apiKey: '' },
  },
})

const handleSaveApiKeys = () => {}
</script>

<template>
  <n-form
    ref="apiKeysFormRef"
    :model="apiKeysForm"
    label-placement="left"
    :show-feedback="false"
    label-width="auto"
  >
    <ad-block id="baidu">
      <template #title>
        <div class="flex items-center gap-4px" style="font-size: 16px">
          <n-icon size="16">
            <svg-icon name="translate-baidu" />
          </n-icon>
          百度翻译
        </div>
      </template>
      <div class="flex flex-col gap-20px">
        <n-form-item label="百度 AppId" path="translation.baidu.appId">
          <n-input
            v-model:value="apiKeysForm.translation.baidu.appId"
            placeholder="输入百度 AppId"
            clearable
          />
        </n-form-item>
        <n-form-item label="百度 AppSecret" path="translation.baidu.appSecret">
          <n-input
            v-model:value="apiKeysForm.translation.baidu.appSecret"
            placeholder="输入百度 AppSecret"
            type="password"
            show-password-on="click"
            clearable
          />
        </n-form-item>
      </div>
    </ad-block>

    <ad-block id="youdao">
      <template #title>
        <div class="flex items-center gap-4px" style="font-size: 16px">
          <n-icon size="16">
            <svg-icon name="translate-youdao" />
          </n-icon>
          有道翻译
        </div>
      </template>
      <div class="flex flex-col gap-20px">
        <n-form-item label="有道 AppId" path="translation.youdao.appId">
          <n-input
            v-model:value="apiKeysForm.translation.youdao.appId"
            placeholder="输入有道 AppId"
            clearable
          />
        </n-form-item>
        <n-form-item label="有道 AppSecret" path="translation.youdao.appSecret">
          <n-input
            v-model:value="apiKeysForm.translation.youdao.appSecret"
            placeholder="输入有道 AppSecret"
            type="password"
            show-password-on="click"
            clearable
          />
        </n-form-item>
      </div>
    </ad-block>

    <ad-block id="deepl">
      <template #title>
        <div class="flex items-center gap-4px" style="font-size: 16px">
          <n-icon size="16">
            <svg-icon name="deepl" />
          </n-icon>
          DeepL
        </div>
      </template>
      <div class="flex flex-col gap-20px">
        <n-form-item label="DeepL" path="translation.deepl.apiKey">
          <n-input
            v-model:value="apiKeysForm.translation.deepl.apiKey"
            placeholder="输入 DeepL API Key"
            type="password"
            show-password-on="click"
            clearable
          />
        </n-form-item>
        <n-form-item label="DeepL Endpoint（可选）" path="translation.deepl.endpoint">
          <n-input
            v-model:value="apiKeysForm.translation.deepl.endpoint"
            placeholder="例如：https://api-free.deepl.com"
            clearable
          />
        </n-form-item>
      </div>
    </ad-block>

    <ad-block id="openai">
      <template #title>
        <div class="flex items-center gap-4px" style="font-size: 16px">
          <n-icon size="16">
            <svg-icon name="openai" />
          </n-icon>
          OpenAI
        </div>
      </template>
      <n-form-item label="OpenAI" path="ai.openai.apiKey">
        <n-input
          v-model:value="apiKeysForm.ai.openai.apiKey"
          placeholder="输入 OpenAI API Key"
          type="password"
          show-password-on="click"
          clearable
        />
      </n-form-item>
    </ad-block>

    <ad-block id="deepseek">
      <template #title>
        <div class="flex items-center gap-4px" style="font-size: 16px">
          <n-icon size="16">
            <svg-icon name="deepseek" />
          </n-icon>
          DeepSeek
        </div>
      </template>
      <n-form-item label="DeepSeek" path="ai.deepseek.apiKey">
        <n-input
          v-model:value="apiKeysForm.ai.deepseek.apiKey"
          placeholder="输入 DeepSeek API Key"
          type="password"
          show-password-on="click"
          clearable
        />
      </n-form-item>
    </ad-block>

    <n-button size="small" type="primary" attr-type="submit" @click="handleSaveApiKeys">
      保存 API Keys
    </n-button>
  </n-form>
</template>

<style scoped></style>
