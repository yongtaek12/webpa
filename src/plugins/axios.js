import $axios from 'axios'
import store from '@/store'
import userModel from '@/models/userModel'
import router from "@/router";
//모든 axios 요청에 세션 쿠키 포함
$axios.defaults.withCredentials = true;
// eslint-disable-next-line no-unused-vars
let vueInstance = null;

class AxiosExtend {
    instance = null

    /**
     * Vue 인스턴스를 초기화합니다.
     */
    init(app) {
        vueInstance = app;
    }
    // Token 만료 응답을 받을시, Token 재생성 요청을 다시 보내기 위한 flag
    // 토큰 재생성은 무한으로 요청하지 않고, 한번만 요청하기 위해 사용합니다.
    isAlreadyFetchingAccessToken = false
    subscribers = []

    constructor() {
        this.instance = $axios.create({
            baseURL: process.env.NODE_ENV === 'production' ? '릴리즈서버 REST API URI' : 'http://127.0.0.1:3000',
            //timeout: 10000,
            timeout: 100000000000,
            withCredentials: true
        })

        // 요청 인터셉터 설정
        this.instance.interceptors.request.use(
            config => {
                // 요청 헤더에 accessToken을 추가합니다.
                const accessToken = localStorage.getItem('accessToken')
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`
                }
                return config
            },
            error => Promise.reject(error)
        )

        // 응답 인터셉터 설정
        this.instance.interceptors.response.use(

            response => response,
            async error => {
                console.log("비동기 error : ", error);


                // 응답 코드가 401일 경우에 처리합니다.
                if (error.response?.status === 401) {
                    const { config } = error
                    const originalRequest = config // 토큰 재발급후 원래 요청을 다시 보내기 위해 사용합니다.
                    console.log("originalRequest1 : ", originalRequest.url);
                    // const serverUrl = vueInstance?.config?.globalProperties?.$serverUrl;

                    // 토큰재발급 요청을 보낸적이 없을경우
                    if (!this.isAlreadyFetchingAccessToken) {
                        this.isAlreadyFetchingAccessToken = true // 토큰 재발급요청 flag 를 TRUE로 변경해둡니다.
                        // 토큰 재발급 요청을 보냅니다.


                         this.instance.post('//localhost:8085'+'/users/authorize/token', {
                            refreshToken: localStorage.getItem('refreshToken')
                        }).then(r => {
                            // 토큰 재발급 요청에 성공하면 flag는 다시 true로 변경해줍니다.
                            this.isAlreadyFetchingAccessToken = false
                            // LocalStorage의 값을 업데이트 해줍니다.
                            localStorage.setItem('refreshToken', r.data.refreshToken)
                            localStorage.setItem('accessToken', r.data.accessToken)
                            store.commit('authorize/setLogin', true)

                            this.subscribers.forEach(callback => callback(r.data.accessToken))
                            this.subscribers = []
                        }).catch(() => {
                            this.handleRefreshTokenError()
                        })
                    }

                    else {
                        console.log("재요청안함.");
                        window.localStorage.removeItem('accessToken')
                        window.localStorage.removeItem('refreshToken')
                        originalRequest.headers.Authorization = null
                        store.commit('authorize/setLogin', false)
                        store.commit('authorize/setUserInfo', null)
                        // return this.retryOriginalRequest(originalRequest)
                    }
                    // 로그인된 상태라면 내 정보를 다시 가져옵니다.
                    // if (userModel.isLogin()) {
                    //     await userModel.requestMyInfo()
                    // }
                    return this.retryOriginalRequest(originalRequest);
                } else {
                    this.handleErrorResponse(error)
                }

                 // return Promise.reject(error)
                return new Promise(() => {}); // 이후 비동기 체인이 멈추도록 빈 Promise 반환
            }
        )
    }

    // 토큰 재발급 에러 처리
    handleRefreshTokenError() {

        console.log("handleRefreshTokenError")
        window.localStorage.removeItem('accessToken')
        window.localStorage.removeItem('refreshToken')
        store.commit('authorize/setLogin', false)
        store.commit('authorize/setUserInfo', null)
    }

    // 원래 요청 재시도
    retryOriginalRequest(originalRequest) {
        return new Promise(resolve => {
            this.subscribers.push(accessToken => {
                // Authorization 헤더 업데이트
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // 요청 전 로그 출력
                console.log("=== Retry Original Request ===");
                console.log("URL:", originalRequest.url);
                console.log("Method:", originalRequest.method);
                console.log("Headers:", originalRequest.headers);
                console.log("Params:", originalRequest.params || {});
                console.log("Data (Body):", originalRequest.data || {});
                console.log("==============================");

                // 요청 실행 및 결과 확인
                this.instance(originalRequest)
                    .then(response => {
                        console.log("=== Request Success ===");
                        console.log("Response Data:", response.data);
                        console.log("Response Status:", response.status);
                        console.log("=======================");
                        resolve(response);
                    })
                    .catch(error => {
                        console.error("=== Request Failed ===");
                        console.error("Error Message:", error.message);
                        console.error("Response Status:", error.response?.status || "Unknown");
                        console.error("Response Data:", error.response?.data || {});
                        console.error("======================");
                        resolve(Promise.reject(error)); // 에러를 그대로 전달
                    });
            });
        });
    }


    // 일반적인 에러 응답 처리
    handleErrorResponse(error) {
        try {
            let message
            let status = error.response?.status
            console.log("여기로 빠지나?? ", error.response?.status);

            if (error.response?.data?.error) {
                message = error.response.data.error
            } else {
                switch (error.response?.status) {
                    case 0:
                        message = "REST API 서버에 접근할 수 없습니다\n서버 관리자에게 문의하세요"
                        break
                    case 400:
                        message = '잘못된 요청입니다.'
                        break
                    case 403:
                        message = '권한이 불충분합니다.'
                        break
                    case 404:
                        message = '[404] REST API 요청에 실패하였습니다'
                        break
                    case 500:
                        message = '서버에서 처리중 오류가 발생하였습니다.'
                        break
                    default:
                        console.log("default ", error.response?.status);
                        message = "잘못된 요청입니다."
                        break
                }
            }

            // alert(message)
            const details = error.response?.data || {}; // 기타 에러 데이터

            // 에러 페이지로 리디렉션
            router.push({
                name: 'Error',
                query: { status, message, ...details } // 쿼리 파라미터로 에러 정보 전달
            });
        // Promise 객체는 비동기 작업의 성공 또는 실패를 나타내는 JavaScript 객체로, 나중에 실행될 작업의 결과를 처리할 수 있는 구조입니다. 예를 들어, 네트워크 요청처럼 시간이 걸리는 작업을 수행할 때, Promise 객체를 사용하면 비동기 작업이 완료될 때까지 기다리거나 완료 후 특정 작업을 실행할 수 있습니다.Promise 객체는 다음 세 가지 상태를 가질 수 있습니다:
        //
        // Pending (대기): 비동기 작업이 진행 중인 상태.
        // Fulfilled (이행됨): 비동기 작업이 성공적으로 완료된 상태.
        // Rejected (거부됨): 비동기 작업이 실패한 상태.
        //             return new Promise(() => {}); // 이후 비동기 체인이 멈추도록 빈 Promise 반환
        }catch (error){
            console.log("여기로 빠지나?22? ", error);

        }

    }
}

const axios = new AxiosExtend()
export default axios.instance
