<template>
    <div class="sign-in-page">
      <!-- <h3>로그인</h3> -->
      <signin-form @submit="onSubmit"/>
      <!-- <p>회원이 아니신가요? <router-link :to="{ name: 'Signup' }">회원가입 하러가기</router-link></p> -->
    </div>
    </template>
    
    <script>
    import SigninForm from '@/views/member/SigninForm'; // 올바른 경로로 수정
    
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

      components: {
        SigninForm
      }
    }
    </script>