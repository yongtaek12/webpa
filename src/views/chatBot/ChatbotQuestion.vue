<template>
  <div id="chat-wrapper"> <!-- 전체 채팅 래퍼 div -->
    <div id="chat-bot-mood" :class="currentMood"> <!-- 챗봇의 현재 감정을 나타내는 div -->
      <div id="chat-bot-mood-icon"></div> <!-- 챗봇 감정 아이콘 div -->
    </div>
    <div id="letter-pool" ref="letterPool"></div> <!-- 편지 풀 div -->
    <div id="temp-letter-pool" ref="tempLetterPool"></div> <!-- 임시 편지 풀 div -->
    <div id="letter-overlay" ref="letterOverlay"></div> <!-- 편지 오버레이 div -->
    <div id="chat-message-window"> <!-- 채팅 메시지 창 div -->
      <div id="message-input-wrapper"> <!-- 메시지 입력 래퍼 div -->
        <!-- 음성 인식 버튼 -->
        <button id="voice-recognition-button" @click="toggleVoiceRecognition">
          <i :class="isVoiceRecognitionActive ? 'fas fa-microphone' : 'fas fa-microphone-slash'"></i>
        </button>
        <!-- 리뷰 버튼 추가 -->
        <button id="review-button" @click="reviewChatMessages">리뷰</button>
        <div id="message-input" :class="{ 'send-enabled': !isLoading && userInput.trim() }"> <!-- 메시지 입력 div -->
          <input id="message-input-field" ref="messageInputField" type="text" placeholder="Type a message" maxlength="100" v-model="userInput" @keyup.enter="sendMessage" :disabled="isLoading"> <!-- 메시지 입력 필드 -->

          <div id="send-message-button" @click="sendMessage" :class="{ 'send-enabled': !isLoading && userInput.trim() }"> <!-- 메시지 전송 버튼 div -->
            <i class="far fa-arrow-alt-circle-right"></i> <!-- 전송 아이콘 -->
          </div>
        </div>


      </div>
      <div id="chat-message-column-wrapper" class="scroll-bar" ref="chatMessageColumnWrapper"> <!-- 채팅 메시지 열 래퍼 div -->
        <div id="chat-message-container"> <!-- 채팅 메시지 컨테이너 div -->

          <div id="chat-message-column" class="static" ref="chatBox"> <!-- 채팅 메시지 열 div -->
            <div v-for="(message, index) in chatMessages" :key="index" :class="messageClass(message)"> <!-- 각 메시지 div -->
              <div class="profile-icon"> <!-- 프로필 아이콘 div -->
                <i v-if="message.role === 'assistant'" class="fas fa-robot"></i> <!-- 챗봇 아이콘 -->
                <i v-else class="fas fa-user"></i> <!-- 사용자 아이콘 -->
              </div>
              <div class="content"> <!-- 콘텐츠 div -->
                <p class="text">{{ message.content }}</p> <!-- 메시지 텍스트 -->
                <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span> <!-- 타임스탬프 -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isLoading" class="loading">메시지 전송 중...</div> <!-- 로딩 div -->
    </div>
  </div>
</template>


<script>
import axios from '@/plugins/axios.js';
// import axios from 'axios'; // axios 임포트
import { throttle } from 'lodash'; // lodash의 throttle 함수 임포트

export default {
  name: 'ChatbotInterface',
  data() {
    return {
      userInput: '', // 사용자 입력 데이터
      chatMessages: [], // 채팅 메시지 배열
      model: 'gpt-3.5-turbo', // 모델 이름
      isLoading: false, // 로딩 상태
      isVoiceRecognitionActive: false, // 음성 인식 활성화 상태
      recognition: null, // 음성 인식 객체
      moodLabel: 'Neutral', // 감정 레이블
      currentMood: 'friendly', // 현재 감정 상태
      moods: ['friendly', 'suspicious', 'boastful'], // 감정 상태 배열
      isUserSendingMessage: false, // 사용자 메시지 전송 상태
      isChatBotSendingMessage: false, // 챗봇 메시지 전송 상태
      nLetterSets: 4, // 편지 세트 수
      letterPoolIntervals: [], // 편지 풀 인터벌 배열
      resetTimeout: null, // 리셋 타임아웃
      systemMessage: {
        role: "system",
        content: "You are an English conversation teacher. Your goal is to help students improve their English speaking skills by practicing conversations, correcting their grammar, and providing clear explanations when needed. Always respond in simple and clear English suitable for learners."
      }, // 시스템 메시지
    };
  },
  methods: {
    // 리뷰 버튼 클릭 메서드
    reviewChatMessages() {
      const chatBox = this.$refs.chatBox; // 채팅 박스 참조

      if (chatBox) {
        const messages = Array.from(chatBox.querySelectorAll('.content .text')); // NodeList를 배열로 변환
        const userMessages = [];
        const allMessages = [];

        console.log('=== 모든 대화 내용 ===')

        messages.reverse().forEach((message, index) => {
          const messageText = message.innerText.trim();
          allMessages.push(messageText); // 전체 메시지 추가

          console.log(`[${index + 1}] ${message.innerText}`); // 각 말풍선 텍스트 출력
          const isUserMessage = message.parentElement.parentElement.classList.contains("sent");
          if (isUserMessage) {
            userMessages.push(message.innerText.trim());
          }
        });
        console.log('전체 메시지:', allMessages);
        console.log('사용자 메시지:', userMessages);
        // 사용자가 작성한 내용이 없으면 알림을 띄우고 함수 종료
        if (userMessages.length === 0) {
          alert("사용자가 작성한 메시지가 없습니다.");
          return;
        }
        // 서버 요청 payload 생성
        const payload = {
          model: this.model,
          allMessages: allMessages.join("\n"), // 전체 메시지를 합침
          userMessages: userMessages.join("\n"), // 사용자 메시지만 합침
          messages: [
            {
              role: "system",
              content:
                  "Please correct the following sentences for grammar mistakes and improve them to sound more natural, as if written by a native English speaker. " +
                  "Additionally, explain why the correction was made and provide reasons why native speakers would choose these expressions."
            },
            {
              role: "user",
              content: userMessages.join("\n"), // 사용자가 작성한 메시지 합치기
            },
          ],
        }
        // 서버에 요청
        axios
            .post("http://localhost:8085/chat-gpt/chatEnd", payload)
            .then((response) => {
              const correctedMessages =
                  response.data.choices[0].message.content || "교정된 메시지가 없습니다.";

              console.log("=== 교정된 메시지 ===");
              console.log(correctedMessages);

              // 결과를 화면에 표시하거나 알림
              alert("교정 결과:\n" + correctedMessages);
            })
            .catch((error) => {
              console.error("교정 요청 중 오류 발생:", error);
            });
      } else {
        console.error('chatBox를 찾을 수 없습니다.');
      }

    },
    // 시스템 메시지를 서버로 전송
    sendSystemMessage() {
      const payload = {
        model: this.model,
        messages: [this.systemMessage] // 시스템 메시지만 포함
      }
      this.isLoading = true;

      axios.post('http://localhost:8085/chat-gpt/chat', payload)
          .then(response => {
            const botContent = response.data.choices[0].message.content;


            this.speakText(botContent);
            this.chatMessages.push({
              role: 'assistant',
              content: botContent,
              timestamp: new Date().toISOString()
            });
          })
          .catch(error => {
            console.error('시스템 메시지 전송 중 오류:', error);
          })
          .finally(() => {
            this.isLoading = false;
          });
    },
    // 음성 말하기 기능 추가
    speakText(text) {
      // console.log("speakText : ", text);
      if (!window.speechSynthesis) {
        console.warn("이 브라우저는 Web Speech API를 지원하지 않습니다.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      // utterance.lang = 'ko-KR'; // 한국어 설정
      utterance.lang = 'en-US'; // 영어 설정
      utterance.rate = 1.0; // 말하기 속도
      utterance.pitch = 1.2; // 음 높이

      // 음성 재생
      window.speechSynthesis.speak(utterance);
    },
    /**
     * 감정 상태를 설정합니다.
     * @param {number} time - 간격 시간
     */
    setMoodInterval(time) {
      this.moodInterval = setInterval(() => {
        clearInterval(this.moodInterval); // 이전 간격을 지웁니다
        // this.setChatbotMood(); // 챗봇 감정 상태를 설정합니다
        this.setMoodInterval(this.getRandMoodInterval()); // 랜덤 감정 상태 간격을 설정합니다
      }, time);
    },
    // 음성 인식 활성화/비활성화 토글
    toggleVoiceRecognition() {
      if (!this.recognition) {
        this.initVoiceRecognition(); // 음성 인식 초기화
      }
      if (this.isVoiceRecognitionActive) {
        this.recognition.stop(); // 음성 인식 중지
        this.isVoiceRecognitionActive = false;
      } else {
        // 음성 인식이 이미 시작되지 않았다면 시작
        try {
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
      recognition.lang = 'en-US'; // 영어 설정
      recognition.continuous = true; // 연속 인식
      recognition.interimResults = false; // 중간 결과 비활성화
      recognition.onresult = (event) => {
        let finalTranscript = ''; // 최종 텍스트만 저장
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            finalTranscript += transcript; // 최종 결과만 추가
          }
        }
        // 중복 제거 후 userInput 업데이트
        this.userInput = finalTranscript;
        console.log("최종 인식된 텍스트:", this.userInput);
      };
      recognition.onerror = (event) => {
        console.error('음성 인식 에러:', event.error);
        this.isVoiceRecognitionActive = false;
      };
      recognition.onend = () => {
        if (this.isVoiceRecognitionActive) {
          try {
            recognition.start(); // 음성 인식 재시작 (연속 모드)
          } catch (error) {
            console.warn('음성 인식 재시작 중 에러:', error.message);
          }
        }
      };
      this.recognition = recognition;
    },
    /**
     * 채팅 메시지를 생성합니다.
     * @param {string} text - 메시지 내용
     * @param {boolean} isReceived - 수신 여부
     * @returns {HTMLElement} 생성된 채팅 메시지
     */
    createChatMessage(text, isReceived) {
      const message = document.createElement('div'); // 메시지 div 생성
      const profileIcon = document.createElement('div'); // 프로필 아이콘 div 생성
      const icon = document.createElement('i'); // 아이콘 생성
      const content = document.createElement('div'); // 콘텐츠 div 생성
      const contentText = document.createElement('h1'); // 콘텐츠 텍스트 생성
      const direction = isReceived ? 'received' : 'sent'; // 수신 여부에 따라 방향 설정

      // Setting classes
      this.addClass(content, 'content'); // 콘텐츠에 클래스 추가
      this.addClass(content, 'invisible'); // 콘텐츠에 invisible 클래스 추가
      this.addClass(contentText, 'text'); // 콘텐츠 텍스트에 클래스 추가
      this.addClass(contentText, 'invisible'); // 콘텐츠 텍스트에 invisible 클래스 추가
      this.appendContentText(contentText, text); // 텍스트 추가
      content.appendChild(contentText); // 콘텐츠에 텍스트 추가

      this.addClass(profileIcon, 'profile-icon'); // 프로필 아이콘에 클래스 추가
      this.addClass(profileIcon, 'invisible'); // 프로필 아이콘에 invisible 클래스 추가
      profileIcon.appendChild(icon); // 프로필 아이콘에 아이콘 추가

      this.addClass(message, 'message'); // 메시지에 클래스 추가
      this.addClass(message, direction); // 메시지에 방향 클래스 추가

      if (isReceived) {
        this.addClass(icon, 'fab'); // 수신 메시지의 아이콘에 fab 클래스 추가
        this.addClass(icon, 'fa-cloudsmith'); // 수신 메시지의 아이콘에 fa-cloudsmith 클래스 추가
        this.addClass(message, this.currentMood); // 메시지에 현재 감정 상태 클래스 추가
        message.appendChild(profileIcon); // 메시지에 프로필 아이콘 추가
        message.appendChild(content); // 메시지에 콘텐츠 추가
      } else {
        this.addClass(icon, 'far'); // 발신 메시지의 아이콘에 far 클래스 추가
        this.addClass(icon, 'fa-user'); // 발신 메시지의 아이콘에 fa-user 클래스 추가
        message.appendChild(content); // 메시지에 콘텐츠 추가
        message.appendChild(profileIcon); // 메시지에 프로필 아이콘 추가
      }

      return message; // 생성된 메시지를 반환합니다
    },
    /**
     * 텍스트 내용을 추가합니다.
     * @param {HTMLElement} contentText - 콘텐츠 텍스트 요소
     * @param {string} text - 추가할 텍스트
     */
    appendContentText(contentText, text) {
      for (let i = 0; i < text.length; i++) {
        const letter = document.createElement('span'); // 각 글자를 위한 span 요소 생성
        letter.innerHTML = text[i]; // span 요소에 글자 설정
        this.setAttr(letter, 'data-letter', text[i]); // span 요소에 data-letter 속성 설정
        contentText.appendChild(letter); // 콘텐츠 텍스트에 span 요소 추가
      }
    },
    /**
     * 요소에 클래스를 추가합니다.
     * @param {HTMLElement} el - 요소
     * @param {string} className - 클래스 이름
     */
    addClass(el, className) {
      el.classList.add(className); // 요소에 클래스 추가
    },
    /**
     * 요소에서 클래스를 제거합니다.
     * @param {HTMLElement} el - 요소
     * @param {string} className - 클래스 이름
     */
    removeClass(el, className) {
      el.classList.remove(className); // 요소에서 클래스 제거
    },
    /**
     * 요소에 속성을 설정합니다.
     * @param {HTMLElement} el - 요소
     * @param {string} attr - 속성 이름
     * @param {string} value - 속성 값
     */
    setAttr(el, attr, value) {
      el.setAttribute(attr, value); // 요소에 속성 설정
    },
    /**
     * 요소의 위치를 설정합니다.
     * @param {HTMLElement} el - 요소
     * @param {number} x - X 좌표
     * @param {number} y - Y 좌표
     */
    setElPos(el, x, y) {
      el.style.left = `${x}px`; // 요소의 왼쪽 위치 설정
      el.style.top = `${y}px`; // 요소의 위쪽 위치 설정
    },
    /**
     * 요소의 스타일을 설정합니다.
     * @param {HTMLElement} el - 요소
     * @param {string} style - 스타일 이름
     * @param {string} value - 스타일 값
     */
    setStyle(el, style, value) {
      el.style[style] = value; // 요소의 스타일 설정
    },
    /**
     * 부모 요소에서 자식 요소를 제거합니다.
     * @param {HTMLElement} parent - 부모 요소
     * @param {HTMLElement} child - 자식 요소
     */
    removeChild(parent, child) {
      try {
        if (child.parentNode === parent) {
          parent.removeChild(child); // 부모 요소에서 자식 요소 제거
        }
      }catch{
        console.log("removeChild error")
      }
    },
    /**
     * 채팅봇의 감정 상태를 설정합니다.
     */
    setChatbotMood() {
      const rand = this.getRand(1, 3); // 1과 3 사이의 랜덤 숫자 생성
      this.currentMood = this.moods[rand - 1]; // 랜덤 감정 상태 설정
      const chatBotMoodEl = this.$refs.chatBotMood; // 챗봇 감정 요소 참조
      if (chatBotMoodEl) {
        this.moods.forEach(mood => {
          chatBotMoodEl.classList.remove(mood); // 모든 감정 상태 클래스 제거
        });
        chatBotMoodEl.classList.add(this.currentMood); // 현재 감정 상태 클래스 추가
        const chatBotMoodValueEl = this.$refs.chatBotMoodValue; // 챗봇 감정 값 요소 참조
        if (chatBotMoodValueEl) {
          chatBotMoodValueEl.innerHTML = this.currentMood; // 챗봇 감정 값을 현재 감정 상태로 설정
        }
      }
    },


    /**
     * 입력 필드에 값이 있는지 확인합니다.
     * @returns {boolean} 값이 있으면 true, 없으면 false
     */
    checkIfInputFieldHasVal() {
      return this.userInput.length > 0; // 입력 필드에 값이 있는지 확인
    },
    /**
     * 입력을 토글합니다.
     */
    toggleInput() {
      const canSendMessage = this.checkIfInputFieldHasVal() && !this.isUserSendingMessage && !this.isChatBotSendingMessage; // 메시지 전송 가능 여부 확인
      const messageInputEl = this.$refs.messageInput; // 메시지 입력 요소 참조
      if (messageInputEl) {
        if (canSendMessage) {
          messageInputEl.classList.add('send-enabled'); // 전송 가능 시 클래스 추가
        } else {
          messageInputEl.classList.remove('send-enabled'); // 전송 불가 시 클래스 제거
        }
      }
    },
    /**
     * 랜덤 감정 상태 간격을 반환합니다.
     * @returns {number} 랜덤 감정 상태 간격
     */
    getRandMoodInterval() {
      return this.getRand(20000, 40000); // 20000과 40000 사이의 랜덤 간격 반환
    },
    /**
     * 채팅봇 메시지를 전송합니다.
     */
    sendChatbotMessage() {
																									
      const text = this.getChatbotMessageText(); // 챗봇 메시지 텍스트 생성
      this.isChatBotSendingMessage = true; // 챗봇 메시지 전송 상태 설정
      this.addChatMessage(text, true); // 챗봇 메시지 추가
      // 챗봇 메시지를 음성으로 읽음
      this.speakText(text);
      setTimeout(() => {
        this.isChatBotSendingMessage = false; // 챗봇 메시지 전송 상태 해제
        this.toggleInput(); // 입력 토글
        this.scrollToBottom(); // 메시지 창을 맨 아래로 스크롤
      }, 4000);
		  
    },
    sendMessage() {
      if (!this.userInput.trim()) return; // 입력이 없으면 반환

      const timestamp = new Date().toISOString(); // 타임스탬프 생성
      const userMessage = { role: 'user', content: this.userInput, timestamp: timestamp }; // 사용자 메시지 객체 생성
      this.addChatMessage(userMessage.content, false); // 사용자 메시지 추가
      this.userInput = ''; // 입력 필드 초기화
      this.isLoading = true; // 로딩 상태 설정
      try {
        const requestPayload = {
          model: this.model,
          messages: [...this.chatMessages, userMessage].map(message => ({
            role: message.role === 'user' ? 'user' : 'assistant',
            content: message.content,
            timestamp: message.timestamp
          }))
        };

        axios.post('http://localhost:8085/chat-gpt/chat', requestPayload).then((result) => {
          const botContent = result.data.choices[0].message.content; // 챗봇 응답 내용
          console.log("응답 내용 챗봇 : ", botContent);
          setTimeout(() => {
            this.addChatMessage(botContent, true); // 챗봇 메시지 추가
            // 챗봇 메시지를 음성으로 읽음
            this.speakText(botContent);

          }, 2000); // 3초 후에 새 메시지 추가
        }).finally(() => {
          this.isLoading = false; // 로딩 상태 해제
          // this.scrollToBottomOfMessages(); // 메시지 창을 맨 아래로 스크롤
          this.toggleInput(); // 입력 토글
        });
      } catch (error) {
        console.error('메시지 전송 중 오류 발생:', error); // 오류 로그 출력
        const errorMessage = {
          role: 'assistant',
          content: '오류가 발생했습니다. 다시 시도해 주세요.',
          timestamp: new Date().toLocaleString()
        };
        this.chatMessages.push(errorMessage); // 오류 메시지 추가
        this.isLoading = false; // 로딩 상태 해제
        // this.scrollToBottomOfMessages(); // 메시지 창을 맨 아래로 스크롤
        this.toggleInput(); // 입력 토글
      }
    },

    /**
     * 랜덤 인사를 반환합니다.
     * @returns {string} 랜덤 인사
     */
    getRandGreeting() {
      let rand = 0;
      switch (this.currentMood) {
        case 'friendly':
          rand = this.getRand(1, this.greetings.friendly.length);
          return this.greetings.friendly[rand - 1];
        case 'suspicious':
          rand = this.getRand(1, this.greetings.suspicious.length);
          return this.greetings.suspicious[rand - 1];
        case 'boastful':
          rand = this.getRand(1, this.greetings.boastful.length);
          return this.greetings.boastful[rand - 1];
        default:
          break;
      }
    },
    /**
     * 랜덤 대화를 반환합니다.
     * @returns {string} 랜덤 대화
     */
    getRandConvo() {
      let rand = 0;
      switch (this.currentMood) {
        case 'friendly':
          rand = this.getRand(1, this.convo.friendly.length);
          return this.convo.friendly[rand - 1];
        case 'suspicious':
          rand = this.getRand(1, this.convo.suspicious.length);
          return this.convo.suspicious[rand - 1];
        case 'boastful':
          rand = this.getRand(1, this.convo.boastful.length);
          return this.convo.boastful[rand - 1];
        default:
          break;
      }
    },
    /**
     * 채팅 메시지를 추가합니다.
     * @param {string} text - 메시지 내용
     * @param {boolean} isReceived - 수신 여부
     */
    addChatMessage(text, isReceived) {
      try {
        const message = this.createChatMessage(text, isReceived); // 채팅 메시지 생성
        const chatBox = this.$refs.chatBox; // 채팅 박스 참조
        // 기존 메시지들을 위로 이동시키는 코드
        this.$nextTick(() => {
          // DOM 업데이트가 완료된 후 실행될 코드

          // 새 메시지를 이동 후 추가
          setTimeout(() => {
            try {
              chatBox.prepend(message); // 메시지를 채팅 박스에 추가
            }catch (innerError){
              console.error("setTimeout 내부 에러:", innerError);
            }
          }, 1); // 3초 후에 새 메시지 추가
        });
        this.toggleInput(); // 입력 토글
        setTimeout(() => {
          const profileIcon = message.querySelector('.profile-icon'); // 프로필 아이콘 참조
          const content = message.querySelector('.content'); // 콘텐츠 참조
          this.removeClass(profileIcon, 'invisible'); // 프로필 아이콘에서 invisible 클래스 제거
          setTimeout(() => {
            this.removeClass(content, 'invisible'); // 콘텐츠에서 invisible 클래스 제거
            setTimeout(() => {
              this.animateMessageLetters(message, isReceived); // 메시지의 편지 애니메이션
              setTimeout(() => this.replenishLetterPool(this.nLetterSets), 2500); // 편지 풀 보충
            }, 1000);
          }, 250);
        }, 250);
      }catch (error){
        console.log("스크립트 에러 : ", error)
      }
    },
    /**
     * 메시지 창을 맨 아래로 스크롤합니다.
     */
    // scrollToBottomOfMessages() {
      // console.log("scrollToBottomOfMessages");
      // this.$nextTick(() => {
      //   const chatMessageColumnWrapper = this.$refs.chatBox; // 채팅 메시지 열 래퍼 참조
      //   if (chatMessageColumnWrapper) {
      //     chatMessageColumnWrapper.scrollTop = chatMessageColumnWrapper.scrollHeight; // 메시지 창을 맨 아래로 스크롤

      //     const messages = chatMessageColumnWrapper.querySelectorAll('.message.received, .message.sent'); // 수신 및 발신 메시지 선택
																		   

      //     let totalHeight = 0; // 총 높이 초기화

      //     messages.forEach((message) => {
      //       const currentTop = message.style.top ? parseInt(message.style.top, 10) : 0; // 현재 상단 위치 계산
      //       message.style.top = `${currentTop - message.offsetHeight}px`; // 각 메시지의 상단 위치 설정
      //       totalHeight += message.offsetHeight; // 총 높이 증가
      //     });

      //     const newMessage = document.createElement('div'); // 새로운 메시지 div 생성
      //     newMessage.classList.add('message', 'received'); // 새로운 메시지에 클래스 추가
      //     newMessage.innerText = ''; // 새로운 메시지 텍스트 설정
      //     chatMessageColumnWrapper.appendChild(newMessage); // 새로운 메시지를 채팅 메시지 열 래퍼에 추가

      //     newMessage.style.position = 'relative'; // 새로운 메시지의 위치 상대적으로 설정
      //     newMessage.style.top = `${totalHeight}px`; // 새로운 메시지의 상단 위치 설정
      //   }
      // });									  
	   
	   
    // },
    /**
     * 편지 풀을 보충합니다.
     * @param {number} nSets - 채울 편지 세트 수
     */
    replenishLetterPool(nSets = 1) {
      try{
        const poolLetters = Array.from(this.$refs.letterPool.childNodes); // 편지 풀의 자식 요소 배열 생성
        let currentLetters = []; // 현재 편지 배열 초기화
        let missingLetters = []; // 누락된 편지 배열 초기화
        let lettersToAdd = []; // 추가할 편지 배열 초기화

        for (let i = 0; i < poolLetters.length; i++) {
          currentLetters.push(poolLetters[i].dataset.letter); // 현재 편지 배열에 편지 추가
        }

        missingLetters = [...missingLetters, ...this.findMissingLetters(currentLetters, nSets, false)]; // 소문자 누락된 편지 배열 추가
        missingLetters = [...missingLetters, ...this.findMissingLetters(currentLetters, nSets, true)]; // 대문자 누락된 편지 배열 추가

        for (let i = 0; i < missingLetters.length; i++) {
          const val = missingLetters[i]; // 누락된 편지 값
          lettersToAdd.push(this.createLetter('pool-letter', val)); // 추가할 편지 배열에 편지 추가
        }
        this.setRandLetterPaths(lettersToAdd); // 랜덤 편지 경로 설정
      }catch (error){
        console.log("replenishLetterPool : ", error)
      }

    },
    /**
     * 누락된 편지를 찾습니다.
     * @param {Array} letters - 현재 편지 배열
     * @param {number} lCount - 필요한 편지 수
     * @param {boolean} isUpperCase - 대문자 여부
     * @returns {Array} 누락된 편지 배열
     */
    findMissingLetters(letters, lCount, isUpperCase) {
      let missingLetters = []; // 누락된 편지 배열 초기화
      for (let i = 65; i <= 90; i++) {
        let val = isUpperCase ? String.fromCharCode(i) : String.fromCharCode(i).toLowerCase(); // 대문자 또는 소문자 편지 값
        let nLetter = letters.filter(letter => letter === val).length; // 편지 수
        if (nLetter < lCount) {
          let j = nLetter; // 현재 편지 수
          while (j < lCount) {
            missingLetters.push(val); // 누락된 편지 배열에 편지 추가
            j++;
          }
        }
      }
	 
      return missingLetters; // 누락된 편지 배열 반환
    },
    /**
     * 채팅봇 메시지 텍스트를 반환합니다.
     * @returns {string} 채팅봇 메시지 텍스트
     */
    getChatbotMessageText() {
      if (this.chatbotMessageIndex === 0) {
        return this.getRandGreeting(); // 랜덤 인사 반환
      } else {
        return this.getRandConvo(); // 랜덤 대화 반환
      }
    },
    /**
     * 편지 풀을 초기화합니다.
     */
    initLetterPool() {
      this.clearLetterPool(); // 편지 풀 지우기
      this.fillLetterPool(4); // 편지 풀 채우기
    },
    /**
     * 편지 풀을 채웁니다.
     * @param {number} nSets - 채울 편지 세트 수
     * 소문자와 대문자 알파벳을 생성.
     * 이 편지들에 대해 무작위 경로를 설정하여 화면을 돌아다니도록 설정.												  
																									
     */
    fillLetterPool(nSets = 2) {
      for (let i = 0; i < nSets; i++) {
        const lCaseLetters = this.getAlphabet(false); // 소문자 알파벳 배열 생성
        const uCaseLetters = this.getAlphabet(true); // 대문자 알파벳 배열 생성
        this.setRandLetterPaths(lCaseLetters); // 소문자 경로 설정
        this.setRandLetterPaths(uCaseLetters); // 대문자 경로 설정
      }
    },
    /**
     * 랜덤 편지 경로를 설정합니다.
     * @param {Array} letters - 편지 배열
     * 편지에 대해 무작위 시작 위치와 다음 위치를 설정.
     * 일정 시간 동안 무작위 경로로 편지가 움직이도록 설정.																		   
																				 
     */
    setRandLetterPaths(letters) {
      const letterPool = this.$refs.letterPool; // 편지 풀 참조
      if (!letterPool) {
																
        return;
      }

      for (let i = 0; i < letters.length; i++) {
        let letter = letters[i]; // 편지 요소
        let startRand = this.getRand(1, 4); // 랜덤 시작 위치
        let nextRand = this.getRandExcept(1, 4, startRand); // 랜덤 다음 위치
        let startPos = this.getRandPosOffScreen(startRand); // 시작 위치 설정
        let nextPos = this.getRandPosOffScreen(nextRand); // 다음 위치 설정
        let transitionPeriod = 30000; // 전환 기간 설정
        let delay = this.getRand(0, 30000) * -1; // 지연 시간 설정
        let transition = `left ${transitionPeriod}ms linear ${delay}ms, top ${transitionPeriod}ms linear ${delay}ms, opacity 0.5s`; // 전환 스타일 설정

        this.setElPos(letter, startPos.x, startPos.y); // 편지 시작 위치 설정
        this.setStyle(letter, 'transition', transition); // 편지 전환 스타일 설정
        this.addClass(letter, 'invisible'); // 편지에 invisible 클래스 추가
        letterPool.appendChild(letter); // 편지를 편지 풀에 추가
        setTimeout(() => {
          this.setElPos(letter, nextPos.x, nextPos.y); // 편지 다음 위치 설정
          this.removeClass(letter, 'invisible'); // 편지에서 invisible 클래스 제거
          let interval = setInterval(() => {
            this.startNewLetterPath(letter, nextRand, interval); // 새로운 편지 경로 시작
          }, 30000 + delay);
        }, 1);
      }
    },
    /**
     * 새로운 편지 경로를 시작합니다.
     * @param {HTMLElement} letter - 편지 요소
     * @param {number} nextRand - 다음 랜덤 값
     * @param {number} interval - 간격 시간
     */
    startNewLetterPath(letter, nextRand, interval) {
      clearInterval(interval); // 이전 간격을 지웁니다
      nextRand = this.getRandExcept(1, 4, nextRand); // 다음 랜덤 값 생성
      let nextPos = this.getRandPosOffScreen(nextRand); // 다음 위치 설정
      let transitionPeriod = 30000; // 전환 기간 설정
      let delay = this.getRand(0, 30000); // 지연 시간 설정
      let transition = `left ${transitionPeriod}ms linear ${delay}ms, top ${transitionPeriod}ms linear ${delay}ms, opacity 0.5s`; // 전환 스타일 설정
      this.setElPos(letter, nextPos.x, nextPos.y); // 편지 위치 설정
      this.setStyle(letter, 'transition', transition); // 편지 전환 스타일 설정
      interval = setInterval(() => {
        this.startNewLetterPath(letter, nextRand, interval); // 새로운 편지 경로 시작
      }, 30000 + delay);
    },
    /**
     * 대문자 여부에 따른 알파벳 배열을 반환합니다.
     * @param {boolean} isUpperCase - 대문자 여부
     * @returns {Array} 알파벳 배열
     */
    getAlphabet(isUpperCase) {
      let letters = []; // 알파벳 배열 초기화
      for (let i = 65; i <= 90; i++) {
        let val = String.fromCharCode(i); // 알파벳 생성
        if (!isUpperCase) val = val.toLowerCase(); // 소문자로 변환
        letters.push(this.createLetter('pool-letter', val)); // 알파벳 배열에 편지 추가
      }
      return letters; // 알파벳 배열 반환
    },
    /**
     * 편지 요소를 생성합니다.
     * @param {string} cName - 클래스 이름
     * @param {string} val - 편지 값
     * @returns {HTMLElement} 생성된 편지 요소
     */
    createLetter(cName, val) {
      const letter = document.createElement('div'); // 편지 div 생성
      this.addClass(letter, cName); // 편지에 클래스 추가
      this.setAttr(letter, 'data-letter', val); // 편지에 data-letter 속성 설정
      letter.innerHTML = val; // 편지 내용 설정
      return letter; // 생성된 편지 반환
    },
    /**
     * 편지 풀을 지웁니다.
     */
    clearLetterPool() {
      const LETTER_POOL = this.$refs.letterPool; // 편지 풀 참조
      if (LETTER_POOL) {
        while (LETTER_POOL.firstChild) {
          LETTER_POOL.removeChild(LETTER_POOL.firstChild); // 편지 풀의 자식 요소 제거
        }
      }
    },
    /**
     * 메시지의 편지를 애니메이션합니다.
     * @param {HTMLElement} message - 메시지 요소
     * @param {boolean} isReceived - 수신 여부
     */
    animateMessageLetters(message, isReceived) {
      try {
        const content = message.getElementsByClassName('content')[0]; // 콘텐츠 참조
        if (!content) {

          return;
        }

        const contentText = content.getElementsByClassName('text')[0]; // 콘텐츠 텍스트 참조
        if (!contentText) {

          return;
        }

        const textContent = contentText.textContent; // 텍스트 내용
        if (!textContent) {

          return;
        }

        contentText.innerHTML = ''; // 콘텐츠 텍스트 초기화
        const letters = []; // 편지 배열 초기화

        for (let char of textContent) {
          const span = document.createElement('span'); // 각 글자를 위한 span 요소 생성
          span.textContent = char; // span 요소에 글자 설정
          span.dataset.letter = char; // span 요소에 data-letter 속성 설정
          contentText.appendChild(span); // 콘텐츠 텍스트에 span 요소 추가
          letters.push(span); // 편지 배열에 span 요소 추가
        }

        if (letters.length === 0) {

          return;
        }

        for (let i = 0; i < letters.length; i++) {
          const letter = letters[i]; // 편지 요소
          const targetLetter = this.findLetterInPool(letter.dataset.letter); // 편지 풀에서 편지 찾기
          const finalPos = letter.getBoundingClientRect(); // 최종 위치 계산
          if (targetLetter) {
            this.animateOverlayLetter(targetLetter, contentText, finalPos, isReceived); // 오버레이 편지 애니메이션
          } else {
            const tempLetter = this.createLetter('temp-letter', letter.dataset.letter); // 임시 편지 생성
            const pos = this.getRandPosOffScreen(); // 랜덤 위치 설정
            this.addClass(tempLetter, 'invisible'); // 임시 편지에 invisible 클래스 추가
            this.setElPos(tempLetter, pos.x, pos.y); // 임시 편지 위치 설정
            this.$refs.tempLetterPool.appendChild(tempLetter); // 임시 편지를 임시 편지 풀에 추가
            this.animateOverlayLetter(tempLetter, contentText, finalPos, isReceived); // 오버레이 편지 애니메이션
            setTimeout(() => {
              this.removeChild(this.$refs.tempLetterPool, tempLetter); // 임시 편지 제거
            }, 100);
          }
        }
      }catch(error){
        console.log("animateMessageLetters : " + error)
      }

    },
    /**
     * 오버레이 편지를 애니메이션합니다.
     * @param {HTMLElement} letter - 편지 요소
     * @param {HTMLElement} contentText - 콘텐츠 텍스트 요소
     * @param {Object} finalPos - 최종 위치
     * @param {boolean} isReceived - 수신 여부
     */
    animateOverlayLetter(letter, contentText, finalPos, isReceived) {
      this.removePoolLetter(letter); // 편지 풀에서 편지 제거
      const initPos = letter.getBoundingClientRect(); // 초기 위치 계산
      const overlayLetter = document.createElement('span'); // 오버레이 편지 span 요소 생성
      this.addClass(overlayLetter, 'overlay-letter'); // 오버레이 편지에 클래스 추가
      this.addClass(overlayLetter, 'in-flight'); // 오버레이 편지에 in-flight 클래스 추가
      overlayLetter.innerHTML = letter.dataset.letter; // 오버레이 편지 내용 설정
      if(isReceived){
        this.setElPos(overlayLetter, initPos.left, initPos.top+400); // 오버레이 편지 초기 위치 설정
      }else{
        this.setElPos(overlayLetter,  window.innerWidth - initPos.right, initPos.top+400)

        // this.setElPosFromRight(overlayLetter,

      }
      
      this.$refs.letterOverlay.appendChild(overlayLetter); // 오버레이 편지를 오버레이에 추가
      setTimeout(() => {
        this.setElPos(overlayLetter, finalPos.left-109, finalPos.top-280); // 오버레이 편지 최종 위치 설정
        setTimeout(() => {
          this.removeClass(contentText, 'invisible'); // 콘텐츠 텍스트에서 invisible 클래스 제거
          this.addClass(overlayLetter, 'invisible'); // 오버레이 편지에 invisible 클래스 추가
          setTimeout(() => {
            this.removeChild(this.$refs.letterOverlay, overlayLetter); // 오버레이 편지 제거
          }, 1000);
        }, 1500);
      }, 100);
    },
    /**
     * 편지 풀에서 편지를 찾습니다.
     * @param {string} targetLetter - 찾을 편지
     * @returns {HTMLElement|null} 찾은 편지 또는 null
     */
    findLetterInPool(targetLetter) {
      try{
        const letters = Array.from(this.$refs.letterPool.childNodes); // 편지 풀의 자식 요소 배열 생성
        let foundLetter = null; // 찾은 편지 초기화
        for (let i = 0; i < letters.length; i++) {
          const nextLetter = letters[i]; // 편지 요소
          if (nextLetter.dataset.letter === targetLetter && !nextLetter.dataset.found) {
            foundLetter = letters[i]; // 찾은 편지 설정
            this.setAttr(foundLetter, 'data-found', true); // 찾은 편지에 data-found 속성 설정
            break;
          }
        }
        return foundLetter; // 찾은 편지 반환
      }catch(error){
        console.log(error)
      }


    },
    /**
     * 편지를 풀에서 제거합니다.
     * @param {HTMLElement} letter - 제거할 편지
     */
    removePoolLetter(letter) {
      try {
        this.addClass(letter, 'invisible'); // 편지에 invisible 클래스 추가
        setTimeout(() => {
          this.removeChild(this.$refs.letterPool, letter); // 편지 풀에서 편지 제거
        }, 500);
      }catch (error){
        console.log("스크립트 에러 : ", error);
      }
    },
    /**
     * 오른쪽에서부터 요소의 위치를 설정합니다.
     * @param {HTMLElement} el - 요소
     * @param {number} x - X 좌표
     * @param {number} y - Y 좌표
     */
    setElPosFromRight(el, x, y) {
      this.setStyle(el, 'right', `${x}px`); // 요소의 오른쪽 위치 설정
      this.setStyle(el, 'top', `${y}px`); // 요소의 위쪽 위치 설정
    },



    /**
     * 메시지의 클래스를 반환합니다.
     * @param {Object} message - 메시지 객체
     * @returns {string} 메시지 클래스
     */
    messageClass(message) {
      return {
        'message': true,
        'sent': message.role === 'user',
        'received': message.role === 'assistant',
        'friendly': message.role === 'assistant' && this.currentMood === 'friendly',
        'suspicious': message.role === 'assistant' && this.currentMood === 'suspicious',
        'boastful': message.role === 'assistant' && this.currentMood === 'boastful',
      };
    },
    /**
     * 타임스탬프를 포맷합니다.
     * @param {string} timestamp - 타임스탬프
     * @returns {string} 포맷된 타임스탬프
     */
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp); // 날짜 객체 생성
      return date.toLocaleString(); // 날짜를 로케일 문자열로 변환
    },
    /**
     * 채팅 창을 맨 아래로 스크롤합니다.
     */
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$refs.chatBox; // 채팅 박스 참조
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight; // 채팅 박스를 맨 아래로 스크롤
        }
      });
    },
    /**
     * 응답에 따라 감정 상태를 설정합니다.
     * @param {string} response - 응답
     */
    setMoodBasedOnResponse(response) {
      if (response.includes('happy')) {
        this.moodLabel = 'Happy';
        this.currentMood = 'friendly';
      } else if (response.includes('suspicious')) {
        this.moodLabel = 'Suspicious';
        this.currentMood = 'suspicious';
      } else if (response.includes('boastful')) {
        this.moodLabel = 'Boastful';
        this.currentMood = 'boastful';
      } else {
        this.moodLabel = 'Neutral';
        this.currentMood = 'friendly';
      }
    },
    /**
     * 최소값과 최대값 사이의 랜덤 숫자를 반환합니다.
     * @param {number} min - 최소값
     * @param {number} max - 최대값
     * @returns {number} 랜덤 숫자
     */
    getRand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min; // 최소값과 최대값 사이의 랜덤 숫자 반환
    },
    /**
     * 화면 밖 랜덤 위치를 반환합니다.
     * @param {number} quadrant - 사분면
     * @returns {Object} 랜덤 위치
     */
    getRandPosOffScreen(quadrant) {
      switch (quadrant) {
        case 1: return { x: this.getRand(0, window.innerWidth), y: -50 };
        case 2: return { x: window.innerWidth + 50, y: this.getRand(0, window.innerHeight) };
        case 3: return { x: this.getRand(0, window.innerWidth), y: window.innerHeight + 50 };
        case 4: return { x: -50, y: this.getRand(0, window.innerHeight) };
        default: return { x: this.getRand(0, window.innerWidth), y: -50 };
      }
    },
    /**
     * 특정 숫자를 제외한 최소값과 최대값 사이의 랜덤 숫자를 반환합니다.
     * @param {number} min - 최소값
     * @param {number} max - 최대값
     * @param {number} except - 제외할 숫자
     * @returns {number} 랜덤 숫자
     */
    getRandExcept(min, max, except) {
      let num;
      do {
        num = this.getRand(min, max); // 최소값과 최대값 사이의 랜덤 숫자 생성
      } while (num === except); // 제외할 숫자가 나오지 않을 때까지 반복
      return num; // 랜덤 숫자 반환
    },
    /**
     * 편지 풀을 초기화합니다.
     */
    resetLetterPool() {
      const intervals = this.letterPoolIntervals || []; // 편지 풀 인터벌 배열 생성
      intervals.forEach(interval => clearInterval(interval)); // 각 인터벌 제거
      clearTimeout(this.resetTimeout); // 리셋 타임아웃 제거
      this.clearLetterPool(); // 편지 풀 지우기
      this.resetTimeout = setTimeout(() => {
        this.initLetterPool(); // 편지 풀 초기화
      }, 200);
    },
    /**
     * 입력 필드를 비활성화합니다.
     */
    disableInputField() {
      const MESSAGE_INPUT_FIELD = this.$refs.messageInputField; // 메시지 입력 필드 참조
      if (MESSAGE_INPUT_FIELD) {
        MESSAGE_INPUT_FIELD.blur(); // 입력 필드 포커스 해제
        MESSAGE_INPUT_FIELD.value = ''; // 입력 필드 값 초기화
        MESSAGE_INPUT_FIELD.readOnly = true; // 입력 필드를 읽기 전용으로 설정
      }
    },
    /**
     * 입력 필드를 활성화합니다.
     */
    enableInputField() {
      const MESSAGE_INPUT_FIELD = this.$refs.messageInputField; // 메시지 입력 필드 참조
      if (MESSAGE_INPUT_FIELD) {
        MESSAGE_INPUT_FIELD.readOnly = false; // 입력 필드를 읽기 전용 해제
        MESSAGE_INPUT_FIELD.focus(); // 입력 필드 포커스 설정
      }
    },
    /**
     * 메시지 열 높이를 확인합니다.
     */
    checkMessageColumnHeight() {
      const CHAT_MESSAGE_COLUMN = this.$refs.chatBox; // 채팅 박스 참조
      if (CHAT_MESSAGE_COLUMN) {
        if (CHAT_MESSAGE_COLUMN.clientHeight >= window.innerHeight) {
          this.removeClass(CHAT_MESSAGE_COLUMN, 'static'); // 높이가 화면보다 크면 static 클래스 제거
        } else {
          this.addClass(CHAT_MESSAGE_COLUMN, 'static'); // 높이가 화면보다 작으면 static 클래스 추가
        }
      }
    },
    /**
     * 입력된 문자가 유효한지 확인합니다.
     * @param {Event} e - 이벤트 객체
     * @returns {boolean} 유효한 문자 여부
     */
    isValidLetter(e) {
      return !e.ctrlKey 
        && e.key !== 'Enter'
        && e.keyCode !== 8
        && e.keyCode !== 9
        && e.keyCode !== 13;
    }
  },
  mounted() {
    this.sendSystemMessage(); // 컴포넌트가 마운트될 때 시스템 메시지 전송

    // this.setChatbotMood(); // 챗봇 감정 상태 설정
    this.initLetterPool(); // 편지 풀 초기화
    // this.sendChatbotMessage(); // 챗봇 메시지 전송
    this.toggleInput(); // 입력 토글
    this.setMoodInterval(this.getRandMoodInterval()); // 랜덤 감정 상태 간격 설정
    window.addEventListener('focus', this.resetLetterPool); // 포커스 이벤트 리스너 추가
    window.addEventListener('resize', throttle(this.resetLetterPool, 200)); // 리사이즈 이벤트 리스너 추가
    this.$nextTick(() => {
      // this.scrollToBottomOfMessages(); // 메시지 창을 맨 아래로 스크롤
    });
  },
  beforeDestroy() {
    window.removeEventListener('focus', this.resetLetterPool); // 포커스 이벤트 리스너 제거
    window.removeEventListener('resize', throttle(this.resetLetterPool, 200)); // 리사이즈 이벤트 리스너 제거
  }
};
</script>

<style lang="scss">
@import '@/plugins/chatbot'; // 챗봇 스타일 임포트
</style>
