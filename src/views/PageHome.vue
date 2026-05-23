<template>
  <div
      id="blackhole"
      ref="blackholeContainerRef"
      @click="navigateToAboutAfterDelay"
  >
    <div
        class="centerHover"
        :class="{ open: isOpen }"
        @click.stop="handleClick"
        @mouseover="handleMouseOver"
        @mouseout="handleMouseOut"
    >
      <span>ENTER</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
// [추가됨] vue-router에서 useRouter를 임포트합니다.
import { useRouter } from 'vue-router';

// --- Vue 반응형 상태 및 참조 ---
const blackholeContainerRef = ref(null);
const isOpen = ref(false);
let animationFrameId = null;
const animState = {
  collapse: false,
  expanse: false,
  returning: false
};

// [추가됨] router 인스턴스를 가져옵니다.
const router = useRouter();

// [추가됨] 3초 내비게이션 타임아웃을 관리할 ref
const navigationTimeoutId = ref(null);


// --- Vue 이벤트 핸들러 ---

// "ENTER" 버튼 클릭 핸들러 (애니메이션 시작)
const handleClick = (event) => {
  // [수정됨]
  // 이 클릭 이벤트가 부모(#blackhole)의 클릭 이벤트로
  // 전파(버블링)되는 것을 막기 위해 @click.stop을 템플릿에 추가했습니다.
  // 만약 "ENTER" 버튼을 눌렀을 때도 3초 후 이동을 원하신다면,
  // 템플릿의 @click.stop="handleClick"에서 .stop을 제거하고,
  // 이 handleClick 함수는 비워두거나 제거하셔도 됩니다.
  // (현재는 .stop을 사용해 "ENTER" 클릭 시 애니메이션만 실행됩니다.)

  animState.collapse = false;
  animState.expanse = true;
  animState.returning = false;
  isOpen.value = true;

  // 기존 애니메이션 타이머
  setTimeout(() => {
    animState.expanse = false;
    animState.returning = true;
    setTimeout(() => {
      animState.returning = false;
      isOpen.value = false;
    }, 8000);
  }, 25000);
};

// [추가됨] "화면 아무데나" 클릭 핸들러 (3초 후 이동)
const navigateToAboutAfterDelay = (event) => {
  // 마우스 왼쪽 버튼(button: 0) 클릭이 아니면 무시
  if (event.button !== 0) {
    return;
  }

  // 혹시 이미 설정된 3초 타이머가 있다면 취소 (중복 클릭 방지)
  if (navigationTimeoutId.value) {
    clearTimeout(navigationTimeoutId.value);
  }

  // 3초(3000ms) 후에 /about 경로로 이동
  navigationTimeoutId.value = setTimeout(() => {
    router.push('/about');
  }, 1);
};

const handleMouseOver = () => {
  if (animState.expanse === false) {
    animState.collapse = true;
  }
};

const handleMouseOut = () => {
  if (animState.expanse === false) {
    animState.collapse = false;
  }
};


// --- Vue 라이프사이클 훅 ---

onMounted(() => {
  // ... (이하 캔버스 로직은 이전과 동일) ...
  const container = blackholeContainerRef.value;
  if (!container) return;

  const h = container.offsetHeight;
  const w = container.offsetWidth;
  const cw = w;
  const ch = h;
  const maxorbit = 255;
  const centery = ch / 2;
  const centerx = cw / 2;
  const startTime = new Date().getTime();
  let currentTime = 0;
  const stars = [];

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  container.appendChild(canvas);
  const context = canvas.getContext("2d");
  context.globalCompositeOperation = "multiply";

  function setDPI(canvas, dpi) {
    if (!canvas.style.width) canvas.style.width = canvas.width + 'px';
    if (!canvas.style.height) canvas.style.height = canvas.height + 'px';
    const scaleFactor = dpi / 96;
    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    const ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
  }

  function rotate(cx, cy, x, y, angle) {
    const radians = angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
    const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
  }

  setDPI(canvas, 192);

  class Star {
    constructor() {
      const rands = [];
      rands.push(Math.random() * (maxorbit / 2) + 1);
      rands.push(Math.random() * (maxorbit / 2) + maxorbit);
      this.orbital = (rands.reduce((p, c) => p + c, 0) / rands.length);
      this.x = centerx;
      this.y = centery + this.orbital;
      this.yOrigin = centery + this.orbital;
      this.speed = (Math.floor(Math.random() * 2.5) + 1.5) * Math.PI / 180;
      this.rotation = 0;
      this.startRotation = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
      this.id = stars.length;
      this.collapseBonus = this.orbital - (maxorbit * 0.7);
      if (this.collapseBonus < 0) { this.collapseBonus = 0; }
      this.color = 'rgba(255,255,255,' + (1 - ((this.orbital) / 255)) + ')';
      this.hoverPos = centery + (maxorbit / 2) + this.collapseBonus;
      this.expansePos = centery + (this.id % 100) * -10 + (Math.floor(Math.random() * 20) + 1);
      this.prevR = this.startRotation;
      this.prevX = this.x;
      this.prevY = this.y;
      this.originalY = this.yOrigin;
      stars.push(this);
    }
    draw() {
      if (!animState.expanse && !animState.returning) {
        this.rotation = this.startRotation + (currentTime * this.speed);
        if (!animState.collapse) {
          if (this.y > this.yOrigin) { this.y -= 2.5; }
          if (this.y < this.yOrigin - 4) { this.y += (this.yOrigin - this.y) / 10; }
        } else {
          this.trail = 1;
          if (this.y > this.hoverPos) { this.y -= (this.hoverPos - this.y) / -5; }
          if (this.y < this.hoverPos - 4) { this.y += 2.5; }
        }
      } else if (animState.expanse && !animState.returning) {
        this.rotation = this.startRotation + (currentTime * (this.speed / 2));
        if (this.y > this.expansePos) { this.y -= Math.floor(this.expansePos - this.y) / -80; }
      } else if (animState.returning) {
        this.rotation = this.startRotation + (currentTime * this.speed);
        if (Math.abs(this.y - this.originalY) > 2) {
          this.y += (this.originalY - this.y) / 50;
        } else {
          this.y = this.originalY;
          this.yOrigin = this.originalY;
        }
      }
      context.save();
      context.fillStyle = this.color;
      context.strokeStyle = this.color;
      context.beginPath();
      const oldPos = rotate(centerx, centery, this.prevX, this.prevY, -this.prevR);
      context.moveTo(oldPos[0], oldPos[1]);
      context.translate(centerx, centery);
      context.rotate(this.rotation);
      context.translate(-centerx, -centery);
      context.lineTo(this.x, this.y);
      context.stroke();
      context.restore();
      this.prevR = this.rotation;
      this.prevX = this.x;
      this.prevY = this.y;
    }
  }

  function loop() {
    const now = new Date().getTime();
    currentTime = (now - startTime) / 50;
    context.fillStyle = 'rgba(25,25,25,0.2)';
    context.fillRect(0, 0, cw, ch);
    for (let i = 0; i < stars.length; i++) {
      if (stars[i] !== undefined) {
        stars[i].draw();
      }
    }
    animationFrameId = requestAnimationFrame(loop);
  }

  function init() {
    context.fillStyle = 'rgba(25,25,25,1)';
    context.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 2500; i++) {
      new Star();
    }
    loop();
  }

  init();
});

onUnmounted(() => {
  // 기존 정리 로직
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  const container = blackholeContainerRef.value;
  if (container && container.querySelector('canvas')) {
    container.removeChild(container.querySelector('canvas'));
  }

  // [추가됨] 컴포넌트가 사라질 때(unmount) 3초 이동 타이머도 함께 제거합니다.
  if (navigationTimeoutId.value) {
    clearTimeout(navigationTimeoutId.value);
  }
});
</script>

<style scoped>
/* (스타일은 이전과 동일) */
#blackhole {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
}
.centerHover {
  width: 255px;
  height: 255px;
  background-color: transparent;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -128px;
  margin-left: -128px;
  z-index: 2;
  cursor: pointer;
  line-height: 255px;
  text-align: center;
  transition: all 500ms;
}
.centerHover.open {
  opacity: 0;
  pointer-events: none;
}
.centerHover:hover span {
  color: #DDD;
}
.centerHover:hover span:before {
  background-color: #DDD;
}
.centerHover:hover span:after {
  background-color: #DDD;
}
.centerHover span {
  color: #666;
  font-family: serif;
  font-size: 18px;
  position: relative;
  transition: all 500ms;
}
.centerHover span:before {
  content: '';
  display: inline-block;
  height: 1px;
  width: 16px;
  margin-right: 12px;
  margin-bottom: 4px;
  background-color: #666;
  transition: all 500ms;
}
.centerHover span:after {
  content: '';
  display: inline-block;
  height: 1px;
  width: 16px;
  margin-left: 12px;
  margin-bottom: 4px;
  background-color: #666;
  transition: all 500ms;
}
:deep(canvas) {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  margin: auto;
}
</style>