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
              <td @click="navigateToUserAuth(role)" class="hover-underline">
              {{ role.roleName }}
              </td>
              <td>{{ role.roleDesc }}</td>
              <td>{{ role.isExpression }}</td>
            </tr>
            </tbody>
          </table>
          <button class="add-role-button" @click="navigateToUserAuth(null)">권한 등록</button>
        </div>
      </div>

      <div v-if="activeTab === 1">
        <div class="tbl_wrp">
          <table class="table rounded-table">
            <thead>
            <tr class="table-header">
              <th scope="col">계정</th>
              <th scope="col">이름</th>
              <th scope="col">핸드폰 번호</th>
              <th scope="col">상태</th>
              <th scope="col">권한</th>
              <th scope="col">권한</th>
              <th scope="col">등록일</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="role in roles" :key="role.name" class="role-row">
              <td @click="navigateToUser(role)" class="hover-underline">
              {{ role.userId }}
              </td>
              <td>{{ role.nickname }}</td>
              <td>{{ role.phone }}</td>
              <td>{{ role.status }}</td>
              <td>{{ role.roleDesc }}</td>
              <td>{{ role.roleName }}</td>
              <td>{{ role.createdAt }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

        <div v-if="activeTab === 2">
          <div class="tbl_wrp">
            <table class="table rounded-table">
              <thead>
              <tr class="table-header">
                <th scope="col">리소스명</th>
                <th scope="col">리소스타입</th>
                <th scope="col">HttpMethod</th>
                <th scope="col">순서</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="role in roles" :key="role.name" class="role-row">
                <td @click="navigateToResource(role)" class="hover-underline">
                  {{ role.resourceName }}
                </td>
                <td>{{ role.resourcesType }}</td>
                <td>{{ role.httpMethod }}</td>
                <td>{{ role.orderNum }}</td>
              </tr>
              </tbody>
            </table>
            <button class="add-role-button" @click="navigateToResource(null)">리소스 등록</button>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import { ref, onMounted } from 'vue';

export default {
  methods: {
    navigateToUser(role) {
      // console.log("보내기전1 data , : ", role)

      this.$store.commit('SET_ROLES', role); // 정확히 정의된 이름 사용
      this.$router.push(`/admin/user/${role.id}`); // 페이지 이동
    },
    navigateToUserAuth(role) {


      if (!role) {
        // role이 null인 경우 권한 등록 페이지로 이동
        this.$router.push(`/admin/role/insert`);
      } else {
        // role이 null이 아닌 경우 해당 role의 상세 페이지로 이동
        this.$store.commit('SET_ROLES', role);
        this.$router.push(`/admin/role/${role.roleId}`);
      }
    },
    navigateToResource(role){
      // console.log("보내기전2 data , : ", role)
      if (!role) {
        // role이 null인 경우 권한 등록 페이지로 이동
        this.$router.push(`/admin/resource/insert`);
      } else {
        // role이 null이 아닌 경우 해당 role의 상세 페이지로 이동
        this.$store.commit('SET_ROLES', role);
        this.$router.push(`/admin/resource/${role.resourceId}`);
      }
    }
  },
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
      fetchRoles(); // 탭이 변경될 때 데이터를 다시 가져옵니다.

    };
    // 데이터 가져오기

    const serverUrl = 'http://localhost:8085'; // 여기에 실제 서버 URL을 입력하세요

    const fetchRoles = async () => {
      try {
        let response;
        if (activeTab.value === 0) {
          response = await axios.get(`${serverUrl}/admin/roles`);
        } else if (activeTab.value === 1) {
          response = await axios.get(`${serverUrl}/admin/users`);
        } else if (activeTab.value === 2) {
          response = await axios.get(`${serverUrl}/admin/resources`);
        }
         console.log("response : ", response.data)
        roles.value = response.data; // roles 데이터 설정
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
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

</style>
