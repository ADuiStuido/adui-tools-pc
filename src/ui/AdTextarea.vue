<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { ClipboardOutline, CopyOutline, CloseCircleOutline } from '@vicons/ionicons5'
import { useClipboardItems } from '@vueuse/core'

/**
 * ================================
 * v-model 定义
 * ================================
 * 使用 defineModel（Vue 3.4+）
 * 父组件通过 v-model 传入文本内容
 */
const inputText = defineModel<string>({ default: '' })

/**
 * ================================
 * props 定义
 * ================================
 */
const props = withDefaults(
  defineProps<{
    /** 最大字符数 */
    max?: number
    /** 是否显示字数统计 */
    showLimit?: boolean
    /** placeholder 文案 */
    placeholder?: string
    /** 是否只读 */
    readonly?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 是否自动聚焦 */
    autofocus?: boolean
    /** 是否显示“从剪贴板粘贴”按钮 */
    showPaste?: boolean
    /** 是否显示“复制内容”按钮 */
    showCopy?: boolean
    /** 是否显示“清空内容”按钮 */
    showClear?: boolean
  }>(),
  {
    max: 5000,
    showLimit: false,
    placeholder: '请输入文本',
    readonly: false,
    disabled: false,
    autofocus: false,
    showPaste: true,
    showCopy: false,
    showClear: false,
  },
)

/**
 * ================================
 * 组件事件
 * ================================
 * 提供给父组件监听
 */
const emit = defineEmits<{
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'change', value: string): void
  (e: 'paste', value: string): void
  (e: 'copy', value: string): void
  (e: 'clear'): void
}>()

/**
 * textarea DOM 引用
 * - 用于控制光标位置
 * - 用于自动 focus
 */
const textareaRef = ref<HTMLTextAreaElement | null>(null)

/**
 * ================================
 * 字数统计 & 状态
 * ================================
 */

/** 当前字符数 */
const count = computed(() => inputText.value.length)

/** 是否已经达到最大字符数 */
const isMax = computed(() => count.value >= props.max)

/**
 * ================================
 * 超长文本裁剪（核心逻辑）
 * ================================
 *
 * 为什么要 watch？
 * - 输入法（中文/日文）
 * - 粘贴文本
 * - 程序性修改 v-model
 *
 * 这些都可能绕过 input 事件
 */
watch(
  () => inputText.value,
  (val) => {
    if (val.length > props.max) {
      inputText.value = val.slice(0, props.max)
      emit('change', inputText.value)
    }
  },
  {
    // 同步执行，避免输入法中间态闪烁
    flush: 'sync',
  },
)

/**
 * ================================
 * input 事件处理
 * ================================
 * - 正常键盘输入
 * - 即时裁剪
 */
function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement
  const next = el.value.length > props.max ? el.value.slice(0, props.max) : el.value

  if (next !== inputText.value) {
    inputText.value = next
    emit('change', next)
  }
}

/**
 * ================================
 * paste 事件处理（直接 Ctrl+V）
 * ================================
 * 目的：
 * - 防止一次性粘贴超长文本
 * - 保留光标位置
 * - 体验比浏览器默认好
 */
function onPaste(e: ClipboardEvent) {
  if (props.readonly || props.disabled) return

  const text = e.clipboardData?.getData('text/plain')
  if (!text) return

  // 阻止浏览器默认粘贴行为
  e.preventDefault()

  const el = textareaRef.value
  if (!el) return

  const start = el.selectionStart ?? inputText.value.length
  const end = el.selectionEnd ?? inputText.value.length

  // 在光标位置插入文本
  const next = (inputText.value.slice(0, start) + text + inputText.value.slice(end)).slice(
    0,
    props.max,
  )

  inputText.value = next
  emit('paste', next)
  emit('change', next)

  // 恢复光标位置
  requestAnimationFrame(() => {
    const pos = Math.min(start + text.length, props.max)
    el.setSelectionRange(pos, pos)
  })
}

/**
 * ================================
 * Clipboard API（按钮方式粘贴）
 * ================================
 */
const { read, copy: copyItems, isSupported, content } = useClipboardItems({ read: true })

/**
 * 点击按钮 → 从系统剪贴板读取文本
 */
async function handlePaste() {
  if (props.readonly || props.disabled) return
  if (!isSupported.value) return

  try {
    read()

    await nextTick()

    const item = content.value?.[0]
    if (!item) return

    // 优先读 text/plain
    const type = item.types.includes('text/plain') ? 'text/plain' : (item.types[0] ?? 'text/plain')
    const blob = await item.getType(type)
    const text = await blob.text()
    if (!text) return

    const next = text.slice(0, props.max)
    inputText.value = next
    emit('paste', next)
    emit('change', next)
    textareaRef.value?.focus()
  } catch (err) {
    console.warn('读取剪贴板失败:', err)
  }
}

/**
 * ================================
 * 复制当前内容到剪贴板
 * ================================
 */
async function handleCopy() {
  if (!isSupported.value || !inputText.value) return

  try {
    await copyItems([
      new ClipboardItem({
        'text/plain': new Blob([inputText.value], {
          type: 'text/plain',
        }),
      }),
    ])
    emit('copy', inputText.value)
  } catch (err) {
    console.warn('复制失败:', err)
  }
}

/**
 * ================================
 * 清空文本
 * ================================
 */
function handleClear() {
  if (props.readonly || props.disabled) return
  inputText.value = ''
  emit('clear')
  emit('change', '')
  textareaRef.value?.focus()
}

/**
 * 自动聚焦
 */
onMounted(() => {
  if (props.autofocus) {
    textareaRef.value?.focus()
  }
})
</script>

<template>
  <div
    class="textarea-wrapper w-full flex-1"
    :data-count="count"
    :data-max="props.max"
    :data-show-limit="props.showLimit"
    :data-is-max="isMax"
  >
    <!-- 右上角操作按钮 -->
    <div class="actions absolute top-0 right-0 flex items-center gap-6px">
      <n-button v-if="props.showPaste" text @click="handlePaste">
        <n-icon><ClipboardOutline /></n-icon>
      </n-button>

      <n-button v-if="props.showCopy" text @click="handleCopy">
        <n-icon><CopyOutline /></n-icon>
      </n-button>

      <n-button v-if="props.showClear" text @click="handleClear" :disabled="!inputText">
        <n-icon><CloseCircleOutline /></n-icon>
      </n-button>
    </div>

    <!-- textarea 本体 -->
    <textarea
      ref="textareaRef"
      class="textarea w-full h-full"
      :value="inputText"
      :maxlength="props.max"
      :placeholder="props.placeholder"
      :readonly="props.readonly"
      :disabled="props.disabled"
      @input="onInput"
      @paste="onPaste"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />
  </div>
</template>

<style scoped lang="less">
.textarea-wrapper {
  position: relative;

  /* 字数统计 */
  &[data-show-limit='true']::after {
    content: attr(data-count) ' / ' attr(data-max);
    position: absolute;
    right: 14px;
    bottom: 6px;
    font-size: 12px;
    color: #999;
    pointer-events: none;
  }

  /* 达到上限时警告 */
  &[data-show-limit='true'][data-is-max='true']::after {
    color: #f56c6c;
  }
}

.actions {
  padding: 4px 6px;
  z-index: 1;
}

.textarea {
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  border: none;
  outline: none;
  background: transparent;

  resize: none;
  overflow: auto;

  /* 给右上按钮和右下字数留空间 */
  padding: 28px 0 28px;
}
</style>
