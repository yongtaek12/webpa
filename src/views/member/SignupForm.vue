<template>
  <form @submit.prevent="onSubmit">
    <fieldset>
      <input type="email" placeholder="이메일 주소" v-model.trim="formData.email" maxlength="64" required>
      <input type="password" placeholder="비밀번호를 입력해주세요" v-model.trim="formData.password" required>
      <input type="password" placeholder="비밀번호 확인" v-model.trim="formData.passwordConfirm" required>
      <input type="text" placeholder="닉네임" v-model.trim="formData.nickname" maxlength="15" required />

      <input type="text" placeholder="핸드폰 번호" v-model.trim="formData.phone" maxlength="15" :disabled="phoneAuth.certificated||phoneAuth.isSend" @blur="onBlurPhoneInput" @keypress="preventNonNumericInput" required />
      <button type="button" :disabled="phoneAuth.isSend||phoneAuth.certificated||phoneAuth.isLoading" @click="sendPhoneCode">인증번호 발송</button>

      <template v-if="phoneAuth.isSend||phoneAuth.certificated">
        <input type="text" placeholder="인증번호" v-model.trim="formData.phoneAuthCode" maxlength="6" required :disabled="phoneAuth.certificated">
        <button type="button" :disabled="phoneAuth.certificated||phoneAuth.isLoading" @click="checkPhoneAuth">인증 {{phoneAuth.certificated?'완료':'확인'}}</button>
        <p v-if="phoneAuth.isSend">인증 유효시간:{{phoneAuth.remainTime}}초</p>
      </template>

      <div>
        <input id="agree_site" type="checkbox" v-model="formData.agreeSite">
        <label for="agree_site">[필수] 사이트 이용약관에 동의합니다.</label>
      </div>

      <div>
        <input id="agree_privacy" type="checkbox" v-model="formData.agreePrivacy">
        <label for="agree_privacy">[필수] 개인정보 처리방침에 동의합니다.</label>
      </div>

      <div>
        <input id="agree_marketing" type="checkbox" v-model="formData.agreeMarketing">
        <label for="agree_marketing">[선택] 마케팅정보 수신에 동의합니다.</label>
      </div>

      <div>
        <input id="agree_all" type="checkbox" v-model="agreeAll">
        <label for="agree_all">필수 약관에 모두 동의합니다.</label>
      </div>

      <button type="submit">회원가입</button>
    </fieldset>
  </form>
</template>

<style lang="scss" scoped>
input[type="email"],
input[type="text"],
input[type="password"] {
  display: block;
  width: 100%;
}
</style>

<script>
export default {
  name: 'SignupForm',
  data() {
    return {
      // 휴대폰 인증과 관련된 객체
      phoneAuth: {
        certificated: false,      // 휴대폰 번호 인증이 모두 완료되었는지 여부
        isSend: false,            // 인증번호가 발송된 상태인지 여부
        remainTime: 0,            // 인증번호 유효 시간
        remainTimeInterval: null, // 남은 시간 체크를 위한 setInterval 객체
        code: '',                 // REST API에서 응답받은 인증번호를 저장하는 변수
        isLoading: false          // REST API와 통신중인 상태인지에 대한 flag
      },
      // 회원가입을 위해 입력한 정보를 담는 객체
      formData: {
        email: '',           // 이메일 주소
        password: '',        // 비밀번호
        passwordConfirm: '', // 비밀번호 확인
        nickname: '',        // 닉네임
        phone: '',           // 핸드폰 번호
        phoneAuthCode: '',   // 인증번호
        agreeSite: false,    // 사이트 이용약관 동의 여부
        agreePrivacy: false, // 개인정보 처리방침 동의 여부
        agreeMarketing: false // 마케팅 정보 수신 동의 여부
      }
    };
  },
  computed: {
    /**
     * 필수항목 전체 동의하기
     */
    agreeAll: {
      get() {
        return this.formData.agreeSite && this.formData.agreePrivacy;
      },
      set(value) {
        this.formData.agreeSite = value;
        this.formData.agreePrivacy = value;
      }
    }
  },
  methods: {
    /**
     * 입력박스에서 키를 입력할시 숫자만 입력가능하도록 한다.
     */
    preventNonNumericInput(e) {
      if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== '-' && (e.key < '0' || e.key > '9')) {
        e.preventDefault();
      }
    },
    /**
     * 올바른 휴대폰 번호인지 검증한뒤, 올바른 휴대폰 번호라면 자동으로 하이픈을 추가한다.
     * @param value
     * @returns {*|string}
     */
    validatePhoneNumber(value) {
      const phoneRegex = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
      const phoneWithHypenRegex = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$/;
      // 입력한 핸드폰 번호에서 하이픈(-)을 제거한다.
      var transNum = value.replace(/\s/gi, '').replace(/-/gi, '');

      // 하이픈 제거후 글자수가 11글자 또는 10글자여야 한다.
      if (transNum.length === 11 || transNum.length === 10) {
        // 정규표현식을 이용하여 올바른 휴대폰 번호인지 검증한다
        if (phoneRegex.test(transNum)) {
          // 휴대폰 번호 규칙에 따라 하이픈을 다시 추가한다.
          transNum = transNum.replace(phoneWithHypenRegex, '$1-$2-$3');
          return transNum;
        }
      }
      return '';
    },
    /**     
     * 휴대폰번호 입력 Input 에서 Blur(포커스를 잃을떄) 발생하는 이벤트     
     */
    onBlurPhoneInput() {
      if (this.formData.phone === '') return;

      const transNum = this.validatePhoneNumber(this.formData.phone);
      if (transNum === '') {
        alert('올바른 형식의 휴대폰 번호가 아닙니다.');
        this.formData.phone = '';
      }
      else {
        this.formData.phone = transNum;
      }
    },
    /**     
     * 휴대폰 인증번호 발송하기     
     */
    sendPhoneCode() {
      // 현재 인증상태를 초기화 한다.
      this.phoneAuth.certificated = false;
      // 이미 인증번호 발송을 실행한 상태라면 중복 실행 방지
      if (this.phoneAuth.isLoading) {
        return;
      }

      // 휴대폰번호 검증처리
      if (this.formData.phone.length === 0) {
        alert('올바른 형식의 휴대폰 번호가 아닙니다.');
        return;
      }

      // 휴대폰 번호 발송중으로 flag 처리
      this.phoneAuth.isLoading = true;
      this.$axios.post(this.$serverUrl +'/users/authorize/phone', {
        phone: this.formData.phone
      }).then(res => {
        this.formData.phoneAuthCode = '';
        this.phoneAuth.code = res.data.result.authCode; // REST API로 받은 인증코드를 담아둔다.
        this.phoneAuth.isSend = true;    // 인증코드 발송여부를 true로 변경
        this.phoneAuth.remainTime = 180; // 남은 입력시간 180초로 설정

        // 1초마다 실행되도록 setInterval설정.
        // 남은시간을 처리하고, 입력시간을 초과하면 인증번호 발송상태를 초기화 한다.
        this.phoneAuth.remainTimeInterval = setInterval(() => {
          if (this.phoneAuth.remainTime <= 1) {
            this.resetPhoneAuth();
          }
          this.phoneAuth.remainTime--;
        }, 1000);
      }).finally(() => {
        // 휴대폰번호 발송중 flag 처리
        this.phoneAuth.isLoading = false;
      });
    },
    /** 
     * 인증번호 발송상태 초기화 
     */
    resetPhoneAuth() {
      // 입력시간 setInterval을 해제한다.
      if (this.phoneAuth.remainTimeInterval !== null) {
        clearInterval(this.phoneAuth.remainTimeInterval);
        this.phoneAuth.remainTimeInterval = null;
      }
      // 입력시간과, 핸드폰인증상태, 인증번호 발송상태 flag를 초기화한다.
      this.phoneAuth.remainTime = 0;
      this.phoneAuth.isSend = false;
      this.phoneAuth.certificated = false;
    },
    /** 
     * 입력한 인증번호가 백엔드에서 받은 인증번호와 동일한지 체크한다. 
     */
    checkPhoneAuth() {
      if (this.formData.phoneAuthCode.toString() === this.phoneAuth.code.toString()) {
        this.resetPhoneAuth();
        this.phoneAuth.certificated = true;
      } else {
        alert('인증번호가 맞지 않습니다.');
      }
    },
    /** 
     * 회원가입 폼검증 및 폼전송 
     */
    onSubmit() {
      // 아이디 검증
      if (this.formData.email === '') {
        alert('이메일 주소는 필수입력입니다.');
        return;
      }
      const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(this.formData.email)) {
        alert('올바른 형식의 이메일 주소가 아닙니다');
        return;
      }
      // 닉네임 검증
      if (this.formData.nickname === '') {
        alert('닉네임은 필수입력입니다.');
        return;
      }
      if (this.formData.nickname.length < 2 || this.formData.nickname.length > 15) {
        alert("닉네임은 2자리 이상, 15자리까지 입력가능 합니다.");
        return;
      }

      // 비밀번호 검증
      if (this.formData.password === '') {
        alert('비밀번호는 필수입력입니다.');
        return;
      }
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*])/;
      if (!passwordRegex.test(this.formData.password)) {
        alert('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.');
        return;
      }
      // 비밀번호 확인 검증
      if (this.formData.password !== this.formData.passwordConfirm) {
        alert('비밀번호와 비밀번호 확인이 서로 다릅니다.');
        return;
      }
      // 휴대폰 인증 확인
      if (!this.phoneAuth.certificated || this.formData.phone === '') {
        alert('휴대폰 번호 인증을 완료하셔야 합니다.');
        return;
      }

      // 필수동의항목 확인
      if (!this.formData.agreeSite) {
        alert("사이트 이용약관에 동의하셔야 합니다.");
        return;
      }
      if (!this.formData.agreePrivacy) {
        alert("개인정보 처리방침에 동의하셔야 합니다.");
        return;
      }

      // REST API로 전송
      this.$axios.post('/users', {
        email: this.formData.email,
        password: this.formData.password,
        passwordConfirm: this.formData.passwordConfirm,
        nickname: this.formData.nickname,
        phone: this.formData.phone,
        agreeSite: this.formData.agreeSite,
        agreePrivacy: this.formData.agreePrivacy,
        agreeMarketing: this.formData.agreeMarketing
      }).then(() => {
        alert("회원 등록이 완료되었습니다.");
        this.$router.replace('/authorize/sign-in');
      });
    }
  }
};
</script>
