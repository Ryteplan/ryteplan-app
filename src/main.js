import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/dist/vuetify.min.css';


// Import components
import FilterableTable from './components/FilterableTable.vue';
import InstitutionDetail from './components/InstitutionDetail.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: FilterableTable,
  },
  {
    path: '/institution/:name',
    name: 'institutionDetail',
    component: InstitutionDetail,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

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
})

app.use(vuetify)

app.mount('#app');
