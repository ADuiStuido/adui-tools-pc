<script setup lang="ts">
import SvgIcon from '@/ui/SvgIcon.vue'
import AdTextarea from '@/ui/AdTextarea.vue'
import { HelpCircleOutline, Close } from '@vicons/ionicons5'

const types = [
  { label: '文本翻译', value: 'text' },
  { label: '图片翻译', value: 'image' },
  { label: '文档翻译', value: 'document' },
]

const translateType = ref<string>('text')

const fileTypes = ['img', 'pdf', 'word', 'ppt', 'text']

const text = ref<string>('')

const modalShow = ref<boolean>(false)

const modalType = ref<string>('')
const handleTips = (type: string) => {
  modalType.value = type
  modalShow.value = true
}
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
          <ad-textarea class="text-20px" v-model="text" show-limit :max="5000" />
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

    <template #2> Pane 2 </template>
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
</style>
