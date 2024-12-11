<script setup>
import Lobby from './Lobby.vue'
import Chat from '@/components/chat/Chat.vue'
import { useAuthStore } from '@/stores/auth'

const storeAuth = useAuthStore()
</script>
<template>
    <div class="flex flex-wrap justify-start space-x-4">
        <Chat class="w-72"></Chat>
        <Lobby v-if="storeAuth.user" class="w-72"></Lobby>
    </div>
</template>