<template>
  <div class="board-detail">
    <div class="board-contents">
		<input
			type="text"
			v-model="title"
			class="w3-input w3-border"
			placeholder="글제목을 입력해주세요."
			style="resize: none; width: 25%;"
		/>
    <div v-if="this.loginUser">
      <input
        type="text"
        v-model="author"
        class="w3-input w3-border"
        readonly
        style="resize: none; width: 25%;"
      />
    </div>
		</div>
    <div class="board-contents">
      <div class="main-container">
        <div class="editor-container editor-container_classic-editor editor-container_include-block-toolbar" ref="editorContainerElement">
          <div class="editor-container__editor">
            <div ref="editorElement">
              <ckeditor v-if="isLayoutReady" v-model="config.initialData" :editor="editor" :config="config"
			  @ready="onEditorReady"
			   />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="common-buttons">
      <button type="button" class="w3-button w3-round w3-blue-gray" v-on:click="fnSave">
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
	AccessibilityHelp,
	Alignment,
	Autoformat,
	AutoImage,
	Autosave,
	BalloonToolbar,
	Base64UploadAdapter,
	BlockQuote,
	BlockToolbar,
	Bold,
	Code,
	CodeBlock,
	Essentials,
	FindAndReplace,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	FullPage,
	GeneralHtmlSupport,
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
import translations from 'ckeditor5/translations/ko.js';
import UploadAdapter from '@/views/board/UploadAdapter';
import axios from '@/plugins/axios.js';

import 'ckeditor5/ckeditor5.css';

export default {
  data() {
    return {
      requestBody: this.$route.query,
      idx: this.$route.query.idx,
      isSaving: false, // 저장 중 상태 관리 플래그 추가
      title: '',
      author: '',
      contents: '',
      created_at: '',
      isLayoutReady: false,
	  config: null, // CKEditor needs the DOM tree before calculating the configuration.
	  editor: ClassicEditor     
  
    };
  },
  mounted() {
    this.fnGetView();
    // CKEditor 초기화
    this.config = {
			toolbar: {
				items: [
					'undo',
					'redo',
					'|',
					'sourceEditing',
					'showBlocks',
					'findAndReplace',
					'selectAll',
					'textPartLanguage',
					'|',
					'heading',
					'|',
					'fontSize',
					'fontFamily',
					'fontColor',
					'fontBackgroundColor',
					'|',
					'bold',
					'italic',
					'underline',
					'strikethrough',
					'subscript',
					'superscript',
					'code',
					'removeFormat',
					'|',
					'specialCharacters',
					'horizontalLine',
					'pageBreak',
					'link',
					'insertImage',
					'insertImageViaUrl',
					'mediaEmbed',
					'insertTable',
					'highlight',
					'blockQuote',
					'codeBlock',
					'htmlEmbed',
					'|',
					'alignment',
					'|',
					'bulletedList',
					'numberedList',
					'todoList',
					'outdent',
					'indent',
					'|',
					'accessibilityHelp'
				],
				shouldNotGroupWhenFull: false
			},
			plugins: [
				AccessibilityHelp,
				Alignment,
				Autoformat,
				AutoImage,
				Autosave,
				BalloonToolbar,
				Base64UploadAdapter,
				BlockQuote,
				BlockToolbar,
				Bold,
				Code,
				CodeBlock,
				Essentials,
				FindAndReplace,
				FontBackgroundColor,
				FontColor,
				FontFamily,
				FontSize,
				FullPage,
				GeneralHtmlSupport,
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
			// extraPlugins: ['myCustomUploadAdapterPlugin'],  // 여기에 커스텀 업로드 어댑터 설정

			balloonToolbar: ['bold', 'italic', '|', 'link', 'insertImage', '|', 'bulletedList', 'numberedList'],
			blockToolbar: [
				'fontSize',
				'fontColor',
				'fontBackgroundColor',
				'|',
				'bold',
				'italic',
				'|',
				'link',
				'insertImage',
				'insertTable',
				'|',
				'bulletedList',
				'numberedList',
				'outdent',
				'indent'
			],
			fontFamily: {
				supportAllValues: true
			},
			fontSize: {
				options: [10, 12, 14, 'default', 18, 20, 22],
				supportAllValues: true
			},
			
			heading: {
				options: [
					{
						model: 'paragraph',
						title: 'Paragraph',
						class: 'ck-heading_paragraph'
					},
					{
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1'
					},
					{
						model: 'heading2',
						view: 'h2',
						title: 'Heading 2',
						class: 'ck-heading_heading2'
					},
					{
						model: 'heading3',
						view: 'h3',
						title: 'Heading 3',
						class: 'ck-heading_heading3'
					},
					{
						model: 'heading4',
						view: 'h4',
						title: 'Heading 4',
						class: 'ck-heading_heading4'
					},
					{
						model: 'heading5',
						view: 'h5',
						title: 'Heading 5',
						class: 'ck-heading_heading5'
					},
					{
						model: 'heading6',
						view: 'h6',
						title: 'Heading 6',
						class: 'ck-heading_heading6'
					}
				]
			},
			htmlSupport: {
				allow: [
					{
						name: /^.*$/,
						styles: true,
						attributes: true,
						classes: true
					}
				]
			},
			image: {
				toolbar: [
					'toggleImageCaption',
					'imageTextAlternative',
					'|',
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
					'|',
					'resizeImage'
				]
			},

			initialData: ' ',

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
    if (this.loginUser) {
      this.author = this.loginUser.nickname;
    }

  },
  methods: {
    fnView(idx) {
      this.requestBody.idx = idx
      this.$router.push({
        path: './detail',
        query: this.requestBody
      })
    },
	// myCustomUploadAdapterPlugin(editor) {
	// 	console.log("myCustomUploadAdapterPlugin" , editor)
    //   // CKEditor에서 플러그인으로 인식할 수 있도록 설정
    //   editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    //     return new UploadAdapter(loader);
    //   };
    // },
    onEditorReady(editor) {
		console.log("onEditorReady" , editor)

        // CKEditor가 준비된 후에 uploader 설정
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new UploadAdapter(loader);
        };
    },
    onFocus() {
      // 포커스 시의 작업을 여기에 추가할 수 있습니다.
    },
    onBlur() {
      // 포커스 잃음 시의 작업을 여기에 추가할 수 있습니다.
    },
    fnGetView() {
      if (this.idx !== undefined) {
        axios
          .get(this.$serverUrl + '/board/' + this.idx, {
            params: this.requestBody,
          })
          .then((res) => {
            this.title = res.data.title;
            this.author = res.data.author;
            //this.contents = res.data.contents;
			this.config.initialData = res.data.contents;
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
      if (this.isSaving) return; // 이미 저장 중이면 실행되지 않도록 방지
      this.isSaving = true; // 저장 중 상태 활성화

      let apiUrl = this.$serverUrl + '/board';

      if (this.title.length === 0) {
        alert('글 제목은 필수로 입력하십시오'); // 제목 필수 입력 경고
        return;
      }

      // 저장할 데이터 준비
      this.form = {
        idx: this.idx,
        title: this.title,
        contents: this.config.initialData, // CKEditor 내용 저장
        author: this.author,
      };

      if (this.idx === undefined) {
        // 새 글 저장
        axios
            .post(apiUrl, this.form)
            .then((res) => {
              alert('글이 저장되었습니다.');
              this.fnView(res.data.idx); // 저장 후 글 상세 보기로 이동
            })
            .catch((err) => {
              if (err.message.indexOf('Network Error') > -1) {
                alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.');
              }
            })
            .finally(() => {
              this.isSaving = false; // 저장 중 상태 해제
            });
      } else {
        // 글 수정
        axios
            .patch(apiUrl, this.form)
            .then((res) => {
              alert('글이 저장되었습니다.');
              this.fnView(res.data.idx); // 수정 후 글 상세 보기로 이동
            })
            .catch((err) => {
              if (err.message.indexOf('Network Error') > -1) {
                alert('네트워크가 원활하지 않습니다.\n잠시 후 다시 시도해주세요.');
              }
            })
            .finally(() => {
              this.isSaving = false; // 저장 중 상태 해제
            });
      }
    },
  },
};
</script>

<style>
</style>
