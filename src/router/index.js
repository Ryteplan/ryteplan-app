import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/components/HomeView.vue';
import AuthenticationView from '@/components/AuthenticationView.vue';
import FilterableTable from '@/components/FilterableTable.vue';
import InstitutionPage from '@/components/InstitutionPage.vue';
import CompareInstituion from '@/components/CompareInstituion.vue';
import StudentsView from '@/components/StudentsView.vue';
import ListsView from '@/components/ListsView.vue';
import SingularListView from '@/components/SingularListView.vue';
import AccountView from '@/components/AccountView.vue';
import PlaygroundView from '@/components/PlaygroundView.vue';
import DataIntegrationView from '@/components/DataIntegrationView.vue';
import DataCompareView from '@/components/DataCompareView.vue';
import ImageWorkView from '@/components/ImageWorkView.vue';
import TermsView from '@/views/TermsView.vue';
import PrivacyView from '@/views/PrivacyView.vue';
import OnboardingView from '@/views/OnboardingView.vue';

import { useUserStore } from '@/stores/userStore';

const routes = [
  {
    path: '/image-work/:slug',
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
    props: true,
  },
  {
    path: '/logout',
    name: 'logout',
    component: AuthenticationView,
    props: true,
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
    path: '/institution/:slug/sports-work',
    name: 'SportsWork',
    component: () => import('@/components/SportsWork.vue'),
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
  {
    path: '/terms',
    name: 'terms',
    component: TermsView,
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyView,
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingView,
  },
];

const router = createRouter({
  mode: 'abstract',
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

const publicRoutes = ['/login', '/logout', '/terms', '/privacy'];

router.beforeEach((to, from, next) => {
  const store = useUserStore();
  console.log({
    toName: to.name,
    fromName: from.name,
    isLoggedIn: store.isLoggedIn,
    isSetupFinished: store.isSetupFinished,
    userInfo: store.userInfo,
  });
  if (publicRoutes.includes(to.path)) {
    next();
  } else if (store.isSetupFinished) {
    if (to.name === 'onboarding') {
      next({ name: 'home' });
    } else {
      next();
    }
  } else if (store.isLoggedIn) {
    if (to.name === 'onboarding') {
      next();
    } else {
      next({ name: 'onboarding' });
    }
  } else {
    next({ name: 'login' });
  }
});

export default router;
