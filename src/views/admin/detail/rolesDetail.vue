<script>
  export default {
    data() {
      return {
        role: {
          roleId: '',
          roleDesc: '',
          isExpression: '',
          roleName: '',
        }
      };
    },
    mounted() {
      // URL에서 전달된 roles 데이터를 가져와서 복원
      try {
        console.log("현재 라우트 이름:", this.$route.name); // 라우트 이름 확인

        const rolesData = this.$store.state.roles // Vuex에서 roles 데이터 가져오기
        console.log('rolesData111 :', rolesData);
        // 배열의 첫 번째 항목을 this.role에 할당

        this.role.roleId = rolesData.roleId || ''; // 닉네임이 필요하면 추가;
        this.role.roleDesc = rolesData.roleDesc || '';
        this.role.isExpression = rolesData.isExpression || '';
        this.role.roleName = rolesData.roleName || '';
      }catch (error){
        console.log("error loading" , error)
      }


      this.fnGetView();

    },
    methods: {
      submitForm() {
        // 폼 제출 처리 로직
        let payload={};
        if(this.$route.name === "RolesDetail1"){
          payload = {
            roleId: this.role.roleId,
            roleDesc: this.role.roleDesc,
            isExpression: this.role.isExpression,
            roleName : this.role.roleName
          };
          console.log("payLoad", payload)
          this.$axios.put(this.$serverUrl + '/admin/roles', payload)
              .then(response => {
                // console.log('전송 성공:', response.data);
                alert('데이터가 성공적으로 전송되었습니다.');
              })
              .catch(error => {
                // console.error('전송 실패:', error);
                alert('데이터 전송에 실패했습니다.');
              });
        }else if(this.$route.name === "RolesDetail2"){
          payload = {
            roleDesc: this.role.roleDesc,
            isExpression: this.role.isExpression,
            roleName : this.role.roleName
          };
          this.$axios.post(this.$serverUrl + '/admin/roles', payload)
              .then(response => {
                // console.log('전송 성공:', response.data);
                alert('데이터가 성공적으로 전송되었습니다.');
              })
              .catch(error => {
                // console.error('전송 실패:', error);
                alert('데이터 전송에 실패했습니다.');
              });
        }


      },
      deleteRole() {
        if (confirm("정말로 삭제하시겠습니까?")) {
          this.$axios.delete(`${this.$serverUrl}/admin/roles/${this.role.roleId}`)
              .then(() => {
                alert("삭제가 완료되었습니다.");
                this.$router.push('/admin'); // 목록 페이지로 이동
              })
              .catch(error => {
                console.error("삭제 실패:", error);
                alert("삭제에 실패했습니다.");
              });
        }
      },
      //role list 가져오는 로직
      fnGetView(){
        this.$axios.get(this.$serverUrl + '/admin/resources/' + this.role.id, {
        }).then((res) => {

          // 현재 사용자에 해당하는 roleNames 설정
          const myRoles = res.data.myRoles || [];
          // myRoles에서 roleName만 추출하여 배열로 만듦
          const myRoleNames = myRoles.map(role => role.roleName);


          this.roleList = res.data.allRoles.map(role => ({
            roleName: role.roleName,
            roleId: role.roleId,
            checked: myRoleNames.includes(role.roleName)

          }));






        }).catch((err) => {
          if (err.message.indexOf('Network Error') > -1) {
            alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.')
          }
        })
      }
    }
  };
</script>

<template>
  <div class="tab-content">
    <div class="tbl_wrp">
      <form class="form-horizontal form-custom" @submit.prevent="submitForm">
        <input type="hidden" v-model="role.roleId" />

        <div class="form-group2">
          <label for="roleName" class="col-sm-2 control-label">권한명</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.roleName"
                required
            />
          </div>
        </div>

        <div class="form-group2">
          <label for="roleDesc" class="col-sm-2 control-label">권한설명</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.roleDesc"
                required
            />
          </div>
        </div>

        <div class="form-group2">
          <label for="isExpression" class="col-sm-2 control-label">표현식여부</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.isExpression"
                required
            />
          </div>
        </div>
        <div class="form-group2">
          <div class="col-sm-offset-1 col-sm-10">
            <button type="submit"  class="btn btn-dark btn-lg">등록</button>
            <a class="btn btn-dark btn-lg" href="/admin">목록</a>
            <button
                v-if="$route.name === 'RolesDetail1'"
                @click="deleteRole"
                class="btn btn-danger btn-lg"
            >
              삭제
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>



</style>