import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/app/styles/normalize.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import App from './App.vue'
import { setupRoute } from '@/app/router'

const app = createApp(App)

app.use(createPinia())

async function setupApp() {
  await setupRoute(app)

  app.mount('#app')
}

void setupApp()
