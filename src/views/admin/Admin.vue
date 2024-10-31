<template>
  <div class="nav-tabs">
    <!-- 탭 목록 -->
    <ul class="tabs">
      <li
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: activeTab === index }"
          @click="selectTab(index)"
      >
        {{ tab.name }}
      </li>
    </ul>

    <!-- 탭 내용 -->
    <div class="tab-content">
      <div v-if="activeTab === 0">
        <p>첫 번째 탭 내용입니다.</p>
      </div>
      <div v-if="activeTab === 1">
        <p>두 번째 탭 내용입니다.</p>
      </div>
      <div v-if="activeTab === 2">
        <p>세 번째 탭 내용입니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';

export default {
  setup() {
    const activeTab = ref(0); // 현재 활성화된 탭 인덱스
    const tabs = ref([
      {name: '회원 관리'},
      {name: '권한 관리'},
      {name: '자원 관리'},
    ]);

    const selectTab = (index) => {
      activeTab.value = index;
    };

    return {
      activeTab,
      tabs,
      selectTab,
    };
  },
};
</script>

<style>
.nav-tabs {
  width: 80%;
  margin: 0 auto; /* 가운데 정렬 */
  border-bottom: 2px solid #ddd;

}

.tabs {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  border-bottom: 2px solid #ddd;
}

.tabs li {
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: none;
}

.tabs li.active {
  border-color: #ddd;
  border-bottom: 2px solid white;
  font-weight: bold;
}

.tab-content {
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
