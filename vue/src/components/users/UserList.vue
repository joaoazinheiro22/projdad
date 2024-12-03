<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    users: {
        type: Array,
        required: true,
        default: () => []
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

// Pagination State
const currentPage = ref(1)
const itemsPerPage = 10

// Computed: Total Pages
const totalPages = computed(() => {
    return Math.ceil(props.users.length / itemsPerPage)
})

// Computed: Paginated Users
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return props.users.slice(start, end)
})

// Pagination Methods
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}
</script>

<template>
    <div v-if="props.users.length > 0" class="bg-white w-full py-12 mt-8">
        <div class="max-w-5xl mx-auto px-4 text-center">
            <h2 class="text-2xl font-bold mb-8">User List</h2>
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Name</th>
                        <th class="py-2 border-b">Email</th>
                        <th class="py-2 border-b">Role</th>
                        <th class="py-2 border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id">
                        <td class="py-2 border-b">{{ user.name }}</td>
                        <td class="py-2 border-b">{{ user.email }}</td>
                        <td class="py-2 border-b">{{ user.role || 'Regular' }}</td>
                        <td class="py-2 border-b">
                            <span :class="user.blocked ? 'text-red-500' : 'text-green-500'">
                                {{ user.blocked ? 'Blocked' : 'Active' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination Controls -->
            <div class="flex justify-center items-center mt-4 space-x-4">
                <button 
                    @click="prevPage" 
                    :disabled="currentPage === 1"
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
                    Previous
                </button>
                <span class="text-gray-700">
                    Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button 
                    @click="nextPage" 
                    :disabled="currentPage === totalPages"
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
        No users found.
    </div>
</template>
