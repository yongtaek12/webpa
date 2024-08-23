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
        v-model="editorData"
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
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageUpload,
  Link,
  Table,
  TableToolbar,
  List,
  BlockQuote,
  CodeBlock,
  Clipboard,
  Underline,
  Strikethrough,
  Heading,
  Font,
  MediaEmbed,
  InlineEditor,
  FindAndReplace,
  PasteFromOffice,
  ImageResize,
  Alignment,
  Indent,
  IndentBlock,
  Subscript,
  Superscript,
  RemoveFormat,
  TodoList,
  Base64UploadAdapter
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import coreTranslations from 'ckeditor5/translations/es.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/es.js';
import '@ckeditor/ckeditor5-build-classic/build/translations/ko';  // 한국어 번역 추가

// import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace'; // 플러그인 불러오기
// import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

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
      editorConfig: {
        language: "ko",
        plugins: [
          Essentials,
          Bold,
          Italic,
          Paragraph,
          Mention,
          Undo,
          Image,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          ImageUpload,
          FindAndReplace,
          Link,
          Table,
          TableToolbar,
          List,
          BlockQuote,
          CodeBlock,
          Clipboard,
          Underline,
          Strikethrough,
          Heading, // 추가된 플러그인
          Font,
          MediaEmbed,
          PasteFromOffice,
          ImageResize,
          Alignment,
          Indent,
          IndentBlock,
          InlineEditor,
          Subscript,
          Superscript,
          RemoveFormat,
          TodoList,
          Base64UploadAdapter
        ],
        toolbar: [
          'findAndReplace', 'selectAll', '|',
          'heading', '|',
          'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'removeFormat', '|',
          'bulletedList', 'numberedList', 'todoList', '|',
          'outdent', 'indent', '|',
          'undo', 'redo', '|',
          'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
          'alignment', '|',
          'link', 'insertImage', 'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', 'htmlEmbed', '|',
          'specialCharacters', 'horizontalLine', 'pageBreak', '|',
          'textPartLanguage', '|',
          'sourceEditing'
        ],
        shouldNotGroupWhenFull: true,

        heading: {
          options: [
            {
              model: "paragraph",
              view: {
                name: 'p',
                classes: 'ck-heading_paragraph',
                styles: {
                  'text-align': 'left',  // 왼쪽 정렬
                  'color': '#000000'     // 글씨 색 검은색
                }
              },
              title: "본문",
              class: "ck-heading_paragraph"
            },
            {
              model: "heading1",
              view: "h1",
              title: "헤더1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "헤더2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "헤더3",
              class: "ck-heading_heading3",
            },
          ]
        },
        fontSize: {
          options: [9, 11, 13, 15, 17, 20, 24, 28, 32, 54],
        },
        alignment: {
          options: ["justify", "left", "center", "right"],
        },
        image: {
          resizeUnit: "px",
          toolbar: [
            "imageStyle:alignLeft",
            "imageStyle:full",
            "imageStyle:alignRight",
            "|",
            "imageTextAlternative",
          ],
          styles: ["full", "alignLeft", "alignRight"]
        },
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        },
        typing: {
          transformations: {
            remove: ["enDash", "emDash", "oneHalf", "oneThird", "twoThirds", "oneForth", "threeQuarters"],
          },
        },
        translations: [coreTranslations, premiumFeaturesTranslations],
        placeholder: "글을 입력해보세요!",
      }
    };
  },
  mounted() {
    this.fnGetView();
  },
  methods: {
    onFocus() {
      // 포커스 시의 작업을 여기에 추가할 수 있습니다.
    },
    onBlur() {
      // 포커스 잃음 시의 작업을 여기에 추가할 수 있습니다.
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
}
.ck-content p.ck-heading_paragraph {
  text-align: left !important;
  color: #000000 !important;
}
.ck.ck-content ul,
.ck.ck-content ul li {
  list-style-type: inherit;
}

.ck.ck-content ul {
  /* Default user agent stylesheet, you can change it to your needs. */
  padding-left: 40px;
}

.ck.ck-content ol,
.ck.ck-content ol li {
  list-style-type: decimal;
}
.ck.ck-content ol {
  /* Default user agent stylesheet, you can change it to your needs. */
  padding-left: 40px;
}
</style>
