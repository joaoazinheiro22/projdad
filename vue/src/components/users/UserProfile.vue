<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useErrorStore } from '@/stores/error'
import { Button } from '@/components/ui/button'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import { useGameStore } from '@/stores/game'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const errorStore = useErrorStore()

const gameStore = useGameStore();


const userProfile = ref({
    email: authStore.userEmail,
    nickname: authStore.user.nickname,
    name: authStore.userName,
    photo: null,
    password: ''
})

const updateProfile = async () => {
    // Implementar a lógica para atualizar o user
}

const removeAccount = async () => {
    // Implementar a lógica para remover a conta
}

const fetchGameHistory = async () => {
    await gameStore.fetchGameHistory();
    console.log('Fetched game history:', gameStore.gameHistory);
};

onMounted(async () => {
    await fetchGameHistory();
});

</script>

<template>
    <div class="max-w-3xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8">User Profile</h1>
        <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="space-y-2">
                <label for="nickname" class="block text-sm font-medium text-gray-700">Nickname:</label>
                <input type="text" id="nickname" v-model="userProfile.nickname"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('nickname')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="name" class="block text-sm font-medium text-gray-700">Name:</label>
                <input type="text" id="name" v-model="userProfile.name"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('name')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="photo" class="block text-sm font-medium text-gray-700">Photo:</label>
                <input type="file" id="photo" @change="e => userProfile.photo = e.target.files[0]"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('photo')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700">Password:</label>
                <input type="password" id="password" v-model="userProfile.password"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('password')"></ErrorMessage>
            </div>

            <Button type="submit">Update Profile</Button>
        </form>

        <Button @click="removeAccount" class="mt-4 bg-red-500 hover:bg-red-700 text-white">Remove Account</Button>

        <!-- Game History Table -->
        <div class="bg-white w-full py-12 mt-8">
            <div class="max-w-5xl mx-auto px-4 text-center">
                <h2 class="text-2xl font-bold mb-8">Your Game History</h2>
                <table class="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th class="py-2">Date</th>
                            <th class="py-2">Type</th>
                            <th class="py-2">Board Size</th>
                            <th class="py-2">Status</th>
                            <th class="py-2">Total Time</th>
                            <th class="py-2">Creator</th>
                            <th class="py-2">Winner</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="game in gameStore.gameHistory" :key="game.id">
                            <td class="py-2">{{ new Date(game.began_at).toLocaleDateString() }}</td>
                            <td class="py-2">{{ game.type }}</td>
                            <td class="py-2">{{ game.board_size }}</td>
                            <td class="py-2">{{ game.status }}</td>
                            <td class="py-2">{{ game.total_time }}</td>
                            <td class="py-2">{{ game.creator }}</td>
                            <td class="py-2">{{ game.winner }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>