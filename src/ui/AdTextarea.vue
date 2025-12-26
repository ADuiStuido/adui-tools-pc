<script setup lang="ts">
import { computed, watch } from 'vue'

/**
 * v-model
 */
const inputText = defineModel<string>({ default: '' })

/**
 * props
 */
const props = withDefaults(
  defineProps<{
    max?: number
    showLimit?: boolean
  }>(),
  {
    max: 5000,
    showLimit: false,
  },
)

/**
 * 当前字数
 */
const count = computed(() => inputText.value.length)

/**
 * 超出裁剪（包含粘贴 / 输入法）
 */
watch(
  () => inputText.value,
  (val) => {
    if (val.length > props.max) {
      inputText.value = val.slice(0, props.max)
    }
  },
  { flush: 'sync' },
)

/**
 * input 回写
 */
function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement
  const next = el.value.length > props.max ? el.value.slice(0, props.max) : el.value

  if (next !== inputText.value) {
    inputText.value = next
  }
}
</script>

<template>
  <div
    class="textarea-wrapper w-full flex-1"
    :data-count="count"
    :data-max="props.max"
    :data-show-limit="props.showLimit"
  >
    <textarea
      class="textarea w-full h-full"
      :value="inputText"
      :maxlength="props.max"
      placeholder="请输入文本"
      @input="onInput"
    />
  </div>
</template>

<style scoped lang="less">
.textarea-wrapper {
  position: relative;

  /* 字数统计（由 showLimit 控制） */
  &[data-show-limit='true']::after {
    content: attr(data-count) ' / ' attr(data-max);
    position: absolute;
    right: 20px;
    bottom: 6px;
    font-size: 12px;
    color: #999;
    pointer-events: none;
  }

  /* 聚焦态（可选） */
  &:focus-within[data-show-limit='true']::after {
    color: #666;
  }
}

.textarea {
  /* 盒模型 */
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  /* 清浏览器默认外观 */
  appearance: none;
  -webkit-appearance: none;
  border: none;
  outline: none;
  background: transparent;

  /* 清圆角 / 阴影 */
  border-radius: 0;
  box-shadow: none;

  /* 字体完全继承 */
  font: inherit;
  color: inherit;
  line-height: inherit;

  /* 行为控制 */
  resize: none;
  overflow: auto;

  /* 给统计留空间（只有 showLimit 时才需要，但多一点 padding 不影响） */
  padding: 0 0 28px;
  margin: 0;
}

/* 到达上限警告 */
.textarea-wrapper[data-show-limit='true'][data-count='5000']::after {
  color: #f56c6c;
}
</style>
