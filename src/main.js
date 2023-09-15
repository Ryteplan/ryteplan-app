import { createApp } from 'vue';
import App from './App.vue';
import * as firebase from "firebase/app";
import { createRouter, createWebHistory } from 'vue-router';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/dist/vuetify.min.css';
import { createPinia } from 'pinia'
import '/src/assets/css/style.scss';

const firebaseConfig = {
  apiKey: "AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk",
  authDomain: "college-counselo-1692637185845.firebaseapp.com",
  projectId: "college-counselo-1692637185845",
  storageBucket: "college-counselo-1692637185845.appspot.com",
  messagingSenderId: "304990071110",
  appId: "1:304990071110:web:837f224817c85feb7d5d47",
  measurementId: "G-N15EGVJW30"
};

firebase.initializeApp(firebaseConfig);


// Import components
import HomeView from './components/HomeView.vue';
import AuthenticationView from './components/AuthenticationView.vue';
import FilterableTable from './components/FilterableTable.vue';
import InstitutionDetail from './components/InstitutionDetail.vue';
import CompareInstituion from './components/CompareInstituion.vue';

const app = createApp(App);

// const analytics = getAnalytics(app);

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/account',
    name: 'Account',
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

app.use(vuetify)

app.mount('#app');
