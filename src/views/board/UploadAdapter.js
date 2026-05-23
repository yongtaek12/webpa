// 1. global.js에서 GlobalState를 임포트합니다.
// 경로 수정: src/views/board/ 기준 두 단계 상위 폴더로 이동 (../../global.js)
import GlobalState from '../../global.js';
export default class UploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then( file => new Promise(((resolve, reject) => {
            this._initRequest();
            this._initListeners( resolve, reject, file );
            this._sendRequest( file );
        })))
    }

//XMLHttpRequest 객체를 준비하고, POST 요청을 설정합니다
    _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();

        // 2. 하드코딩된 URL을 GlobalState.serverUrl을 사용하도록 수정합니다.
        const url = `${GlobalState.serverUrl}/board/ckeditor5Upload`;

        xhr.open('POST', url, true);
        xhr.responseType = 'json';
    }

    //오류, 중단, 완료, 진행 상황 이벤트를 처리하는 리스너를 설정합니다.
    _initListeners(resolve, reject, file) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = '파일을 업로드 할 수 없습니다.'

        xhr.addEventListener('error', () => {reject(genericErrorText)})
        xhr.addEventListener('abort', () => reject())
        // 서버에서 응답을 받았을 때 호출될 리스너 설정
        xhr.addEventListener('load', () => {
            const response = xhr.response
            // 서버 응답이 유효하지 않거나 에러가 있으면 reject 호출
            if(!response || response.error) {
                return reject( response && response.error ? response.error.message : genericErrorText );
            }
            // 성공적인 응답 처리: Promise를 성공적으로 종료하고, 업로드된 이미지의 URL을 전달
            resolve({
                default: response.url //업로드된 파일 주소
            })
        })
    }

    //FormData를 사용해 파일을 서버에 전송합니다.
    _sendRequest(file) {
        const data = new FormData()
        data.append('upload',file)
        this.xhr.send(data)
    }
}