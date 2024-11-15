<template>
  <div class="container-error">
    <div class="error-error">
      <h1 :style="{ color: 'black' }">{{ status }}</h1>
      <h2>{{ message }}</h2>
      <p>Ruh-roh, something just isn't right... Time to paw through your logs and get down and dirty in your stack-trace ;)</p>
    </div>
    <div ref="stackContainer" class="stack-container-error">
      <div v-for="(card, index) in cards" :key="index" class="card-container-error">
        <div class="perspec-error" :style="{ '--spreaddist': card.spreaddist, '--scaledist': card.scaledist, '--vertdist': card.vertdist }">
          <div class="card-error">
            <div class="writing-error">
              <div class="topbar-error">
                <div class="red-error"></div>
                <div class="yellow-error"></div>
                <div class="green-error"></div>
              </div>
              <div class="code-error">
                <ul>
                  <li
                      v-for="(line, i) in card.lines"
                      :key="i"
                      :class="['node-error-' + i, { 'writeLine-error': line.animate }]"
                      :style="line.style">
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // useRoute 추가
// 쿼리 파라미터로 전달된 에러 정보 가져오기
const route = useRoute();
const status = route.query.status;
const message = route.query.message;
// 카드와 코드 라인 관련 데이터 설정
const stackContainer = ref(null);
const cards = ref([
  { spreaddist: '125px', scaledist: '0.75', vertdist: '-25px', lines: [] },
  { spreaddist: '100px', scaledist: '0.8', vertdist: '-20px', lines: [] },
  { spreaddist: '75px', scaledist: '0.85', vertdist: '-15px', lines: [] },
  { spreaddist: '50px', scaledist: '0.9', vertdist: '-10px', lines: [] },
  { spreaddist: '25px', scaledist: '0.95', vertdist: '-5px', lines: [] },
  { spreaddist: '0px', scaledist: '1', vertdist: '0px', lines: [] },
]);

// 랜덤 숫자 생성 함수
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

onMounted(() => {
  const cardNodes = stackContainer.value.querySelectorAll('.card-container-error');

  // 카드 당 랜덤 코드 라인 생성
  cardNodes.forEach((elem, cardIndex) => {
    const numLines = randomIntFromInterval(5, 10);
    const card = cards.value[cardIndex];
    for (let i = 0; i < numLines; i++) {
      const lineLength = randomIntFromInterval(25, 97);
      card.lines.push({
        style: `--linelength: ${lineLength}%;`,
        animate: i === 0,
      });
    }
  });

  // 애니메이션 끝난 후 추가 애니메이션 처리
  stackContainer.value.querySelectorAll('.perspec-error').forEach((elem, index) => {
    elem.classList.add('explode-error');
  });

  // 카드 클릭 시 이동하는 이벤트 추가
  cardNodes.forEach((elem, index) => {
    elem.addEventListener('click', () => {
      const updown = [800, -800];
      const randomY = updown[Math.floor(Math.random() * updown.length)];
      const randomX = Math.floor(Math.random() * 1000) - 1000;
      elem.style.transform = `translate(${randomX}px, ${randomY}px) rotate(-540deg)`;
      elem.style.transition = 'transform 1s ease, opacity 2s';
      elem.style.opacity = '0';
    });
  });
});
</script>

<style scoped>

</style>
