<script setup>
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const gameStore = useGameStore()

const currentPage = ref(1)
const itemsPerPage = 10

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
    <div v-if="!authStore.userAdmin" class="max-w-4xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8 text-center">Your Game History</h1>

        <div v-if="gameStore.gameHistory.length > 0" class="bg-white w-full">
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Date</th>
                        <th class="py-2 border-b">Type</th>
                        <th class="py-2 border-b">Board Size</th>
                        <th class="py-2 border-b">Status</th>
                        <th class="py-2 border-b">Total Time</th>
                        <th class="py-2 border-b">Creator</th>
                        <th class="py-2 border-b">Winner</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="game in paginatedGameHistory" :key="game.id">
                        <td class="py-2 border-b text-center">{{ new Date(game.began_at).toLocaleDateString() }}</td>
                        <td class="py-2 border-b text-center">{{ game.type }}</td>
                        <td class="py-2 border-b text-center">{{ game.board_size }}</td>
                        <td class="py-2 border-b text-center">{{ game.status }}</td>
                        <td class="py-2 border-b text-center">{{ game.total_time }}</td>
                        <td class="py-2 border-b text-center">{{ game.creator }}</td>
                        <td class="py-2 border-b text-center">{{ game.winner }}</td>
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
        <div v-else class="text-center py-8 text-gray-500">
            <p>No Game History Found</p>
        </div>
    </div>
    <div v-else>
        <h1 class="text-center">As an admin you can't access this page</h1>
    </div>
</template>
