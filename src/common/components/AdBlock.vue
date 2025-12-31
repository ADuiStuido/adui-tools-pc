<script setup lang="ts">
defineProps<{ title?: string }>()

const slots = useSlots()
</script>

<template>
  <div class="ad-block">
    <div class="ad-block-title">
      <div v-if="title && !slots['title']">{{ title }}</div>
      <slot v-if="slots['title']" name="title"></slot>
    </div>

    <slot />
  </div>
</template>

<style scoped lang="less">
.ad-block {
  --border-color: #efeff5;
  --radius: 6px;
  --border-width: 1px;
  --gap-width: 100px;
  --text-content: ' ';

  position: relative;
  padding: 20px;
  margin: 20px 0;
  border-radius: var(--radius);
}
.ad-block::after {
  content: ' ';
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  border: var(--border-width) solid var(--border-color);
  pointer-events: none;

  /* 顶部中间挖空 */
  mask:
    linear-gradient(#000 0 0) top left,
    linear-gradient(#000 0 0) top right,
    linear-gradient(#000 0 0) bottom,
    linear-gradient(#000 0 0) left,
    linear-gradient(#000 0 0) right;
  mask-size:
    calc(10% - var(--gap-width) / 2) var(--border-width),
    calc(90% - var(--gap-width) / 2) var(--border-width),
    100% calc(100% - var(--border-width)),
    var(--border-width) 100%,
    var(--border-width) 100%;
  mask-position:
    top left,
    top right,
    bottom left,
    top left,
    top right;
  mask-repeat: no-repeat;
}

.ad-block-title {
  position: absolute;
  top: 0;
  left: 10%;
  transform: translate(-50%, -50%);
  padding: 0 8px;
  z-index: 1;
}
</style>
