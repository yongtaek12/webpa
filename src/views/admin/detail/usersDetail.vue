<script>
  export default {
    data() {
      return {
        role: {
          id: '',
          userId: '',
          password: '',
          memo: '',

        },
        roleList: []
      };
    },
    mounted() {
      // URL에서 전달된 roles 데이터를 가져와서 복원
      const rolesData = this.$store.state.roles // Vuex에서 roles 데이터 가져오기
      // console.log('rolesData111 :', rolesData.userId);1
      // 배열의 첫 번째 항목을 this.role에 할당

      this.role.userId = rolesData.userId || ''; // 닉네임이 필요하면 추가;
      this.role.id = rolesData.id || '';

      this.fnGetView();

    },
    methods: {
      submitForm() {
        // 폼 제출 처리 로직
        const payload = {
          id: this.role.id,
          roles: this.roleList
              .filter(role => role.checked) // checked가 true인 role만 선택
              .map(role => role.roleId)    // roleId만 추출
        };
        console.log("payload" , this.roleList);
        this.$axios.post(this.$serverUrl + '/admin/users', payload)
            .then(response => {
              console.log('전송 성공:', response.data);
              alert('데이터가 성공적으로 전송되었습니다.');
            })
            .catch(error => {
              console.error('전송 실패:', error);
              alert('데이터 전송에 실패했습니다.');
            });
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


          console.log("eppepp1 , ", this.roleList)



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
          <label for="password" class="col-sm-2 control-label">비밀번호</label>
          <div class="col-sm-10">
            <input
                type="password"
                class="form-control2 input-large"
                v-model="role.password"
                readonly
            />
          </div>
        </div>

        <div class="form-group2">
          <label for="age" class="col-sm-2 control-label">특이사항(미구현)</label>
          <div class="col-sm-10">
            <input
                type="number"
                class="form-control2 input-large"
                v-model="role.memo"
                placeholder="글을 입력하세요"
                required
            />
          </div>
        </div>

        <div class="form-group2">
          <label for="roles" class="col-sm-2 control-label">권한</label>
          <div class="col-sm-10">
            <span v-for="role in roleList" :key="role.roleName">
              <input
                  type="checkbox"
                  :value="role.roleId"
                  v-model="role.checked"

              />
              <label>{{ role.roleName }}</label>
            </span>
          </div>
        </div>

        <div class="form-group2">
          <div class="col-sm-offset-1 col-sm-10">
            <button type="submit" @click="submitForm" class="btn btn-dark btn-lg">등록</button>
            <a class="btn btn-dark btn-lg" href="/admin/users">목록</a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>



</style>