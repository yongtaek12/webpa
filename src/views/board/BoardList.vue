<template>
  <section class="notice">
    <div class="page-title">
      <div class="container">
        <h3>공지사항</h3>
      </div>
    </div>

    <!-- 검색 영역 -->
    <div id="board-search">
      <div class="container">
        <div class="search-window">                
          <form @submit.prevent="fnPage()">
            <div class="search-wrap">
              <label for="search" class="blind">공지사항 내용 검색</label>
              <select v-model="search_key" class="search-select">
                <option value="">- 선택 -</option>
                <option value="title">제목</option>
                <option value="author">작성자</option>
                <option value="contents">내용</option>
              </select>
              <input
                id="search"
                type="search"
                v-model="search_value"
                placeholder="검색어를 입력해주세요."
                @keyup.enter="fnPage()"
              />
              <button type="submit" class="btn btn-dark" @click.prevent="fnPage(1)">검색</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 게시판 리스트 영역 -->
    <div id="board-list">
      <div class="container">
        <table class="board-table">
          <thead>
            <tr>
              <th>No</th>
              <th>제목</th>
              <th>작성자</th>
              <th>등록일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in list" :key="idx">
              <td>{{ row.idx }}</td>
              <td><a v-on:click="fnView(`${row.idx}`)">{{ row.title }}</a></td>
              <td>{{ row.author }}</td>
              <td>{{ row.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 페이지네이션 영역 -->
    <div class="pagination w3-bar w3-padding-16 w3-small" v-if="paging.totalListCnt > 0">
      <span class="pg">
        <a href="javascript:;" @click="fnPage(1)" class="first w3-button w3-bar-item w3-border">&lt;&lt;</a>
        <a
          href="javascript:;"
          v-if="paging.startPage > 10"
          @click="fnPage(`${paging.startPage - 1}`)"
          class="prev w3-button w3-bar-item w3-border"
          >&lt;</a
        >
        <template v-for="(n, index) in paginavigation()">
          <template v-if="paging.page == n">
            <strong class="w3-button w3-bar-item w3-border w3-green" :key="index">{{ n }}</strong>
          </template>
          <template v-else>
            <a
              class="w3-button w3-bar-item w3-border"
              href="javascript:;"
              @click="fnPage(`${n}`)"
              :key="index"
              >{{ n }}</a
            >
          </template>
        </template>
        <a
          href="javascript:;"
          v-if="paging.totalPageCnt > paging.endPage"
          @click="fnPage(`${paging.endPage + 1}`)"
          class="next w3-button w3-bar-item w3-border"
          >&gt;</a
        >
        <a
          href="javascript:;"
          @click="fnPage(`${paging.totalPageCnt}`)"
          class="last w3-button w3-bar-item w3-border"
          >&gt;&gt;</a
        >
      </span>
    </div>

    <!-- 글쓰기 버튼 -->
    <div class="container">
      <button type="button" class="btn btn-primary" @click="fnWrite">글쓰기</button>
    </div>
  </section>
</template>

<script>
export default {
  data() { //변수생성
    return {
      requestBody: {}, //리스트 페이지 데이터전송
      list: {}, //리스트 데이터
      no: '', //게시판 숫자처리
      
      paging: {
        block: 0,
        endPage: 0,
        nextBlock: 0,
        page: 0,
        pageSize: 0,
        prevBlock: 0,
        startIndex: 0,
        startPage: 0,
        totalBlockCnt: 0,
        totalListCnt: 0,
        totalPageCnt: 0,
        //페이징 데이터
      }, 
      page: this.$route.query.page ? this.$route.query.page : 1,
      size: this.$route.query.size ? this.$route.query.size : 10,
      search_key: this.$route.query.sk ? this.$route.query.sk : '',
      search_value: this.$route.query.sv ? this.$route.query.sv : '',
      paginavigation: function () { //페이징 처리 for문 커스텀
        let pageNumber = [] //;
        let startPage = this.paging.startPage;
        let endPage = this.paging.endPage;
        for (let i = startPage; i <= endPage; i++) pageNumber.push(i);
        return pageNumber;
      }
    }
  },
  mounted() {
    this.fnGetList()
  },
  methods: {
    fnGetList() {
      this.requestBody = { // 데이터 전송        
        keyword: this.search_key,
        value: this.search_value,
        page: this.page,
        size: this.size
      }

      this.$axios.get(this.$serverUrl + "/board/list", {
        params: this.requestBody,
        headers: {}
      }).then((res) => {      
         console.log("테스트입니다.", this.$serverUrl);
         console.log(res.data);

        if (res.data.resultCode === "OK") {
          this.list = res.data.data
          this.paging = res.data.pagination
          this.no = this.paging.total_list_cnt - ((this.paging.page - 1) * this.paging.page_size)
        }

      }).catch((err) => {
        if (err.message.indexOf('Network Error') > -1) {
          alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.')
        }
      })
    },
    fnView(idx) {
      this.requestBody.idx = idx
      this.$router.push({
        path: './detail',
        query: this.requestBody
      })
    },
    fnWrite() {
      this.$router.push({
        path: './write'
      })
    },
    fnPage(n) {
      if (this.page !== n) {
        this.page = n
        
      }
      this.fnGetList()
    }
  }
}
</script>
