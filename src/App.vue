<template>
  <PageHeader v-if="showHeaderFooter" /> <!-- 헤더 컴포넌트 조건부 렌더링 -->
  <router-view/>  <!-- 페이지 이동이 표시될 곳 -->
  <PageFooter v-if="showHeaderFooter" /> <!-- 푸터 컴포넌트 조건부 렌더링 -->
</template>

<script>
import { computed, watch } from 'vue';  // Vue.js의 computed와 watch 훅을 가져옵니다.
import { useRoute } from 'vue-router';  // Vue Router의 useRoute 훅을 가져옵니다.
import PageHeader from '@/components/PageHeader';
import PageFooter from '@/components/PageFooter';
export default {
  name: 'App',
  components: {
    PageFooter,
    PageHeader
  },
  setup() {
    const route = useRoute();  // 현재 경로 정보를 가져옵니다.
    const isHome = computed(() => route.path === '/');
    // 배경색을 동적으로 설정하는 함수
    const updateBackgroundColor = () => {
      const appElement = document.getElementById('app');
      if (isHome.value) {
        appElement.style.backgroundColor = 'black';
      } else {
        appElement.style.backgroundColor = 'white';  // 기본 색상으로 돌려놓습니다.
      }
    };
    // 라우트가 변경될 때마다 배경색을 업데이트
    watch(route, () => {
      updateBackgroundColor();
    }, { immediate: true });  // 처음 로드될 때도 바로 실행    
    return {
      showHeaderFooter: computed(() => route.meta.showHeaderFooter),
      updateBackgroundColor,
      isHome,
    };
  },
      
  mounted() {
    this.updateBackgroundColor();
  },
  beforeRouteUpdate(to, from, next) {
    this.updateBackgroundColor();
    next();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow-y: auto;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
