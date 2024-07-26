<template>
    <div class="sign-in-page">
      <h3>로그인</h3>
      <signin-form @submit="onSubmit"/>
      <p>회원이 아니신가요? <router-link :to="{ name: 'Signup' }">회원가입 하러가기</router-link></p>
    </div>
    </template>
    
    <script>
    import userModel from '@/models/userModel'
    import SigninForm from '@/views/member/SigninForm'; // 올바른 경로로 수정
    import { mapActions } from 'vuex'
    
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
      methods: {
        onSubmit (payload) {
          this.signin(payload).then(res => {
            alert('로그인 되었습니다.')
            this.$router.push({ name: 'PostListPage' })
          }).catch(err => {
            alert(err.response.data.msg)
          })
        },
        ...mapActions([ 'signin' ])
      },
      components: {
        SigninForm
      }
         */