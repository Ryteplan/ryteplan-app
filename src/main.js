import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import 'vuetify/dist/vuetify.min.css';


// Import components
import FilterableTable from './components/FilterableTable.vue';
import UniversityDetail from './components/UniversityDetail.vue';

const routes = [
  // Add the root route for the FilterableTable component
  {
    path: '/',
    name: 'home',
    component: FilterableTable,
  },
  {
    path: '/university/:id',
    name: 'university',
    component: UniversityDetail,
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
})

app.use(vuetify)

app.mount('#app');
