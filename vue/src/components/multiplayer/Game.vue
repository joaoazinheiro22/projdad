<script setup>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computed, defineProps, inject, watch, ref, onMounted, onUnmounted } from 'vue'
import { useCardDesignStore } from '@/stores/cardDesign';
import { useMultiplayerGamesStore } from '@/stores/multiplayer';
import { useAuthStore } from '@/stores/auth';


const timer = ref(0)
const timerInterval = ref(null)

const storeMultiplayer = useMultiplayerGamesStore()
const storeAuth = useAuthStore()
const props = defineProps({
    game: {
        type: Object,
        required: true
    }
})

const startTimer = () => {
    timer.value = 0
    timerInterval.value = setInterval(() => {
        timer.value++
    }, 1000)
}

const stopTimer = () => {
    clearInterval(timerInterval.value)
}

onMounted(() => {
    startTimer()
})

onUnmounted(() => {
    stopTimer()
})

const alertDialog = inject('alertDialog')

const cardDesignStore = useCardDesignStore()
console.log(props.game.theBoard)
const gameEnded = computed(() => {
    return props.game.gameStatus > 0
})

const statusGameMessage = computed(() => {
    switch (props.game.gameStatus) {
        case 0:
            if (props.game.currentPlayer == 1) {
                return props.game.player1.nickname + "'s Turn!"
            } else {
                return props.game.player2.nickname + "'s Turn!"
            }

        case 1:
        case 2:
            return storeMultiplayer.playerNumberOfCurrentUser(props.game) == props.game.gameStatus
                ? 'You won'
                : 'You lost'
        case 3:
            return 'Draw' // Doesnt exist 
        default:
            return 'Not started!'
    }
})
const currentUserTurn = computed(() => {
    if (gameEnded.value) {
        return false
    }
    if (props.game.currentPlayer === storeMultiplayer.playerNumberOfCurrentUser(props.game)) {
        return true
    }
    return false
})

const cardBgColor = computed(() => {
    switch (props.game.gameStatus) {
        case 0:
            return 'bg-white'
        case 1:
        case 2:
            return storeMultiplayer.playerNumberOfCurrentUser(props.game) == props.game.gameStatus
                ? 'bg-green-100'
                : 'bg-red-100'
        case 3:
            return 'bg-blue-100'
        default:
            return 'bg-slate-100'
    }
})
const statusMessageColor = computed(() => {
    switch (props.game.gameStatus) {
        case 0:
            return currentUserTurn.value ? 'text-green-400' : 'text-slate-400'
        case 1:
        case 2:
            return storeMultiplayer.playerNumberOfCurrentUser(props.game) == props.game.gameStatus
                ? 'text-green-900'
                : 'text-red-900'
        case 3:
            return 'text-blue-900'
        default:
            return 'text-slate-800'
    }
})

const buttonClasses = computed(() => {
    if (gameEnded.value) {
        return 'bg-gray-700 text-gray-200 hover:text-gray-50'
    }
    return 'bg-gray-300 text-gray-700 hover:text-gray-200'
})
const clickCardButton = () => {
    if (gameEnded.value) {
        close()
    } else {
        alertDialog.value.open(
            quit,
            'Quit game',
            'Cancel',
            `Yes, I want to quit`,
            `Are you sure you want to quit the game #${props.game.data.data.id}? You'll lose the game!`
        )
    }
}
const opponentName = computed(() => {
    return storeMultiplayer.playerNumberOfCurrentUser(props.game) === 1
        ? storeAuth.getFirstLastName(props.game.player2.name)
        : storeAuth.getFirstLastName(props.game.player1.name)
})

watch(() => props.game.gameStatus, (newStatus) => {
    if (newStatus > 0) { // Game ended
        stopTimer()
        storeMultiplayer.setGameTime(timer.value)
    }
})

const close = () => {
    storeMultiplayer.close(props.game)
}
const quit = () => {
    storeMultiplayer.quit(props.game)
}
const enoughCardsFlipped = computed(() => {
    return props.game.flippedCards.length === 2
})

const play = (game, cardId) => {
    if (game.currentPlayer !== storeMultiplayer.playerNumberOfCurrentUser(game) || gameEnded.value || enoughCardsFlipped.value) {
        return
    }
    storeMultiplayer.play(game, cardId)
}
</script>
<template>
    <Card class="relative grow mx-4 mt-8 pt-2 pb-4 px-1" :class="cardBgColor">
        <CardHeader class="pb-0">
            <Button @click="clickCardButton" class="absolute top-4 right-4" :class="buttonClasses">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                {{ gameEnded ? 'Close' : 'Quit' }}
            </Button>
            <CardTitle>#{{ props.game.data.data.id }}</CardTitle>
            <CardDescription>
                <div class="text-base">
                    <span class="font-bold">Time:</span> {{ Math.floor(timer / 60) }}:{{ (timer %
                        60).toString().padStart(2, '0') }}
                    <span class="font-bold">Opponent:</span> {{ opponentName }}
                    {{ props.game.status == 'I' ? ' / Interrupted' : '' }}
                </div>
            </CardDescription>
        </CardHeader>
        <CardContent class="py-4 px-8">
            <h3 class="pt-0 text-2xl font-bold py-2" :class="statusMessageColor">
                {{ statusGameMessage }}
            </h3>
            <div class="grid gap-2 w-full max-w-2xl p-4 rounded-lg bg-gray-100" :style="{
                gridTemplateRows: `repeat(${props.game.theBoard.rows}, 1fr)`,
                gridTemplateColumns: `repeat(${props.game.theBoard.cols}, 1fr)`
            }">
                <div v-for="card in props.game.board" :key="card.uniqueKey"
                    class="card-container flex items-center justify-center aspect-square cursor-pointer">
                    <div class="card" @click="play(props.game, card.id)">
                        <div v-if="card.isFlipped || card.isMatched">
                            <img class="w-full h-full object-contain" :src="`/${card.value}.png`" alt="Card Front"
                                :class="{
                                    'opacity-50': card.isMatched
                                }">
                        </div>
                        <div v-else class="card-back">
                            <img class="w-full h-full object-contain" :src="cardDesignStore.selectedCardBack"
                                alt="Card Back">
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>

<style scoped>
.card-container {
    perspective: 1000px;
}

.card {
    position: relative;
    width: 100%;
    height: 100%;
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