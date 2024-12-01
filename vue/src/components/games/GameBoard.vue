<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const route = useRoute();
const router = useRouter();

const goToHomeBoard = () => {
  router.push({ name: 'home' });
};

// Definir o modo de jogo e criar o grid
const mode = computed(() => route.params.mode);

const rows = computed(() => {
  switch (mode.value) {
    case '3x4': return 3;
    case '4x4': return 4;
    case '6x6': return 6;
    default: return 0;
  }
});

const cols = computed(() => {
  switch (mode.value) {
    case '3x4': return 4;
    case '4x4': return 4;
    case '6x6': return 6;
    default: return 0;
  }
});

// Lógica do jogo
const cards = ref([]);
const selectedCards = ref([]);
const matchedCards = ref([]);
const isGameWon = ref(false);
const turnCount = ref(0);

// Timer logic
const startTime = ref(Date.now());
const elapsedTime = ref(0);
const timerInterval = ref(null);

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60000);
  const seconds = Math.floor((elapsedTime.value % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const startTimer = () => {
  startTime.value = Date.now();
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
};

// Função para inicializar o jogo
const initializeGame = () => {
  // Reset game state
  turnCount.value = 0;

  matchedCards.value = [];
  selectedCards.value = [];
  isGameWon.value = false;
  
  // Definir os naipes
  const suits = ['c', 'e', 'p', 'o'];
  
  // Criar cartas
  const cardSet = suits.flatMap(suit => 
    Array.from({ length: 13 }, (_, i) => ({
      id: `${suit}${i + 1}`,
      image: `/${suit}${i + 1}.png`,
      isFlipped: false
    }))
  );

  // Calcular o número total de cartas necessárias
  const totalCards = rows.value * cols.value;
  
  // Selecionar e embaralhar as cartas necessárias
  cards.value = cardSet.slice(0, totalCards / 2).flatMap(card => [
    { ...card, uniqueKey: Math.random() },
    { ...card, uniqueKey: Math.random() }
  ]).sort(() => Math.random() - 0.5);

  // Start the timer
  startTimer();
};

// Lógica de virar cartas
const flipCard = (card) => {
  // Não permite virar cartas já combinadas ou já selecionadas
  if (
    matchedCards.value.includes(card.id) || 
    selectedCards.value.length === 2 || 
    selectedCards.value.find(c => c.uniqueKey === card.uniqueKey)
  ) return;

  // Vira a carta
  card.isFlipped = true;
  selectedCards.value.push(card);

  // Verificar combinação quando duas cartas são selecionadas
  if (selectedCards.value.length === 2) {
    
    turnCount.value++;

    setTimeout(() => {
      if (selectedCards.value[0].id === selectedCards.value[1].id) {
        // Cartas combinam
        matchedCards.value.push(selectedCards.value[0].id);
      } else {
        // Cartas não combinam, vira de volta
        selectedCards.value.forEach(c => {
          const cardToFlip = cards.value.find(card => card.uniqueKey === c.uniqueKey);
          if (cardToFlip) cardToFlip.isFlipped = false;
        });
      }
      // Limpar seleção
      selectedCards.value = [];

      // Check for game completion
      checkGameCompletion();
    }, 1000); // Tempo para mostrar as cartas antes de virar
  }
};

// Check game completion
const checkGameCompletion = () => {
  const allCardsFlipped = cards.value.every(card => card.isFlipped);
  
  if (allCardsFlipped) {
    stopTimer();
    isGameWon.value = true;
    addGame();
  }
};

// Restart game function
const restartGame = () => {
  initializeGame();
};


const addGame = async () => {
  try {
    let gameData = {
      winner_user_id: authStore.userId,
      // turns: turnCount.value,
      total_time: Math.floor(elapsedTime.value / 1000), // Convertido para segundos
      mode: route.params.mode
    };

    const response = await axios.post('games', gameData);
    console.log('Game data saved:', response.data);
  } catch (error) {
    console.error('Error saving game data:', error);
  }
};


// Inicializar o jogo quando o componente for montado
onMounted(() => {
  initializeGame();
});
</script>

<template>
  <div class="flex flex-col items-center justify-center p-5">
    <h1 class="text-3xl font-bold mb-4">Game Mode: {{ mode }}</h1>
    <h2 class="mb-2">Timer: {{ formattedTime }}</h2>
    <h2 class="mb-4">Number of turns: {{ turnCount }} </h2>
    <h2 class="mb-4">Username: {{ authStore.userFirstLastName }} </h2>
    
    <div 
      class="grid gap-2 w-full max-w-2xl p-4 rounded-lg bg-gray-100" 
      :style="{ 
        gridTemplateRows: `repeat(${rows}, 1fr)`, 
        gridTemplateColumns: `repeat(${cols}, 1fr)` 
      }"
    >
      <div 
        v-for="card in cards" 
        :key="card.uniqueKey" 
        class="card-container flex items-center justify-center aspect-square cursor-pointer"
      >
        <div class="card" :class="{ 'is-flipped': card.isFlipped }" @click="flipCard(card)">
          <div class="card-front">
            <img 
              class="w-full h-full object-contain"
              :src="card.image" 
              alt="Card Front"
              :class="{
                'opacity-50': matchedCards.includes(card.id)
              }"
            >
          </div>
          <div class="card-back">
            <img 
              class="w-full h-full object-contain"
              src="/card_back.png" 
              alt="Card Back"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Win Modal -->
    <div 
      v-if="isGameWon" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-8 rounded-lg text-center shadow-xl">
        <h2 class="text-2xl font-bold mb-4">Congratulations {{authStore.userFirstName}}!</h2>
        <p class="mb-2">You've won the game in {{ formattedTime }}!</p>
        <p class="mb-4">Number of turns: {{ turnCount }}</p>
        <button 
          @click="restartGame" 
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition mr-2"
        >
          Play Again
        </button>
        <button 
          @click="goToHomeBoard" 
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.card-container {
  perspective: 1000px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.is-flipped {
  transform: rotateY(180deg);
}

.card-front, 
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}

.card-back {
  transform: rotateY(0deg);
}
</style>