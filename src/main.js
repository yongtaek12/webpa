import './assets/common.css'
import { createApp } from 'vue'
import 'bootstrap'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import store from '@/store'  //1. store 추가
import axiosInstance from '@/plugins/axios'

// 믹스인(mixin)설정을 불러와 적용합니다.
import mixins from "@/mixins";

import VueNavigationBar from "vue-navigation-bar";
import { CkeditorPlugin } from '@ckeditor/ckeditor5-vue';

// 새로고침등을 했을때 로그인이 되어있는지 여부를 다시 체크
import userModel from '@/models/userModel'
if(userModel.isLogin())
{
  store.commit('authorize/setLogin', true)
  userModel.requestMyInfo()
} 
const app = createApp(App)

app.mixin(mixins)
app.component('navigation-bar', VueNavigationBar);
app.config.globalProperties.$axios = axiosInstance
app.config.globalProperties.$axios = axios;  //전역변수로 설정 컴포넌트에서 this.$axios 호출할 수 있음
app.config.globalProperties.$store = store
// BootstrapVue 플러그인 등록
userModel.init(app) // 유틸리티 모듈에 Vue 인스턴스 주입

app
  .use(router)
  .use(store)   //2. store 등록
  .use( CkeditorPlugin )
  .mount('#app')