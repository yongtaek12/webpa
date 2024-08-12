import $axios from 'axios'
import store from '@/store'
import userModel from '@/models/userModel'
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
            timeout: 10000,
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
                const { config } = error
                const originalRequest = config // 토큰 재발급후 원래 요청을 다시 보내기 위해 사용합니다.

                // 응답 코드가 401일 경우에 처리합니다.
                if (error.response?.status === 401) {
                    // 토큰재발급 요청을 보낸적이 없을경우
                    if (!this.isAlreadyFetchingAccessToken) {
                        this.isAlreadyFetchingAccessToken = true // 토큰 재발급요청 flag 를 TRUE로 변경해둡니다.

                        // 토큰 재발급 요청을 보냅니다.
                        const serverUrl = vueInstance.config.globalProperties.$serverUrl;
                        await this.instance.post(serverUrl+'/users/authorize/token', {
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
                    } else {
                        return this.retryOriginalRequest(originalRequest)
                    }

                    // 로그인된 상태라면 내 정보를 다시 가져옵니다.
                    if (userModel.isLogin()) {
                        await userModel.requestMyInfo()
                    }
                } else {
                    this.handleErrorResponse(error)
                }

                return Promise.reject(error)
            }
        )
    }

    // 토큰 재발급 에러 처리
    handleRefreshTokenError() {
        window.localStorage.removeItem('accessToken')
        window.localStorage.removeItem('refreshToken')
        store.commit('authorize/setLogin', false)
        store.commit('authorize/setUserInfo', null)
    }

    // 원래 요청 재시도
    retryOriginalRequest(originalRequest) {
        return new Promise(resolve => {
            this.subscribers.push(accessToken => {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                resolve(this.instance(originalRequest))
            })
        })
    }

    // 일반적인 에러 응답 처리
    handleErrorResponse(error) {
        let message

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
                case 404:
                    message = '[404] REST API 요청에 실패하였습니다'
                    break
                case 500:
                    message = '서버에서 처리중 오류가 발생하였습니다.'
                    break
                default:
                    message = "잘못된 요청입니다."
                    break
            }
        }

        alert(message)
    }
}

const axios = new AxiosExtend()
export default axios.instance
