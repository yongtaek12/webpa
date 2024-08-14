<template>
  <div class="local-container">
    <div :class="['demo', { 's--switched': switched }]">
      <div class="demo__inner">
        <div class="demo__forms">
          <div class="demo__form">
            <div class="demo__form-content">
              <form @submit.prevent="onLogin" class="form">
                <div class="form__heading">안녕하세요</div>
                <label class="form__field">
                  <span class="form__field-label">Email</span>
                  <input v-model="formData.loginId" class="form__field-input" type="text" placeholder="아이디를 입력해주세요" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">Password</span>
                  <input :type="passwordInputType" v-model="formData.loginPass" class="form__field-input" placeholder="비밀번호를 입력해주세요" />
                </label>
                <button type="submit" class="form__submit">로그인</button>
              </form>
            </div>
          </div>
          <div class="demo__form">
            <div class="demo__form-content">
              <form @submit.prevent="onRegister" class="form">
                <div class="form__heading">Time to feel like home</div>
                <label class="form__field">
                  <span class="form__field-label">Name</span>
                  <input v-model="formData.registerName" class="form__field-input" type="text" placeholder="이름을 입력해주세요" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">Email</span>
                  <input v-model="formData.registerEmail" class="form__field-input" type="text" placeholder="이메일을 입력해주세요" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">Phone</span>
                  <input v-model="formData.registerEmail" class="form__field-input" type="text" placeholder="핸드폰번호를 입력해주세요" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">Password</span>
                  <input v-model="formData.registerPass" class="form__field-input" type="password" placeholder="비밀번호를 입력해주세요" />
                </label>
                <button type="submit" class="form__submit">회원가입</button>
              </form>
            </div>
          </div>
        </div>
        <div class="demo__switcher">
          <div class="demo__switcher-inner">
            <div class="demo__switcher-content">
              <div class="demo__switcher-text">
                <div>
                  <h3>New here?</h3>
                  <p>Sign up and discover great amount of new opportunities!</p>
                </div>
                <div>
                  <h3>One of us?</h3>
                  <p>If you already have an account, just sign in. We&apos;ve missed you!</p>
                </div>
              </div>
              <button @click="toggleSwitched" class="demo__switcher-btn">
                <span class="animated-border"></span>
                <span class="demo__switcher-btn-inner">
                  <span>회원가입</span>
                  <span>로그인</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userModel from '@/models/userModel';

export default {
  data() {
    return {
      switched: false,
      formData: {
        loginId: '',
        loginPass: '',
        registerName: '',
        registerEmail: '',
        registerPass: ''
      },
      ui: {
        passwordVisible: false
      }
    };
  },
  computed: {
    passwordInputType() {
      return this.ui.passwordVisible ? 'text' : 'password';
    }
  },
  methods: {
    toggleSwitched() {
      console.log("Toggle Switched Called");

      this.switched = !this.switched;
    },
    togglePasswordVisible() {
      this.ui.passwordVisible = !this.ui.passwordVisible;
    },
    onLogin() {
      if (this.formData.loginId === '') {
        alert('아이디를 입력하세요');
        return;
      }
      if (this.formData.loginPass === '') {
        alert('비밀번호를 입력하세요');
        return;
      }
      userModel.requestLogin({
        loginId: this.formData.loginId,
        loginPass: this.formData.loginPass
      }).then(() => {
        this.$router.replace('/about');
      });
    },
    onRegister() {
      // 회원가입 로직을 여기에 추가하세요.
      alert('회원가입 폼 제출');
    }
  }
};
</script>

<style lang="scss">
  @import '@/plugins/login'; // 챗봇 스타일 임포트
</style>


