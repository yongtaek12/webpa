import { createRouter, createWebHistory } from 'vue-router';
import PageHome from '@/views/PageHome.vue';
import BoardList from '@/views/board/BoardList.vue';
import BoardDetail from '@/views/board/BoardDetail.vue';
import BoardWrite from '@/views/board/BoardWrite.vue';
import UserLogin from '@/views/member/UserLogin.vue';
import Signup from '@/views/member/Signup.vue';
import Signin from '@/views/member/Signin.vue';
import ChatbotQuestion from '@/views/common/ChatbotQuestion.vue';
import Admin from '@/views/admin/Admin.vue';
import usersModel from "@/models/userModel";

const routes = [
  {
    path: '/',
    name: 'PageHome',
    component: PageHome,
    meta: { showHeaderFooter: false, requiredLogin: false } // 홈 페이지에서 헤더와 푸터를 숨깁니다.
  },
  {
    path: '/about',
    name: 'PageAbout',
    component: () => import(/* webpackChunkName: "about" */ '../views/PageAbout.vue'),
    meta: { showHeaderFooter: true, requiredLogin: false }
  },
  {
    path: '/board/list',
    name: 'BoardList',
    component: BoardList,
    meta: { showHeaderFooter: true , requiredLogin: true} // 로그인 필수 여부//
  },
  {
    path: '/board/detail',
    name: 'BoardDetail',
    component: BoardDetail,
    meta: { showHeaderFooter: true, requiredLogin: true}
  },
  {
    path: '/board/write',
    name: 'BoardWrite',
    component: BoardWrite,
    meta: { showHeaderFooter: true, requiredLogin: true}
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin,
    meta: { showHeaderFooter: true, requiredLogin: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { showHeaderFooter: true, requiredLogin: false }
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin,
    meta: { showHeaderFooter: true, requiredLogin: false}
  },
  {
    path: '/question',
    name: 'Question',
    component: ChatbotQuestion,
    meta: { showHeaderFooter: true,requiredLogin: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { showHeaderFooter: true,requiredLogin: false }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
router.beforeEach((to,from, next) => {
  const isRequiredLogin = to.meta?.requiredLogin === true;

  // 로그인이 필요한 페이지인데 로그인이 되어 있지 않다면
  if(isRequiredLogin && ! usersModel.isLogin()) {
    next('/signin')
  }
  else {
    next();
  }
})

export default router;
