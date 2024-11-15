<template>
  <div class="container-error">
    <div class="error-error">
      <h1>500</h1>
      <h2>error</h2>
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
/* 스타일 정의 */
.container-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
}
.stack-container-error {
  position: relative;
  width: 420px;
  height: 210px;
  transition: width 1s, height 1s;
}
.error-error {
  width: 400px;
  padding: 40px;
  text-align: center;
}
.error-error h1 {
  font-size: 125px;
  margin: 0;
  font-weight: 700;
}
.error-error h2 {
  margin: -30px 0 0;
  font-size: 47px;
  letter-spacing: 12px;
}
.writing-error {
  width: 320px;
  height: 200px;
  background-color: #3f3f3f;
  border: 1px solid #bbbbbb;
  border-radius: 6px 6px 4px 4px;
  position: relative;
}
.writing-error .topbar-error {
  position: absolute;
  width: 100%;
  height: 12px;
  background-color: #f1f1f1;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.writing-error .topbar-error div {
  height: 6px;
  width: 6px;
  border-radius: 50%;
  margin: 3px;
  float: left;
}
.writing-error .topbar-error .green-error {
  background-color: #60d060;
}
.writing-error .topbar-error .red-error {
  background-color: red;
}
.writing-error .topbar-error .yellow-error {
  background-color: #e6c015;
}
.writing-error .code-error {
  padding: 15px;
}
.writing-error .code-error ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.writing-error .code-error ul li {
  background-color: #9e9e9e;
  width: 0;
  height: 7px;
  border-radius: 6px;
  margin: 10px 0;
}
.perspec-error {
  perspective: 1000px;
}
.explode-error {
  animation: explode-error 0.5s ease-in-out forwards;
}
.writeLine-error {
  animation: writeLine-error 0.4s linear forwards;
}
.card-error {
  animation: tiltcard-error 0.5s ease-in-out 1s forwards;
  position: absolute;
}
@keyframes tiltcard-error {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(-30deg); }
}
@keyframes explode-error {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(var(--spreaddist), var(--vertdist)) scale(var(--scaledist)); }
}
@keyframes writeLine-error {
  0% { width: 0; }
  100% { width: var(--linelength); }
}
</style>
