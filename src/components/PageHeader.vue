<template>
  <header>
    <div class="page-wrapper">
      <div class="nav-wrapper">
        <div class="grad-bar"></div>
        <nav class="navbar">
          <img class="company-logo" src="@/assets/images/logo.gif" alt="Company Logo" />
          <div class="menu-toggle" @click="toggleMobileMenu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
          <ul :class="['nav', { 'search': isSearchActive, 'no-search': !isSearchActive, 'mobile-nav': isMobileNavActive }]">
            <!-- 모든 router-link에 closeMobileMenu 메서드 추가 -->
            <li class="nav-item"><router-link to="/" @click="closeMobileMenu">Home</router-link></li>
            <li class="nav-item"><router-link to="/about" @click="closeMobileMenu">About</router-link></li>
            <li class="nav-item"><router-link to="/board/list" @click="closeMobileMenu">Board</router-link></li>
            <li class="nav-item"><router-link to="/review/list" @click="closeMobileMenu">Reviews</router-link></li>
            <li class="nav-item"><router-link to="/question" @click="closeMobileMenu">Chatbot Inquiry</router-link></li>

            <i class="fas fa-search" id="search-icon" @click="toggleSearch"></i>
            <input class="search-input" type="text" placeholder="검색어를 " :class="{ 'search-active': isSearchActive }" />
          </ul>
        </nav>
      </div>
    </div>
    <div class="top-bar">
      <div id="nav" class="nav-links">
        <template v-if="isLogin">
          안녕하세요! {{ loginUser.nickname }} 님
          <img @click="signOut" class="company-logo" src="@/assets/images/logout.gif" alt="logout" style="cursor: pointer;" />
          <!-- ROLE_ADMIN일 때만 관리자 이미지 표시 -->
          <img v-if="isAdmin" type="button" @click="adminPage" class="company-logo" src="@/assets/images/admin.png" alt="administrator" style="cursor: pointer;" />

        </template>
        <template v-else>
          <!-- 로그인 링크에도 메뉴 닫기 추가 -->
          <router-link to="/signin" @click="closeMobileMenu">로그인</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import userModel from '@/models/userModel'
export default {

  data() {
    return {
      isSearchActive: false,
      isMobileNavActive: false,
    };
  },
  methods:{
    toggleSearch() {
      this.isSearchActive = !this.isSearchActive;
    },
    toggleMobileMenu() {
      // 햄버거 버튼 클릭 시 메뉴를 열고 닫는 기존 로직
      this.isMobileNavActive = !this.isMobileNavActive;
    },
    // 새로 추가된 메뉴 닫기 메서드
    closeMobileMenu() {
      if (this.isMobileNavActive) {
        this.isMobileNavActive = false;
      }
    },
    signOut () {
      if(! confirm('로그아웃 하시겠습니까?')) return
      userModel.processLogOut();
    },
    adminPage() {
      this.$router.push('/admin');
    }
  },
  computed: {
    isAdmin() {
      //roop 돌아서 admin 있는경우 관리자 페이지 이동 아이콘 보이기
      return this.loginUser.auth === 'ROLE_ADMIN'
          || this.loginUser.auth === 'ROLE_MANAGER';
    },
    ...mapGetters('authorize', ['isLogin', 'loginUser'])
  }
}
</script>
<style>
.navbar img {
  height: 50px !important; /* 원하는 높이로 변경 */
  width: auto !important;
  justify-self: start;
  margin-left: 20px;
}
.company-logo {
  height: 50px !important; /* 원하는 높이로 변경 */
  width: auto !important;
}
/* Include the same CSS as provided earlier */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Lato', 'Arial', sans-serif;
}

/* HEADINGS */

h1, p {
  color: #fff;
  text-align: center;
  line-height: 1.4;
}

h1 {
  font-size: 2.2rem;
}

h2 {
  color: #000;
  font-size: 1.3rem;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 10px;
}

/* BASIC SETUP */

.page-wrapper {
  width: 100%;
  height: auto;
}

.nav-wrapper {
  width: 100%;
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 0;
  background-color: #fff;
}

.grad-bar {
  width: 100%;
  height: 5px;
  background: linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB);
  background-size: 400% 400%;
  -webkit-animation: gradbar 15s ease infinite;
  -moz-animation: gradbar 15s ease infinite;
  animation: gradbar 15s ease infinite;
}

/* NAVIGATION */

.navbar {
  display: grid;
  grid-template-columns: 1fr 3fr;
  align-items: center;
  height: 50px;
  overflow: hidden;
}

.navbar img {
  height: 16px;
  width: auto;
  justify-self: start;
  margin-left: 20px;
}

.navbar ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  justify-self: end;
}

.nav-item a {
  color: #000;
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.3s ease-out;
}

.nav-item a:hover {
  color: #3498db;
}

/* SECTIONS */

.headline {
  width: 100%;
  height: 50vh;
  min-height: 350px;
  background: linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1435224668334-0f82ec57b605?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDd8fHxlbnwwfHx8fA%3D%3D&w=1000&q=80');
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.features {
  width: 100%;
  height: auto;
  background-color: #f1f1f1;
  display: flex;
  padding: 50px 20px;
  justify-content: space-around;
}

.feature-container {
  flex-basis: 30%;
  margin-top: 10px;
}

.feature-container p {
  color: #000;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 15px;
}

.feature-container img {
  width: 100%;
  margin-bottom: 15px;
}

/* SEARCH FUNCTION */

#search-icon {
  font-size: 0.9rem;
  margin-top: 3px;
  margin-left: 15px;
  transition: color 0.3s ease-out;
}

#search-icon:hover {
  color: #3498db;
  cursor: pointer;
}

.search {
  transform: translate(-45%);
  -webkit-transform: translate(-45%);
  transition: transform 0.7s ease-in-out;
  color: #3498db;
}

.no-search {
  transform: translate(0);
  transition: transform 0.7s ease-in-out;
}

.search-input {
  position: absolute;
  top: -4px;
  right: -185px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.9s ease;
}

.search-active {
  opacity: 1;
  z-index: 0;
}

input {
  border: 0;
  border-left: 1px solid #ccc;
  border-radius: 0; /* FOR SAFARI */
  outline: 0;
  padding: 5px;
}

/* MOBILE MENU & ANIMATION */

.menu-toggle .bar {
  width: 25px;
  height: 3px;
  background-color: #3f3f3f;
  margin: 5px auto;
  -webkit-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
}

.menu-toggle {
  justify-self: end;
  margin-right: 25px;
  display: none;
}

.menu-toggle:hover {
  cursor: pointer;
}

#mobile-menu.is-active .bar:nth-child(2) {
  opacity: 0;
}

#mobile-menu.is-active .bar:nth-child(1) {
  -webkit-transform: translateY(8px) rotate(45deg);
  -ms-transform: translateY(8px) rotate(45deg);
  -o-transform: translateY(8px) rotate(45deg);
  transform: translateY(8px) rotate(45deg);
}

#mobile-menu.is-active .bar:nth-child(3) {
  -webkit-transform: translateY(-8px) rotate(-45deg);
  -ms-transform: translateY(-8px) rotate(-45deg);
  -o-transform: translateY(-8px) rotate(-45deg);
  transform: translateY(-8px) rotate(-45deg);
}

/* KEYFRAME ANIMATIONS */

@-webkit-keyframes gradbar {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@-moz-keyframes gradbar {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradbar {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Media Queries */

/* Mobile Devices - Phones/Tablets */

@media only screen and (max-width: 720px) {
  .features {
    flex-direction: column;
    padding: 50px;
  }

  /* MOBILE HEADINGS */

  h1 {
    font-size: 1.9rem;
  }

  h2 {
    font-size: 1rem;
  }

  p {
    font-size: 0.8rem;
  }

  /* MOBILE NAVIGATION */

  .navbar ul {
    display: flex;
    flex-direction: column;
    position: fixed;
    justify-content: start;
    top: 55px;
    background-color: #fff;
    width: 100%;
    height: calc(100vh - 55px);
    transform: translate(-101%);
    text-align: center;
    overflow: hidden;
    transition: transform 0.3s ease-in-out; /* 메뉴가 부드럽게 닫히도록 전환 효과 추가 */
  }

  .navbar li {
    padding: 15px;
  }

  .navbar li:first-child {
    margin-top: 50px;
  }

  .navbar li a {
    font-size: 1rem;
  }

  .menu-toggle, .bar {
    display: block;
    cursor: pointer;
  }

  .mobile-nav {
    transform: translate(0%)!important;
  }

  /* SECTIONS */

  .headline {
    height: 20vh;
  }

  .feature-container p {
    margin-bottom: 25px;
  }

  .feature-container {
    margin-top: 20px;
  }

  .feature-container:nth-child(2) {
    order: -1;
  }

  /* SEARCH DISABLED ON MOBILE */

  #search-icon {
    display: none;
  }

  .search-input {
    display: none;
  }
}
</style>