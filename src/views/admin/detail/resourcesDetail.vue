<script>
  export default {
    data() {
      return {
        role: {
          resourceId: '',
          resourceName: '',
          resourceType: '',
          httpMethod: '',
          orderNum: '',
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

        this.role.resourceId = rolesData.resourceId || ''; // 닉네임이 필요하면 추가;
        this.role.resourceName = rolesData.resourceName || '';
        this.role.resourceType = rolesData.resourceType || '';
        this.role.httpMethod = rolesData.httpMethod || '';
        this.role.orderNum = rolesData.orderNum || '';
      }catch (error){
        console.log("error loading" , error)
      }


      // this.fnGetView();

    },
    methods: {
      submitForm() {
        // 폼 제출 처리 로직
        let payload={};
        //수정
        if(this.$route.name === "ResourcesDetail1"){
          payload = {
            resourceId: this.role.resourceId,
            resourceName: this.role.resourceName,
            resourceType: this.role.resourceType,
            httpMethod : this.role.httpMethod,
            orderNum : this.role.orderNum
          };
          console.log("payLoad", payload)
          this.$axios.put(this.$serverUrl + '/admin/resources', payload)
              .then(response => {
                // console.log('전송 성공:', response.data);
                alert('데이터가 성공적으로 전송되었습니다.');
              })
              .catch(error => {
                // console.error('전송 실패:', error);
                alert('데이터 전송에 실패했습니다.');
              });
          //생성
        }else if(this.$route.name === "ResourcesDetail2"){
          payload = {
            resourceName: this.role.resourceName,
            resourceType: this.role.resourceType,
            httpMethod : this.role.httpMethod,
            orderNum : this.role.orderNum
          };
          this.$axios.post(this.$serverUrl + '/admin/resources', payload)
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
          this.$axios.delete(`${this.$serverUrl}/admin/resources/${this.role.resourceId}`)
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
    }
  };
</script>

<template>
  <div class="tab-content">
    <div class="tbl_wrp">
      <form class="form-horizontal form-custom" @submit.prevent="submitForm">
        <input type="hidden" v-model="role.resourceId" />

        <div class="form-group2">
          <label for="roleName" class="col-sm-2 control-label">리소스명</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.resourceName"
                required
            />
          </div>
        </div>

        <div class="form-group2">
          <label for="resourceType" class="col-sm-2 control-label">리소스타입</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.resourceType"
                required
            />
          </div>
        </div>

        <div class="form-group2">
          <label for="httpMethod" class="col-sm-2 control-label">HttpMethod</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.httpMethod"
                required
            />
          </div>
        </div>
        <div class="form-group2">
          <label for="orderNum" class="col-sm-2 control-label">순서</label>
          <div class="col-sm-10">
            <input
                type="text"
                class="form-control2 input-large"
                v-model="role.orderNum"
                required
            />
          </div>
        </div>
        <div class="form-group2">
          <div class="col-sm-offset-1 col-sm-10">
            <button type="submit"  class="btn btn-dark btn-lg">등록</button>
            <a class="btn btn-dark btn-lg" href="/admin">목록</a>
            <button
                v-if="$route.name === 'ResourcesDetail1'"
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