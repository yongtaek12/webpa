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

// 서버 요청에서 발생하는 에러는 app.config.errorHandler에서 자동으로 잡히지 않습니다.
// 이러한 경우는 Axios의 응답 인터셉터를 사용하여 처리해야 합니다.
axios.interceptors.response.use(

    (response) => response,
    (error) => {

        console.error("Axios error: ", error);

        // 에러 정보 추출
        const status = error.response?.status || 500; // 상태 코드 (기본값 500)
        let message;
        if(status ===403){
            message = "너님은 권한이 불충분합니다."
        }
        // const message = error.response?.data?.message || 'An unknown error occurred'; // 에러 메시지
        const details = error.response?.data || {}; // 기타 에러 데이터

        // 에러 페이지로 리디렉션
        router.push({
            name: 'Error',
            query: { status, message, ...details } // 쿼리 파라미터로 에러 정보 전달
        });
//
// Promise 객체는 비동기 작업의 성공 또는 실패를 나타내는 JavaScript 객체로, 나중에 실행될 작업의 결과를 처리할 수 있는 구조입니다. 예를 들어, 네트워크 요청처럼 시간이 걸리는 작업을 수행할 때, Promise 객체를 사용하면 비동기 작업이 완료될 때까지 기다리거나 완료 후 특정 작업을 실행할 수 있습니다.Promise 객체는 다음 세 가지 상태를 가질 수 있습니다:
//
// Pending (대기): 비동기 작업이 진행 중인 상태.
// Fulfilled (이행됨): 비동기 작업이 성공적으로 완료된 상태.
// Rejected (거부됨): 비동기 작업이 실패한 상태.
        return new Promise(() => {}); // 이후 비동기 체인이 멈추도록 빈 Promise 반환
    }
);
// 전역 속성에 axios 인스턴스를 추가합니다.
// 믹스인을 애플리케이션에 추가합니다.
app.mixin(mixins)
app.component('navigation-bar', VueNavigationBar);
app.config.globalProperties.$axios = axiosInstance
app.config.globalProperties.$axios = axios;  //전역변수로 설정 컴포넌트에서 this.$axios 호출할 수 있음
app.config.globalProperties.$serverUrl = '//localhost:8085' //api server
app.config.globalProperties.$store = store
// BootstrapVue 플러그인 등록
userModel.init(app) // 유틸리티 모듈에 Vue 인스턴스 주입

app
  .use(router)
  .use(store)   //2. store 등록
  .use( CkeditorPlugin )
  .mount('#app')