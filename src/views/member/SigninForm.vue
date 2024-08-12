<template>
    <form @submit.prevent="onLogin">
      <fieldset>
        <input v-model.trim="formData.loginId" required type="text" placeholder="아이디를 입력해주세요."/>
        <input :type="passwordInputType" v-model.trim="formData.loginPass" required placeholder="비밀번호를 입력해주세요."/>
        <button type="button" @click="togglePasswordVisible">{{passwordViewButtonText}}</button>
        <button type="submit">로그인</button>
      </fieldset>
    </form>
  </template>
  <script>
  import userModel from '@/models/userModel'

  export default {
    name: 'Signin',
    data () {
        return {
          ui: {
            passwordVisible: false
          },
          formData: {
            loginId: '',
            loginPass: ''
          }
        }
      },
    methods: {
      submit () {
        const { email, password } = this
        this.$emit('submit', { email, password })
      }
    },
    computed: {
        passwordInputType () {
          return this.ui.passwordVisible ? 'text' : 'password'    
        },
        passwordViewButtonText () {
          return this.ui.passwordVisible ? '감추기' : '보이기'
        }      
      },  
    methods: {
      togglePasswordVisible () {
        this.ui.passwordVisible=!this.ui.passwordVisible
      },
      onLogin () {
        // 폼검증
        if(this.formData.loginId === '') {
          alert('아이디를 입력하세요');
          return;
        }
        if(this.formData.loginPass === '') {
          alert('비밀번호를 입력하세요');
          return;
        }
        userModel.requestLogin({
          loginId: this.formData.loginId,
          loginPass: this.formData.loginPass
        }).then(() => {        
          // 사용자의 로그인 처리완료시 / 페이지로 이동합니다.        
          this.$router.replace('/')
        })
      }
    }
  }
  </script>



/**
export default {
  name: 'SigninForm',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    submit () {
      const { email, password } = this
      this.$emit('submit', { email, password })
    }
  }
}




