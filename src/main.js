import { createApp } from 'vue';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { firebaseApp } from './firebase'
import { VueFire } from 'vuefire'
import App from './App.vue';
import VueGtag from "vue-gtag";

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css';
import '/src/assets/css/style.scss';

import router from '@/router';
import { useUserStore } from '@/stores/userStore';
const app = createApp(App);

// const analytics = getAnalytics(app);


app.use(VueGtag, {
  config: { id: 'G-N15EGVJW30' }
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia);
const store = useUserStore();
await store.loadUserInfo();

const vuetify = createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#6899A4",
        }
      },
    },
  },
})

app.use(vuetify);

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // VueFireAuth(),
  ],
})

app.use(router);
router.isReady().then(() => {
  app.mount('#app');
});