import UserModel from '@/models/userModel'

export default {
  namespaced: true,
  state: () => ({
    isLogin: false,
    loginUser: {
      id: 0, //회원 고유 pk
      nickname: '', // 회원 닉네임
      auth: '' // 권한 레벨
    }
  }),
  // mutations: state를 변경하기 위해 실행되는 것으로 비동기를 해야할 경우
  mutations: {
    // 사용자의 로그인 상태를 체크합니다.
    setLogin(state) {

      // console.log("세션저장확인", state);
      state.isLogin = UserModel.isLogin()

    },
    // 사용자의 정보를 저장합니다.
    setUserInfo(state, payload) {

      state.loginUser.id = payload?.id ?? 0;
      state.loginUser.nickname = payload?.nickName ?? '';
      state.loginUser.auth = payload?.roles ?? '';
      // console.log("세션저장확인2", state);
    }
  },
  getters: {
    isLogin(state) {
      return state.isLogin;
    },
    loginUser(state) {
      return state.loginUser;
    }
  }
}
