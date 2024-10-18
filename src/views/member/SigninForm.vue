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
                <div class="form__heading">회원 가입</div>
                <label class="form__field">
                  <span class="form__field-label">Email</span>
                  <input v-model="formData.registerEmail" class="form__field-input" type="text" placeholder="이메일을 입력해주세요" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">Password</span>
                  <input v-model="formData.registerPass" class="form__field-input" type="password" placeholder="비밀번호를 입력해주세요" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">PasswordConfirm</span>
                  <input v-model="formData.registerPasswordConfirm" class="form__field-input" type="password" placeholder="비밀번호 확인" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">Name</span>
                  <input v-model="formData.registerName" class="form__field-input" type="text" placeholder="이름을 입력해주세요" />
                </label>
                <label class="form__field">
                  <span class="form__field-label">Phone</span>
                  <input v-model="formData.registerPhone" class="form__field-input" type="text" placeholder="핸드폰번호를 입력해주세요" />
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
        registerPhone: '',
        registerPasswordConfirm:'',
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
      if (this.formData.registerEmail === '') {
        alert('이메일을 입력하세요');
        return;
      }
      if (this.formData.registerPass === '') {
        alert('패스워드를 입력하세요');
        return;
      }
      if (this.formData.registerName === '') {
        alert('닉네임을 입력하세요');
        return;
      }
      if (this.formData.registerPhone === '') {
        alert('핸드폰번호를 입력하세요');
        return;
      }
      const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      const phoneRegex = /^(01[016789])-?\d{3,4}-?\d{4}$/;

      if(! emailRegex.test(this.formData.registerEmail)) {
        alert('올바른 형식의 이메일 주소가 아닙니다');
        return;
      }
      if(! phoneRegex.test(this.formData.registerPhone)) {
        alert('올바른 형식의 핸드폰번호가 아닙니다');
        return;
      }
      if(this.formData.registerName.length < 2 || this.formData.registerName.length > 15)
      {
        alert("닉네임은 2자리 이상, 15자리까지 입력가능 합니다.");
        return;
      }

      if(! passwordRegex.test(this.formData.registerPass)) {
        alert('비밀번호는 8자 이상, 하나이상의 문자,숫자 및 특수문자를 사용하셔야 합니다');
        return;
      }
      // 비밀번호 확인 검증
      if(this.formData.registerPass !== this.formData.registerPasswordConfirm) {
        alert('비밀번호와 비밀번호 확인이 서로 다릅니다.');
        return;
      }
        // alert('회원가입 폼 제출');
      userModel.requestSignUp({
        registerEmail: this.formData.registerEmail,
        registerPass: this.formData.registerPass,
        registerName: this.formData.registerName,
        registerPhone: this.formData.registerPhone,
        registerPasswordConfirm: this.formData.registerPasswordConfirm
      }).then(() => {
        this.$router.replace('/about');
      });
    }
  }
};
</script>

<style lang="scss">
  @import '@/plugins/login'; // 챗봇 스타일 임포트
</style>


