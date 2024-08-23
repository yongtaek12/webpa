<template>
  <div class="board-detail">
    <div class="board-contents">
      <input
        type="text"
        v-model="title"
        class="w3-input w3-border"
        placeholder="제목을 입력해주세요."
        style="resize: none; width: 20%;"
      />
      <input
        type="text"
        v-model="author"
        class="w3-input w3-border"
        placeholder="작성자를 입력해주세요."
        v-if="idx === undefined"
        style="resize: none; width: 20%;"
      />
    </div>
    <div class="board-contents">
      <ckeditor
        v-model="contents"
        :editor="editor"
        :config="editorConfig"
        @ready="onEditorReady"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>

    <div class="common-buttons">
      <button
        type="button"
        class="w3-button w3-round w3-blue-gray"
        v-on:click="fnSave"
      >
        저장
      </button>
      &nbsp;
      <button
        type="button"
        class="w3-button w3-round w3-gray"
        v-on:click="fnList"
      >
        목록
      </button>
    </div>
  </div>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default {
  data() {
    return {
      requestBody: this.$route.query,
      idx: this.$route.query.idx,
      title: '',
      author: '',
      contents: '',
      created_at: '',
      editor: ClassicEditor,
      editorData: '<p>Hello from CKEditor 5 in Vue!</p>',
      editorConfig: {}, // 기본 설정으로 빈 객체로 남겨 둡니다.
    };
  },
  mounted() {

    this.fnGetView();
  },
  methods: {
    onEditorReady(editor) {
      this.editorInstance = editor;  // editor 인스턴스를 저장
      this.setEditorHeight();
    },
    setEditorHeight() {
      if (this.editorInstance) {
        const editorElement = this.editorInstance.ui.view.editable.element;
        if (editorElement) {
          editorElement.style.minHeight = '500px';
        }
      }
    },
    onFocus() {
      // this.setEditorHeight();  // 포커스 시에도 높이 유지

    },
    onBlur() {
      // this.setEditorHeight();  // 블러 시에도 높이 유지

    },
  
    fnGetView() {
      if (this.idx !== undefined) {
        this.$axios
          .get(this.$serverUrl + '/board/' + this.idx, {
            params: this.requestBody,
          })
          .then((res) => {
            this.title = res.data.title;
            this.author = res.data.author;
            this.contents = res.data.contents;
            this.created_at = res.data.created_at;
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    fnList() {
      delete this.requestBody.idx;
      this.$router.push({
        path: './list',
        query: this.requestBody,
      });
    },
    fnSave() {
      let apiUrl = this.$serverUrl + '/board';

      if (this.title.length === 0) {
        alert('글 제목은 필수로 입력하십시오');
        return;
      }
      if (this.contents.length === 0) {
        alert('글 내용을 입력하십시오');
        return;
      }

      this.form = {
        idx: this.idx,
        title: this.title,
        contents: this.contents,
        author: this.author,
      };

      if (this.idx === undefined) {
        this.$axios
          .post(apiUrl, this.form)
          .then((res) => {
            alert('글이 저장되었습니다.');
            this.fnView(res.data.idx);
          })
          .catch((err) => {
            if (err.message.indexOf('Network Error') > -1) {
              alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.');
            }
          });
      } else {
        this.$axios
          .patch(apiUrl, this.form)
          .then((res) => {
            alert('글이 저장되었습니다.');
            this.fnView(res.data.idx);
          })
          .catch((err) => {
            if (err.message.indexOf('Network Error') > -1) {
              alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.');
            }
          });
      }
    },
  },
};
</script>
<style>
.ck-editor__editable {
  min-height: 700px !important;
  font-family: Arial, sans-serif;
  color: #000 !important;

}
</style>
