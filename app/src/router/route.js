import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue'; // Замените на существующую страницу, например
import AboutPage from '../pages/Employe_Table.vue'; // Или добавьте свою страницу

const routes = [
  { path: '/', component: () => import('../pages/HomePage.vue') },
  { path: '/Employees', component: () => import('../pages/Employe_Table.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;