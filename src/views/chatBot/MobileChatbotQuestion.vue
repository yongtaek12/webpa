<template>
  <div class="mobile-chat-wrapper">

    <!-- 1. 상단 헤더: 제목, 음성 인식, 리뷰 버튼 -->
    <header class="chat-header">
      <h1 class="header-title">AI 챗봇과 대화하기</h1>
      <div class="header-buttons">
        <button id="voice-recognition-button" @click="toggleVoiceRecognition" :class="{ 'active': isVoiceRecognitionActive }">
          <i :class="isVoiceRecognitionActive ? 'fas fa-microphone' : 'fas fa-microphone-slash'"></i>
        </button>
        <button id="review-button" @click="reviewChatMessages" :disabled="isLoading">
          <i class="fas fa-highlighter"></i> <span>리뷰</span>
        </button>
      </div>
    </header>

    <!-- 2. 채팅 메시지 창 (스크롤 영역) -->
    <main id="chat-message-column-wrapper" ref="chatMessageColumnWrapper">
      <div id="chat-message-column" ref="chatBox">
        <div v-for="(message, index) in chatMessages" :key="index" :class="messageClass(message)">
          <div class="profile-icon">
            <i v-if="message.role === 'assistant'" class="fas fa-robot"></i>
            <i v-else class="fas fa-user"></i>
          </div>
          <div class="content">
            <p class="text">{{ message.content }}</p>
            <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- 3. 메시지 입력 (하단 고정) -->
    <footer id="message-input-wrapper">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <span>메시지 전송 중...</span>
      </div>

      <div id="message-input" :class="{ 'send-enabled': !isLoading && userInput.trim() }">
        <textarea
            id="message-input-field"
            ref="messageInputField"
            placeholder="메시지를 입력하세요..."
            maxlength="400"
            v-model="userInput"
            @keyup.enter.prevent="handleEnter"
            :disabled="isLoading"
        ></textarea>
        <div
            id="send-message-button"
            @click="sendMessage"
            :class="{ 'send-enabled': !isLoading && userInput.trim() }"
        >
          <i class="far fa-arrow-alt-circle-right"></i>
        </div>
      </div>
    </footer>

  </div>
</template>

<script>
// 외부 라이브러리/상태 관리 파일 임포트
import GlobalState from '../../global.js';
import axios from '@/plugins/axios.js';

export default {
  name: "MobileChatbotQuestion.vue",
  data() {
    return {
      userInput: '', // 사용자 입력
      chatMessages: [], // 채팅 메시지 배열 (상태)
      model: 'gpt-3.5-turbo',
      isLoading: false, // 로딩 상태
      isVoiceRecognitionActive: false, // 음성 인식 활성화
      recognition: null, // 음성 인식 객체
      requestBody: {},
      systemMessage: { // 초기 시스템 메시지
        role: "system",
        content: "You are an English conversation teacher. Your goal is to help students improve their English speaking skills by practicing conversations, correcting their grammar, and providing clear explanations when needed. Always respond in simple and clear English suitable for learners."
      },
    };
  },
  watch: {
    // chatMessages 배열이 변경될 때마다 스크롤을 맨 아래로 내림
    chatMessages() {
      this.scrollToBottom();
    }
  },
  methods: {
    handleGlobalKeyUp(event) {
      // 모바일 환경을 고려하여 Enter 키 기능은 하단 textarea에서만 제어
    },

    handleEnter(event) {
      if (!event.shiftKey) {
        event.preventDefault(); // Enter만 눌렀을 때 줄바꿈 방지
        this.sendMessage();
      }
      // Shift + Enter는 textarea의 기본 동작(줄바꿈)에 맡김
    },

    fnView(idx) {
      this.requestBody.idx = idx
      this.requestBody.category = 2
      this.$router.push({
        path: '/review/detail',
        query: this.requestBody
      })
    },

    // 리뷰 버튼 기능
    reviewChatMessages() {
      if (this.isLoading) return;

      try {
        this.isLoading = true;

        // 'sent' 메시지만 필터링하여 리뷰 요청에 사용할 메시지 배열 생성
        const messagesToReview = this.chatMessages.filter(message => {
          // proofread 메시지(교정 결과)는 리뷰 대상이 아님
          return !message.proofread && message.role !== 'system';
        }).map(msg => ({
          role: msg.role,
          content: msg.content
        }));


        // 사용자(user) 메시지가 존재하는지 확인
        const userMessagesExist = messagesToReview.some(message => message.role === 'user');
        if (!userMessagesExist) {
          alert('사용자가 작성한 메시지가 없습니다.');
          this.isLoading = false;
          return;
        }

        const reviewRequired = {
          role: 'system',
          content:
              "요청 사항은 다음과 같습니다.\n" +
              " 첫번째 한국말로 시작 하세요 두번째 지금까지의 대화 내용을 가지고 사용자의 영어 문장에서 문법적 오류를 분석하고, 이를 원어민 수준의 자연스러운 표현으로 수정하세요.\n" +
              " 세번째 사용자의 표현을 수정하거나 오류 문법사항 지적할 때 설명은 필수 입니다. 설명은 무조건 한국말로 설명해주세요.\n" +
              " 네번째 사용자의 언어적 약점을 파악하고, 이를 개선하기 위해 구체적인 연습 예문 몇 가지를 제안하세요.\n" +
              " 다번째 사용자가 어떻게 공부하면 좋을지 숙제를 작성해주세요.\n\n" +
              " 1~5까지 다 작성하였는지 확인하세요.\n\n" +
              "답변은 반드시 **한국어**로 작성하되, 대화 내용만 원래 영어로 표시해주세요.",
        };

        // 리뷰 요청 시스템 메시지를 추가
        messagesToReview.push(reviewRequired);

        const requestPayload = {
          model: this.model,
          messages: messagesToReview
        }

        axios.post(`${GlobalState.serverUrl}/chat-gpt/chatEnd`, requestPayload).then((result) => {
          alert('글이 저장되었습니다.');
          // 저장 후 상세 페이지로 이동
          this.fnView(result.data.board.idx);
        }).catch(error => {
          console.error('리뷰 저장 중 오류 발생:', error);
          alert('리뷰 저장에 실패했습니다.');
        }).finally(() => {
          this.isLoading = false;
        });

      } catch (error) {
        console.error('리뷰 기능 실행 중 오류 발생:', error);
        this.isLoading = false;
      }
    },

    // 챗봇과의 실제 통신 및 메시지 처리
    sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      this.isLoading = true;

      // 1. 사용자 메시지를 상태에 추가
      const userMessageContent = this.userInput;
      this.addChatMessage(userMessageContent, 'user', false);
      this.userInput = ''; // 입력 필드 초기화

      try {
        // 2. chatMessages 상태에서 요청 페이로드 생성
        // 시스템 메시지 포함 모든 대화 내용을 전송
        const messages = this.chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const requestPayload = {
          model: this.model,
          messages: messages
        };

        axios.post(`${GlobalState.serverUrl}/chat-gpt/chat`, requestPayload).then((result) => {
          const conversationResponse = result.data.conversationResponse;
          const proofreadResponse = result.data.proofreadResponse;

          const botContent = JSON.parse(conversationResponse).choices[0].message.content;
          const proofreadContent = JSON.parse(proofreadResponse).choices[0].message.content;

          // 3. 교정 메시지 및 봇 응답을 상태에 추가
          // 교정 메시지: 사용자 역할이지만, proofread 플래그가 true
          this.addChatMessage(proofreadContent, 'user', true);
          // 봇 응답
          this.addChatMessage(botContent, 'assistant', false);

          this.speakText(botContent);

        }).catch(error => {
          console.error('메시지 전송 중 오류 발생:', error);
          this.addChatMessage('오류가 발생했습니다. 다시 시도해 주세요.', 'assistant', false);
        }).finally(() => {
          this.isLoading = false;
        });
      } catch (error) {
        console.error('메시지 전송 로직 오류:', error);
        this.isLoading = false;
      }
    },

    // init 초기 시스템 메시지를 서버로 전송
    sendSystemMessage() {
      const payload = {
        model: this.model,
        messages: [this.systemMessage]
      }
      this.isLoading = true;

      axios.post(`${GlobalState.serverUrl}/chat-gpt/chat`, payload)
          .then(response => {
            const conversationResponse = response.data.conversationResponse;
            const botContent = JSON.parse(conversationResponse).choices[0].message.content;

            this.speakText(botContent);

            // chatMessages 상태에 추가
            this.addChatMessage(botContent, 'assistant', false);
          })
          .catch(error => {
            console.error('시스템 메시지 전송 중 오류:', error);
            this.addChatMessage('챗봇 초기화 중 오류가 발생했습니다.', 'assistant', false);
          })
          .finally(() => {
            this.isLoading = false;
          });
    },

    // 음성 말하기 기능
    speakText(text) {
      if (!window.speechSynthesis) {
        console.warn("이 브라우저는 Web Speech API를 지원하지 않습니다.");
        return;
      }
      if (this.recognition && this.isVoiceRecognitionActive) {
        this.recognition.stop();
        this.isVoiceRecognitionActive = false;
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
      const playSentence = (index) => {
        if (index >= sentences.length) {
          if (this.recognition && !this.isVoiceRecognitionActive) {
            this.recognition.start();
            this.isVoiceRecognitionActive = true;
          }
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentences[index]);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.2;
        utterance.onend = () => playSentence(index + 1);
        utterance.onerror = (error) => console.error(`Sentence ${index + 1} 재생 중 오류 발생:`, error);
        window.speechSynthesis.speak(utterance);
      };
      playSentence(0);
    },

    // 음성 인식 토글
    toggleVoiceRecognition() {
      if (!this.recognition) {
        this.initVoiceRecognition();
        if (!this.recognition) return; // 초기화 실패 시 중단
      }
      if (this.isVoiceRecognitionActive) {
        this.recognition.stop();
        this.isVoiceRecognitionActive = false;
      } else {
        try {
          // SpeakText가 실행 중이라면 먼저 중지
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
          this.recognition.start();
          this.isVoiceRecognitionActive = true;
        } catch (error) {
          console.warn('음성 인식 시작 중 에러:', error.message);
        }
      }
    },

    // 음성 인식 초기화
    initVoiceRecognition() {
      if (!('webkitSpeechRecognition' in window)) {
        alert('음성 인식이 지원되지 않는 브라우저입니다.');
        return;
      }
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        this.userInput += finalTranscript + " ";
      };
      recognition.onerror = (event) => {
        console.error('음성 인식 에러:', event.error);
        this.isVoiceRecognitionActive = false;
      };
      recognition.onend = () => {
        // continuous: true이므로, end 이벤트 발생 시 재시작 (사용자 의도에 따른 중지가 아닐 경우)
        if (this.isVoiceRecognitionActive) {
          try {
            recognition.start();
          } catch (error) {
            console.warn('음성 인식 재시작 중 에러:', error.message);
          }
        }
      };
      this.recognition = recognition;
    },

    /**
     * chatMessages 상태 배열에 메시지 객체를 추가합니다.
     */
    addChatMessage(text, role, isProofread = false) {
      const message = {
        role: role,
        content: text,
        timestamp: new Date().toISOString(),
        proofread: isProofread
      };
      this.chatMessages.push(message);
    },

    /**
     * 메시지 클래스를 반환합니다.
     */
    messageClass(message) {
      return {
        'message': true,
        'sent': message.role === 'user' && !message.proofread,
        'received': message.role === 'assistant',
        'proofread': message.proofread === true
      };
    },

    /**
     * 타임스탬프를 포맷합니다. (HH:MM)
     */
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      // 한국 시간대 (오전/오후 포함)
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
    },

    /**
     * 채팅 창을 맨 아래로 스크롤합니다.
     */
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$refs.chatMessageColumnWrapper;
        if (chatBox) {
          // 부드러운 스크롤 효과 추가
          chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    },
  },
  mounted() {
    // 애니메이션 관련 초기화 로직 모두 제거

    // 전역 키 이벤트 리스너는 모바일에서 불필요하므로 주석 처리하거나 제거 (현재는 제거함)
    // window.addEventListener('keyup', this.handleGlobalKeyUp);

    // 초기 시스템 메시지 전송
    this.sendSystemMessage();

    // 메시지가 로드될 때 스크롤
    this.scrollToBottom();
  },
  beforeUnmount() {
    // window.removeEventListener('keyup', this.handleGlobalKeyUp);

    // 음성 인식 및 TTS 정리
    if (this.recognition) {
      this.recognition.stop();
      this.isVoiceRecognitionActive = false;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }
};
</script>

<style lang="scss" scoped>
/* 모바일 최적화 CSS */
$primary-color: #007aff;
$sent-bg: $primary-color;
$received-bg: #e5e5ea;
$background-color: #f9f9f9;
$border-color: #d1d1d6;

/* 전체 래퍼: 화면 전체를 차지하는 Flex 컬럼 */
.mobile-chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 화면 전체 높이 */
  width: 100vw; /* 화면 전체 너비 */
  background-color: $background-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* 1. 상단 헤더 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0; // 높이 고정
  position: sticky;
  top: 0;
  z-index: 10;

  .header-title {
    font-size: 17px;
    font-weight: 600;
    margin: 0;
  }

  .header-buttons {
    display: flex;
    gap: 12px;

    button {
      background: none;
      border: none;
      color: $primary-color;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;

      &:disabled {
        color: #b0b0b0;
      }

      &#voice-recognition-button.active {
        color: #ff3b30; // 활성 시 빨간색 (녹음 중)
      }

      i {
        font-size: 20px;
      }
      span {
        // 텍스트는 모바일에서 버튼 크기를 위해 숨길 수 있으나, 여기서는 유지
        font-weight: 500;
      }
    }
  }
}

/* 2. 채팅 메시지 창 */
#chat-message-column-wrapper {
  flex-grow: 1; // 남은 공간 모두 차지
  overflow-y: auto; // 메시지가 많으면 스크롤
  padding: 10px;
  background-color: $background-color;
  -webkit-overflow-scrolling: touch; // 모바일 스크롤 가속
}

#chat-message-column {
  display: flex;
  flex-direction: column;
  gap: 12px; // 메시지 사이 간격
}

.message {
  display: flex;
  align-items: flex-end;
  max-width: 90%;

  .profile-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
    font-size: 14px;
    margin-right: 8px;
  }

  .content {
    padding: 10px 15px;
    border-radius: 18px;
    background-color: white;
    position: relative;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    max-width: calc(100% - 38px);
  }

  .text {
    font-size: 16px;
    line-height: 1.4;
    color: #333;
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
  }

  .timestamp {
    font-size: 11px;
    color: #8e8e93;
    display: block;
    margin-top: 5px;
    text-align: right;
  }

  // 받은 메시지 (봇)
  &.received {
    align-self: flex-start;
    .profile-icon {
      background-color: #6c757d; // 봇 아이콘 배경
      i { font-size: 16px; }
    }
    .content {
      background-color: $received-bg;
      border-top-left-radius: 0;
    }
  }

  // 보낸 메시지 (사용자)
  &.sent {
    align-self: flex-end;
    flex-direction: row-reverse; // 아이콘과 말풍선 순서 변경

    .profile-icon {
      background-color: $primary-color;
      margin-right: 0;
      margin-left: 8px;
    }
    .content {
      background-color: $sent-bg;
      color: white;
      border-top-right-radius: 0;

      .text { color: white; }
      .timestamp { color: rgba(255,255,255,0.7); }
    }
  }

  // 교정 메시지 (사용자 말풍선 스타일 + 교정 표시)
  &.proofread {
    align-self: flex-end;
    border: 1px dashed #4caf50;
    border-radius: 18px;
    background: #f0f9f0;
    padding: 10px 15px; // content padding 대신 직접 적용

    // 교정 메시지는 아이콘 및 content 래퍼가 필요 없음
    .profile-icon {
      display: none;
    }
    .content {
      padding: 0;
      background-color: transparent;
      box-shadow: none;
      max-width: 100%;
      .text {
        color: #388e3c; // 교정 텍스트는 녹색
      }
      .timestamp {
        color: #8e8e93;
      }
    }

    // sent와 proofread 클래스가 함께 사용되는 경우 proofread 스타일을 적용하기 위해 수정
    &.sent {
      flex-direction: row; // proofread는 sent 클래스를 이용하지 않고 자체 스타일링
    }
  }
}


/* 3. 메시지 입력 (하단 고정) */
#message-input-wrapper {
  flex-shrink: 0;
  background-color: #ffffff;
  border-top: 1px solid $border-color;
  padding: 8px 12px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

// 로딩 오버레이
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  gap: 10px;
  color: #555;
  font-weight: 500;

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid $primary-color;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


#message-input {
  display: flex;
  align-items: flex-end; // textarea가 여러 줄일 때 정렬
  gap: 10px;

  #message-input-field {
    flex-grow: 1;
    border: 1px solid $border-color;
    border-radius: 20px;
    padding: 10px 15px;
    font-size: 16px;
    line-height: 1.3;
    max-height: 100px;
    resize: none;
    font-family: inherit;

    &:disabled {
      background-color: #f5f5f5;
    }
  }

  #send-message-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: $primary-color;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    opacity: 0.5; // 기본 비활성
    transition: opacity 0.2s;
    flex-shrink: 0; // 버튼 크기 고정

    &.send-enabled {
      opacity: 1; // 활성
    }
  }
}
</style>