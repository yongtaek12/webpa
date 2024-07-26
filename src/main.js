import './assets/common.css'
import { createApp } from 'vue'
import 'bootstrap'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import store from './vuex/store'  //1. store 추가

// 새로고침등을 했을때 로그인이 되어있는지 여부를 다시 체크
import userModel from '@/models/userModel'
if(userModel.isLogin())
{
  store.commit('authorize/setLogin', true)
  userModel.requestMyInfo()
} 
const app = createApp(App)
app.config.globalProperties.$axios = axios;  //전역변수로 설정 컴포넌트에서 this.$axios 호출할 수 있음
app.config.globalProperties.$serverUrl = '//localhost:8085' //api server
app.config.globalProperties.$store = store
app
  .use(router)
  .use(store)   //2. store 등록
  .mount('#app')