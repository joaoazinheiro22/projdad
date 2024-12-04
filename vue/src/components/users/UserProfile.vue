<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useErrorStore } from '@/stores/error'
import { Button } from '@/components/ui/button'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const errorStore = useErrorStore()
const gameStore = useGameStore()

const userProfile = ref({
    id: authStore.userId,
    email: authStore.userEmail,
    nickname: authStore.user ? authStore.user.nickname : '',
    name: authStore.userName,
    photo: null,
    password: ''
})

const currentPage = ref(1)
const itemsPerPage = 10

const updateProfile = async () => {
    try{
        const updatedUser = await userStore.updateUser(userProfile.value)
        if(updatedUser){
            console.log('Profile updated:', updatedUser)
        }
    }catch(error){
        console.error(error)
    }

}

const removeAccount = async (password) => {
    console.log('Removing account...');
    if(authStore.userType == 'A'){
        errorStore.setErrorMessages('You cannot remove an admin account')
        console.log('Admins cannot remove their accounts');
        return;
    }
    const success = await authStore.removeAccount(password);
    if (success) {
        router.push('/');
    }
};

const fetchGameHistory = async () => {
    await gameStore.fetchGameHistory()
    console.log('Fetched game history:', gameStore.gameHistory)
}

// Computed property to get paginated game history
const paginatedGameHistory = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return gameStore.gameHistory.slice(start, end)
})

// Computed property to calculate total pages
const totalPages = computed(() => {
    return Math.ceil(gameStore.gameHistory.length / itemsPerPage)
})

// Method to go to next page
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

// Method to go to previous page
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

onMounted(async () => {
    await fetchGameHistory()
})
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
        <div v-if="gameStore.gameHistory.length > 0" class="bg-white w-full py-12 mt-8">
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
                            <tr v-for="game in paginatedGameHistory" :key="game.id">
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

                    <!-- Pagination Controls -->
                    <div class="flex justify-center items-center mt-4 space-x-4">
                        <Button @click="prevPage" :disabled="currentPage === 1"
                            class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
                            Previous
                        </Button>
                        <span class="text-gray-700">
                            Page {{ currentPage }} of {{ totalPages }}
                        </span>
                        <Button @click="nextPage" :disabled="currentPage === totalPages"
                            class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="bg-white w-full py-12 mt-8 text-center">
            <h2 class="text-2xl font-bold mb-8">No Game History Found</h2>
            <p class="text-gray-700">You have not played any games yet.</p>
        </div>
    </div>
</template>