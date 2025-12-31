import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/app/styles/normalize.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import App from './App.vue'
import { setupRoute } from '@/app/router'
import { initDiscreteApi } from '@/common/components/ui-discrete.ts'
import { setupMonacoEnvironment } from '@/common/lib/monaco/monaco-environment.ts'

const app = createApp(App)

app.use(createPinia())

setupMonacoEnvironment()

async function setupApp() {
  initDiscreteApi({ theme: 'light' })

  await setupRoute(app)

  app.mount('#app')
}

void setupApp()
