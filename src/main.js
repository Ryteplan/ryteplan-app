import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import FilterableTable from './components/FilterableTable.vue';
import UniversityPage from './components/UniversityPage.vue';

const routes = [
  { path: '/', component: FilterableTable },
  { path: '/university/:id', component: UniversityPage, props: true, name: 'university' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount('#app');
