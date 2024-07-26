import { createRouter, createWebHistory } from 'vue-router'
import PageHome from '@/views/PageHome.vue'
import BoardList from '@/views/board/BoardList.vue'
import BoardDetail from '@/views/board/BoardDetail.vue'
import BoardWrite from '@/views/board/BoardWrite.vue'
import UserLogin from '@/views/member/UserLogin.vue'
import Signup from '@/views/member/Signup.vue'
import Signin from '@/views/member/Signin.vue'
import ChatbotQuestion from '@/views/common/ChatbotQuestion.vue'
import Header from '@/components/PageHeader.vue'
const routes = [
  {
    path: '/',
    name: 'PageHome',
    component: PageHome
  },
  {
    path: '/about',
    name: 'PageAbout',
    component: () => import(/* webpackChunkName: "about" */ '../views/PageAbout.vue')
  },
  {
    path: '/board/list',
    name: 'BoardList',
    component: BoardList
  },
  {
    path: '/board/detail',
    name: 'BoardDetail',
    component: BoardDetail
  },
  {
    path: '/board/write',
    name: 'BoardWrite',
    component: BoardWrite
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/signin',
    name: 'Signin',
    
    component: Signin
    
  },
  {
    path: '/question',
    name: 'Question',
    component: ChatbotQuestion
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

// export default [
//   { path: '/authorize/sign-up', name: 'SignUp', component: () => import(/* webpackChunkName: "authorize.sign-up" */ '../views/member/Signup.vue')  },
//   { path: '/authorize/sign-in', name: 'SignIn', component: () => import(/* webpackChunkName: "authorize.sign-in" */ '../views/member/Signin.vue')  },
// ]