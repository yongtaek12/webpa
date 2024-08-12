<template>
  <div class="sign-up-page">
    <h3>회원가입</h3>
    <signup-form @submit="onSubmit" />
    <p>이미 가입하셨나요? <router-link :to="{ name: 'Signin' }">로그인 하러가기</router-link></p>
  </div>
</template>

<script>
import SignupForm from '@/views/member/SignupForm'
import axios from 'axios'

export default {
  name: 'Signup',
  methods: {
    async onSubmit(payload) {
      const { email, password, name } = payload;
      if (!email) {
        alert('이메일을 입력해주세요.');
        return;
      } else if (!password) {
        alert('비밀번호를 입력해주세요.');
        return;
      } else if (!name) {
        alert('이름을 입력해주세요.');
        return;
      }

      try {
        const response = await axios.post('/auth/signup', { name, email, password });
        alert('회원가입이 완료되었습니다.');
        this.$router.push({ name: 'Signin' });
      } catch (err) {
        if (err.response && err.response.data && err.response.data.msg) {
          alert(err.response.data.msg);
        } else {
          alert('서버 오류가 발생했습니다. 나중에 다시 시도해주세요.');
        }
      }
    }
  },
  components: {
    SignupForm
  }
}
</script>
