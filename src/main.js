import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
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


import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css';
import '/src/assets/css/style.scss';

// Import components
import HomeView from './components/HomeView.vue';
import AuthenticationView from './components/AuthenticationView.vue';
import FilterableTable from './components/FilterableTable.vue';
import InstitutionPage from './components/InstitutionPage.vue';
import CompareInstituion from './components/CompareInstituion.vue';
import StudentsView from './components/StudentsView.vue';
import ListsView from './components/ListsView.vue';
import SingularListView from './components/SingularListView.vue';
import AccountView from './components/AccountView.vue';
import PlaygroundView from './components/PlaygroundView.vue';
import DataIntegrationView from './components/DataIntegrationView.vue';
import DataCompareView from './components/DataCompareView.vue';
import ImageWorkView from './components/ImageWorkView.vue';

const app = createApp(App);

// const analytics = getAnalytics(app);

const routes = [
  {
    path: '/image-work',
    name: 'ImageWork',
    component: ImageWorkView,
  },
  {
    path: '/playground',
    name: 'Playground',
    component: PlaygroundView,
  },
  {
    path: '/data-integration',
    name: 'DataIntegration',
    component: DataIntegrationView,
  },
  {
    path: '/data-compare',
    name: 'DataCompare',
    component: DataCompareView,
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: AuthenticationView,
    props: true
  },
  {
    path: '/browse',
    name: 'browse',
    component: FilterableTable,
  },
  {
    path: '/institution/:slug',
    name: 'institutionPage',
    component: InstitutionPage,
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
    path: '/list/:id',
    name: 'SingularListView',
    component: SingularListView,
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
pinia.use(piniaPluginPersistedstate)
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

router.isReady().then(() => {
  app.mount('#app');
});