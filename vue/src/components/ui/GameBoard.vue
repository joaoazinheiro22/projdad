<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

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

// Função para inicializar o jogo
const initializeGame = () => {
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
  cards.value = cardSet.slice(0, totalCards / 2).flatMap(card => [{ ...card, uniqueKey: Math.random() },{ ...card, uniqueKey: Math.random() }])
                        .sort(() => Math.random() - 0.5);
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
    }, 1000); // Tempo para mostrar as cartas antes de virar
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
      
      <div 
        class="grid gap-2 w-full max-w-2xl aspect-video" 
        :style="{ 
          gridTemplateRows: `repeat(${rows}, 1fr)`, 
          gridTemplateColumns: `repeat(${cols}, 1fr)` 
        }"
      >
      <div 
  v-for="card in cards" 
  :key="card.uniqueKey" 
  class="flex items-center justify-center aspect-square cursor-pointer"
  @click="flipCard(card)"
>
  <div class="card" :class="{ 'is-flipped': card.isFlipped }">
    <!-- Frente da carta -->
    <img 
      class="card-front w-full h-full object-contain"
      :src="card.image" 
      alt="Card Front"
      :class="{
            'rotate-y-180': card.isFlipped,
            'opacity-50': matchedCards.includes(card.id)
          }"
    >
    <!-- Verso da carta -->
    <img 
      class="card-back w-full h-full object-contain"
      src="/card_back.png" 
      alt="Card Back"
      
    >
  </div>
</div>

      </div>
    </div>
  </template>
  

<style>
.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  transform: rotateY(0deg);
}

.card.is-flipped {
  transform: rotateY(180deg);
}

.card-front, .card-back {
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