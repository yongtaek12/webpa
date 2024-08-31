<template>
    <div class="board-detail">
      <div class="board-contents">
        <h3>{{ title }}</h3>
        <div>
          <strong class="w3-large">{{ author }}</strong>
          <br>
          <span>{{ created_at }}</span>
        </div>
      </div>
      <div class="board-contents">
        <div class="main-container">
          <div class="editor-container editor-container_classic-editor editor-container_include-block-toolbar" ref="editorContainerElement">
            <div class="editor-container__editor">
              <div ref="editorElement">
              <ckeditor v-if="isLayoutReady" v-model="contents" :editor="editor" :config="config":disabled="true"
			        @ready="onEditorReady"
			        />
            </div>
          </div>
        </div>
      </div>        
        <!-- <div v-html="contents"></div> -->

      </div>
      <div class="common-buttons">
        <button type="button" class="w3-button w3-round w3-blue-gray" v-on:click="fnUpdate">수정</button>&nbsp;
        <button type="button" class="w3-button w3-round w3-red" v-on:click="fnDelete">삭제</button>&nbsp;
        <button type="button" class="w3-button w3-round w3-gray" v-on:click="fnList">목록</button>
      </div>
    </div>
  </template>
  
  <script>
  import {
	ClassicEditor,
	AccessibilityHelp,
	Alignment,
	Autoformat,
	Autosave,
	BalloonToolbar,
	Base64UploadAdapter,
	BlockQuote,
	Essentials,
	Heading,
	Highlight,
	HorizontalLine,
	HtmlComment,
	HtmlEmbed,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsert,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Link,
	LinkImage,
	List,
	ListProperties,
	Markdown,
	MediaEmbed,
	Mention,
	PageBreak,
	Paragraph,
	PasteFromMarkdownExperimental,
	PasteFromOffice,
	RemoveFormat,
	SelectAll,
	ShowBlocks,
	SourceEditing,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextPartLanguage,
	TextTransformation,
	Title,
	TodoList,
	Underline,
	Undo
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import translations from 'ckeditor5/translations/ko.js';
  export default {
    data() { //변수생성
      return {
        requestBody: this.$route.query,
        idx: this.$route.query.idx,
        title: '',
        author: '',
        contents: '',
        created_at: '',
        isLayoutReady: false,
			  config: null, // CKEditor needs the DOM tree before calculating the configuration.
			  editor: ClassicEditor     
      }
    },
    mounted() {
      this.fnGetView()
      // CKEditor 초기화
    this.config = {
			toolbar: {
				items: [
				],
				shouldNotGroupWhenFull: false
			},
			plugins: [
				AccessibilityHelp,
				Alignment,
				Autoformat,
				Autosave,
				BalloonToolbar,
				Base64UploadAdapter,
				BlockQuote,
				Essentials,
				Heading,
				Highlight,
				HorizontalLine,
				HtmlComment,
				HtmlEmbed,
				ImageBlock,
				ImageCaption,
				ImageInline,
				ImageInsert,
				ImageInsertViaUrl,
				ImageResize,
				ImageStyle,
				ImageTextAlternative,
				ImageToolbar,
				ImageUpload,
				Indent,
				IndentBlock,
				Italic,
				Link,
				LinkImage,
				List,
				ListProperties,
				Markdown,
				MediaEmbed,
				Mention,
				PageBreak,
				Paragraph,
				PasteFromMarkdownExperimental,
				PasteFromOffice,
				RemoveFormat,
				SelectAll,
				ShowBlocks,
				SourceEditing,
				SpecialCharacters,
				SpecialCharactersArrows,
				SpecialCharactersCurrency,
				SpecialCharactersEssentials,
				SpecialCharactersLatin,
				SpecialCharactersMathematical,
				SpecialCharactersText,
				Strikethrough,
				Subscript,
				Superscript,
				Table,
				TableCaption,
				TableCellProperties,
				TableColumnResize,
				TableProperties,
				TableToolbar,
				TextPartLanguage,
				TextTransformation,
				Title,
				TodoList,
				Underline,
				Undo
			],


			language: 'ko',
			link: {
				addTargetToExternalLinks: true,
				defaultProtocol: 'https://',
				decorators: {
					toggleDownloadable: {
						mode: 'manual',
						label: 'Downloadable',
						attributes: {
							download: 'file'
						}
					}
				}
			},
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			},
			mention: {
				feeds: [
					{
						marker: '@',
						feed: [
							/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
						]
					}
				]
			},
			menuBar: {
				isVisible: true
			},
			table: {
				contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
			},
			translations: [translations]
		};
    this.isLayoutReady = true;
    },
    methods: {
      fnGetView() {
        this.$axios.get(this.$serverUrl + '/board/' + this.idx, {
          params: this.requestBody
        }).then((res) => {
          this.title = res.data.title
          this.author = res.data.author
          this.contents = res.data.contents
          this.created_at = res.data.created_at
        }).catch((err) => {
          if (err.message.indexOf('Network Error') > -1) {
            alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.')
          }
        })
      },
      fnList() {
        delete this.requestBody.idx
        this.$router.push({
          path: './list',
          query: this.requestBody
        })
      },
      fnUpdate() {
        this.$router.push({
          path: './write',
          query: this.requestBody
        })
      },
      fnDelete() {
        if (!confirm("삭제하시겠습니까?")) return
  
        this.$axios.delete(this.$serverUrl + '/board/' + this.idx, {})
            .then(() => {
              alert('삭제되었습니다.')
              this.fnList();
            }).catch((err) => {
          console.log(err);
        })
      },
      onEditorReady(editor) {
        this.editorInstance = editor;  // editor 인스턴스를 저장
        const toolbarElement = editor.ui.view.toolbar.element;
        toolbarElement.style.display = 'none';

        // CKEditor를 읽기 전용 모드로 설정
        // editor.isReadOnly = true;  // CKEditor를 읽기 전용 모드로 설정
      },
    }
  }
  </script>
  <style scoped>
  
  
  </style>