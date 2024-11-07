import { createStore } from 'vuex'

// 회원인증 관련 상태관리 모듈
import authorizeStore from '@/store/auth'

export default createStore({
  namespaced: true, // 네임스페이스 사용

  state: {
    roles: [] // roles 상태 추가

  },
  getters: {
  },
  mutations: {
    SET_ROLES(state, roles) {
      state.roles = roles; // roles 데이터를 상태에 설정
    }
  },
  actions: {
  },
  modules: {
    authorize: authorizeStore // 위에서 로드한 객체를 모듈로 등록해줍니다.
  }
})
