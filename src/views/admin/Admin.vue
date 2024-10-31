<template>
  <div class="nav-tabs">
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

    <div class="tab-content">
      <div v-if="activeTab === 0">
        <div class="tbl_wrp">
          <table class="table rounded-table">
            <thead>
            <tr class="table-header">
              <th scope="col">권한명</th>
              <th scope="col">권한설명</th>
              <th scope="col">표현식여부</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="role in roles" :key="role.name" class="role-row">
              <td>{{ role.roleName }}</td>
              <td>{{ role.roleDesc }}</td>
              <td>{{ role.isExpression }}</td>
            </tr>
            </tbody>
          </table>
          <button class="add-role-button">권한 등록</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const activeTab = ref(0);
    const tabs = ref([
      {name: '권한 관리'},
      {name: '회원 관리'},
      {name: '자원 관리'},
    ]);

    const roles = ref([]); // 빈 배열로 초기화

    const selectTab = (index) => {
      activeTab.value = index;
    };
    // 데이터 가져오기

    const serverUrl = 'http://localhost:8085'; // 여기에 실제 서버 URL을 입력하세요

    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${serverUrl}/admin/roles`);
        console.log("response : ", response.data)
        roles.value = response.data; // roles 데이터 설정
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    // 컴포넌트가 마운트되었을 때 호출
    // 컴포넌트가 마운트되었을 때 호출
    onMounted(() => {
      fetchRoles();
    });
    return {
      activeTab,
      tabs,
      selectTab,
      roles,
    };
  },
};
</script>

<style>
.nav-tabs {
  width: 80%;
  margin: 0 auto;
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

.tbl_wrp {
  margin-top: 20px;
  background-color: #060C1C;
  padding: 15px;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: white;
}

.table-header {
  background-color: #a8d0db;
  color: black;
  text-align: left; /* 텍스트 왼쪽 정렬 */
}

.table-header th {
  padding: 10px;
}

.role-row {
  background-color: #060C1C;
}

.role-row td {
  padding: 10px;
  text-align: left;
  border-top: 1px solid #333;
}

.add-role-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-end; /* 버튼을 오른쪽으로 정렬 */
}

.add-role-button:hover {
  background-color: #45a049;
}
</style>
