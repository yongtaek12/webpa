// import store from './vuex/store'  //1. store 추가
import store from '@/store'
import axios from '@/plugins/axios'
import router from "@/router";
let vueInstance = null;


const exportObject = {
    /**
     * Vue 인스턴스를 초기화합니다.
     */
    init(app) {
        vueInstance = app;
    },

    /**
     * 사용자의 로그인 여부를 확인합니다.
     */
    isLogin: () => {
        // console.log("isLogin", localStorage)
        const accessToken = localStorage.getItem('accessToken');
        return !!(accessToken && accessToken !== 'undefined');
    },
    /*
    * REST API 서버로 로그인 요청을 보냅니다.
    */
   requestLogin: async (payload) => {
    const serverUrl = vueInstance.config.globalProperties.$serverUrl;
    return await axios
           .post(serverUrl +'/users/authorize', {
               loginId: payload.loginId,
               loginPass: payload.loginPass,
           })
           .then(async (res) => {
               console.log("Login : ", res)


               if(res.status ===200){

                   // window.location.replace("/");
                   // 정상적으로 응답을 받은경우, processLogin 함수를 실행합니다

                    await exportObject.processLogin(res.data)

               }

           })
            .catch(error => {
                console.error('Error during login:', error);
            });
   },
    /*
    * REST API 서버로 회원가입 요청을 보냅니다.
    */
    requestSignUp: async (payload) => {
        const serverUrl = vueInstance.config.globalProperties.$serverUrl;
        return await axios
            .post(serverUrl +'/users', {
                registerEmail: payload.registerEmail,
                registerPass: payload.registerPass,
                registerName: payload.registerName,
                registerPhone: payload.registerPhone,
                registerPasswordConfirm: payload.registerPasswordConfirm,

            })
            .then(async (res) => {
                // console.log("console : ", res)
                // 정상적으로 응답을 받은경우, processLogin 함수를 실행합니다.
                await exportObject.processLogin(res.data)
            })
    },
    /**
     * 로그인이 완료 된경우, 응답데이타를 이용하여 클라이언트에 토큰을 저장합니다. session 기반
     */
    processLogin2: async (result) => {
        // vuex 상태관리에서 현재 로그인 상태를 TRUE 로 변경합니다.
        localStorage.setItem('accessToken', result.cookie);

        store.commit('authorize/setLogin', true);
        // res 객체를 선언 및 초기화
        const res = {
            id: 10,
            nickname: result.loginId+'  님         ',// 회원 닉네임
            auth: result.rolesList// 권한 레벨
        };

        store.commit('authorize/setUserInfo', res);


    },
   /**
    * 로그인이 완료 된경우, 응답데이타를 이용하여 클라이언트에 토큰을 저장합니다.
    */
   processLogin: async (result) => {

       // AccessToken 과 refreshToken 발급에 성공한 경우
       if (result?.accessToken && result?.refreshToken) {
           // LocalStorage에 accessToken과 refreshToken을 저장합니다.
           localStorage.setItem('accessToken', result?.accessToken);
           localStorage.setItem('refreshToken', result?.refreshToken);

           // vuex 상태관리에서 현재 로그인 상태를 TRUE 로 변경합니다.
           store.commit('authorize/setLogin', true);

           // REST API에 내 정보를 요청합니다.
           await exportObject.requestMyInfo()
        }
            // 발급에 실패한경우, 기존에 남아있는 데이타를 삭제합니다.
        else {
            // vuex 상태관리에서 현재 로그인 상태를 FALSE 로 변경합니다.
            store.commit('authorize/setLogin', false);

            // vuex 상태관리에서 현재 내정보를 빈값으로 로 변경합니다.
            store.commit('authorize/setUserInfo', null);

            // LocalStorage에 있는 데이타를 모두 삭제합니다.
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            alert('사용자 로그인에 실패하였습니다.')
        }
    },
    /**
     * 로그아웃 처리
     */
    processLogOut: async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        store.commit('authorize/setLogin', false);
        store.commit('authorize/setUserInfo', null);
        return router.push({ path: '/' });
    },

    /**
    * REST API로 내 정보를 가져옵니다.
    */
    requestMyInfo: async () => {

        const accessToken = localStorage.getItem('accessToken');
        return await axios.get('//localhost:8085/users', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(res => {
            // console.log("requestMyInfo sucesses", res )

            store.commit('authorize/setUserInfo', res.data);
        }).catch(err => {
            console.error('Error fetching user info:', err);
        });
    },

}

export default exportObject     