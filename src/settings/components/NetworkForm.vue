<script setup lang="ts">
import { type NetworkProxyForm, ProxyMode, ProxyProtocol } from '@/settings/settings.types.ts'
import { invoke } from '@tauri-apps/api/core'
import { message } from '@/ui/ui-discrete.ts'

const proxyOptions = ref([
  {
    label: '系统代理',
    value: ProxyMode.system,
  },
  {
    label: '手动代理',
    value: ProxyMode.manual,
  },
  {
    label: '禁用',
    value: ProxyMode.disable,
  },
])

const protocolOptions = ref([
  {
    label: 'HTTP',
    value: ProxyProtocol.http,
  },
  {
    label: 'HTTPS',
    value: ProxyProtocol.https,
  },
  {
    label: 'SOCKS',
    value: ProxyProtocol.socks5,
  },
])

const networkProxyForm = reactive<NetworkProxyForm>({
  mode: 'disable',
})

const saveApiKeys = async () => {
  try {
    await invoke('settings_save_network', { payload: networkProxyForm })
    message.success('保存成功')
  } catch (e: unknown) {
    message.error(e?.message ?? '保存失败')
  }
}

async function loadNetwork() {
  try {
    const data = await invoke<NetworkProxyForm | null>('settings_get_network')
    if (data) Object.assign(networkProxyForm, data)
  } catch (e) {
    // 读取失败不一定要打扰用户
    console.warn(e)
  }
}

watch(() => networkProxyForm, saveApiKeys, { deep: true })

onMounted(loadNetwork)
</script>

<template>
  <div class="w-300px">
    <n-form
      ref="apiKeysFormRef"
      :model="networkProxyForm"
      :show-feedback="false"
      label-placement="top"
      label-width="auto"
    >
      <div class="flex flex-col gap-20px">
        <n-form-item label="代理模式" path="mode">
          <n-radio-group v-model:value="networkProxyForm.mode">
            <n-radio-button
              v-for="item in proxyOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </n-radio-group>
        </n-form-item>
        <div class="flex flex-col gap-20px" v-if="networkProxyForm.mode === 'manual'">
          <n-form-item label="代理配置" path="protocol">
            <n-radio-group v-model:value="networkProxyForm.protocol">
              <n-radio
                v-for="item in protocolOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </n-radio-group>
          </n-form-item>
          <n-form-item label="代理地址" path="host">
            <n-input v-model:value="networkProxyForm.host" placeholder="输入地址" clearable />
          </n-form-item>
          <n-form-item label="代理端口" path="port">
            <n-input
              v-model.number:value="networkProxyForm.port"
              placeholder="输入端口"
              clearable
            />
          </n-form-item>
          <n-form-item label="用户名" path="username">
            <n-input v-model:value="networkProxyForm.username" placeholder="输入用户名" clearable />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="networkProxyForm.password"
              placeholder="输入密码"
              type="password"
              show-password-on="click"
              clearable
            />
          </n-form-item>
        </div>
      </div>
    </n-form>
  </div>
</template>

<style scoped></style>
