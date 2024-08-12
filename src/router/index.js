import { createRouter, createWebHistory } from 'vue-router';
import PageHome from '@/views/PageHome.vue';
import BoardList from '@/views/board/BoardList.vue';
import BoardDetail from '@/views/board/BoardDetail.vue';
import BoardWrite from '@/views/board/BoardWrite.vue';
import UserLogin from '@/views/member/UserLogin.vue';
import Signup from '@/views/member/Signup.vue';
import Signin from '@/views/member/Signin.vue';
import ChatbotQuestion from '@/views/common/ChatbotQuestion.vue';

const routes = [
  {
    path: '/',
    name: 'PageHome',
    component: PageHome,
    meta: { showHeaderFooter: false } // 홈 페이지에서 헤더와 푸터를 숨깁니다.
  },
  {
    path: '/about',
    name: 'PageAbout',
    component: () => import(/* webpackChunkName: "about" */ '../views/PageAbout.vue'),
    meta: { showHeaderFooter: true }
  },
  {
    path: '/board/list',
    name: 'BoardList',
    component: BoardList,
    meta: { showHeaderFooter: true }
  },
  {
    path: '/board/detail',
    name: 'BoardDetail',
    component: BoardDetail,
    meta: { showHeaderFooter: true }
  },
  {
    path: '/board/write',
    name: 'BoardWrite',
    component: BoardWrite,
    meta: { showHeaderFooter: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin,
    meta: { showHeaderFooter: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { showHeaderFooter: true }
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin,
    meta: { showHeaderFooter: true }
  },
  {
    path: '/question',
    name: 'Question',
    component: ChatbotQuestion,
    meta: { showHeaderFooter: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
