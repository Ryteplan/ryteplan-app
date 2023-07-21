import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import FilterableTable from './components/FilterableTable.vue';
import UniversityPage from './components/UniversityPage.vue';

Vue.config.productionTip = false;

Vue.use(VueRouter);

const routes = [
  { path: '/', component: FilterableTable },
  { path: '/university/:id', component: UniversityPage, props: true },
];

const router = new VueRouter({
  routes,
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
