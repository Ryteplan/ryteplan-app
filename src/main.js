import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { createPinia } from 'pinia'
import { firebaseApp } from './firebase'
import { VueFire } from 'vuefire'
import App from './App.vue';

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css';
import '/src/assets/css/style.scss';

// Import components
import HomeView from './components/HomeView.vue';
import AuthenticationView from './components/AuthenticationView.vue';
import FilterableTable from './components/FilterableTable.vue';
import InstitutionDetail from './components/InstitutionDetail.vue';
import CompareInstituion from './components/CompareInstituion.vue';
import StudentsView from './components/StudentsView.vue';
import ListsView from './components/ListsView.vue';
import AccountView from './components/AccountView.vue';

const app = createApp(App);

// const analytics = getAnalytics(app);

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthenticationView,
  },
  {
    path: '/browse',
    name: 'browse',
    component: FilterableTable,
  },
  {
    path: '/institution/:name',
    name: 'institutionDetail',
    component: InstitutionDetail,
  },
  {
    path: '/compare-instituion',
    name: 'CompareInstituion',
    component: CompareInstituion,
  },
  {
    path: '/students',
    name: 'StudentsView',
    component: StudentsView,
  },
  {
    path: '/lists',
    name: 'ListsView',
    component: ListsView,
  },
  {
    path: '/account',
    name: 'Account',
    component: AccountView,
  },

];

const router = createRouter({
  mode: 'abstract',
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },  
});

app.use(router);


const pinia = createPinia()
app.use(pinia);

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

app.use(vuetify);

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // VueFireAuth(),
  ],
})

app.mount('#app');
