<template>
  <div class="chatbot-interface">
    <div class="chat-container">
      <div class="chat-box">
        <div v-for="(message, index) in chatMessages" :key="index" :class="messageClass(message)">
          <img v-if="message.role === 'assistant'" src="/images/chatbot-Chat-Message.jpg" class="gpt-logo" alt="ChatGPT Logo">
          <div class="message-content">
            <p>{{ message.content }}</p>
          </div>
          <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
        </div>
      </div>
      <div class="input-container">
        <textarea v-model="userInput" placeholder="궁금한 내용을 물어보세요!" @keyup.enter="sendMessage"></textarea>
        <button @click="sendMessage"><img src="/images/chatbot-Chat-Message.jpg" alt="Send"/></button>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  name: 'ChatbotInterface',
  data() {
    return {
      userInput: '',
      chatMessages: [],
      model: 'gpt-3.5-turbo'
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim()) return;

      const timestamp = new Date().toLocaleTimeString();
      const userMessage = { role: 'user', content: this.userInput, timestamp: timestamp };
      this.chatMessages.push(userMessage);
      this.userInput = '';

      try {
        const requestPayload = {
          model: this.model,
          messages: this.chatMessages.map(message => ({
            role: message.role === 'user' ? 'user' : 'assistant',
            content: message.content
          }))
        };

        const result = await axios.post('http://localhost:8085/chat-gpt/chat', requestPayload);
        const botMessage = {
          role: 'assistant',
          content: result.data.choices[0].message.content,
          timestamp: new Date().toLocaleTimeString()
        };
        this.chatMessages.push(botMessage);
      } catch (error) {
        console.error('메시지 전송 중 오류 발생:', error);
        const errorMessage = {
          role: 'assistant',
          content: '오류가 발생했습니다. 다시 시도해 주세요.',
          timestamp: new Date().toLocaleTimeString()
        };
        this.chatMessages.push(errorMessage);
      }
    },
    messageClass(message) {
      return message.role === 'user' ? 'user-message' : 'bot-message';
    },
    formatTimestamp(timestamp) {
      return timestamp;
    }
  }
};
</script>