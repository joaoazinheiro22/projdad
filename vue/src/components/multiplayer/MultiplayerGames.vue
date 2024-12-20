<script setup>
import Lobby from './Lobby.vue'
import Chat from '@/components/chat/Chat.vue'
import Game from './Game.vue'
import { useAuthStore } from '@/stores/auth'
import { useMultiplayerGamesStore } from '@/stores/multiplayer'
import { onMounted } from 'vue'

const storeAuth = useAuthStore()

const storeMultiplayer = useMultiplayerGamesStore()
onMounted(() => {
    storeMultiplayer.fetchPlayingGames()
})
</script>

<template>
    <div class="flex flex-wrap justify-start space-x-4">
        <Chat class="w-72"></Chat>
        <Lobby v-if="storeAuth.user" class="w-72"></Lobby>
        <Game v-if="storeAuth.user" v-for="game in storeMultiplayer.games" :key="game.id" :game="game"
            class="flex-1 min-w-96"> </Game>
    </div>
</template>