<script>
import axios from '@/plugins/axios.js';
  export default {
    data() {
      return {
        role: {
          id: '',
          userId: '',
          password: '',
          memo: '',
          roleId: ''

        },
        roleList: []
      };
    },
    mounted() {
      // URL에서 전달된 roles 데이터를 가져와서 복원
      try {
        const rolesData = this.$store.state.roles; // Vuex에서 roles 데이터 가져오기
        console.log("rolesData : ", rolesData);
        this.role.userId = rolesData.userId || '';
        this.role.id = rolesData.id || '';
        this.role.roleId = rolesData.roleId || '';
      } catch (error) {
        console.error('Error loading roles data:', error);
      }
      this.fnGetView(); // 권한 목록 가져오기

    },
    methods: {
      submitForm() {
        if (!this.role.roleId) {
          return alert("권한을 선택해 주세요.");
        }
        // 폼 제출 처리 로직
        const payload = {
          id: this.role.id,
          roleId : this.role.roleId

        };
        console.log("payload", payload);
        // console.log("payload" , this.roleList);
        axios.post(this.$serverUrl + '/admin/users', payload)
            .then(response => {
              // console.log('전송 성공:', response.data);
              alert('데이터가 성공적으로 전송되었습니다.');
            })
            .catch(error => {
              // console.error('전송 실패:', error);
              alert('데이터 전송에 실패했습니다.');
            });
      },
      //role list 가져오는 로직
      fnGetView(){
        axios.get(this.$serverUrl + '/admin/resources/' + this.role.id, {
        }).then((res) => {
          console.log("rest : ", res);

          // 현재 사용자에 해당하는 roleNames 설정
          this.roleList = res.data; // roleList에 데이터 할당
        }).catch((err) => {
          if (err.message.indexOf('Network Error') > -1) {
            alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.')
          }
        })
      },
      bindRoleId(event){
        this.role.roleId = event.target.value;
      }
    }
  };
</script>

<template>
  <div class="tab-content">
    <div class="tbl_wrp">
      <form class="form-horizontal form-custom" @submit.prevent="submitForm">
        <input type="hidden" v-model="role.id" />

        <div class="form-group2">
          <label for="username" class="col-sm-2 control-label">아이디</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.userId"
                readonly
            />
          </div>
        </div>
        <div class="form-group2">
          <label for="roleName" class="col-sm-2 control-label">권한</label>
          <div class="col-sm-10">
            <select class="form-control2" v-model="role.roleId" @change="bindRoleId($event)">
              <option disabled value="">권한을 선택하세요</option> <!-- 기본 옵션 -->
              <option v-for="role in roleList" :key="role.roleId" :value="role.roleId">
                {{ role.roleName }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group2">
          <div class="col-sm-offset-1 col-sm-10">
            <button type="submit" class="btn btn-dark btn-lg">등록</button>
            <a class="btn btn-dark btn-lg" href="/admin">목록</a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>



</style>