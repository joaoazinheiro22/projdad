<script setup>
import { useTemplateRef, provide, ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/ui/button'
import Toaster from '@/components/ui/toast/Toaster.vue';
import GlobalAlertDialog from '@/components/common/GlobalAlertDialog.vue'
import 'primeicons/primeicons.css'

const userStore = useUserStore()
// const toast = useTemplateRef('toaster')

// const alertDialog = useTemplateRef('alert-dialog')
// provide('alertDialog', alertDialog)

const currentPage = ref(1)
const itemsPerPage = 10


onMounted(async () => {
    await userStore.getUsers()
})


const totalPages = computed(() => {
    return Math.ceil(userStore.users.length / itemsPerPage)
})


const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return userStore.users.slice(start, end)
})


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


const toggleBlockedStatus = async (user) => {
    const result = await userStore.toggleBlockedUser(user)
    if (result) {
        console.log(`User ${user.id} status updated!`)
    } else {
        console.error('Failed to update user status.')
    }
}

// const deleteAccountConfirmed = async (user) => {
//     await userStore.deleteUser(user);
// }

// const deleteAccount = (user) => {
//     alertDialog.value.open(() => deleteAccountConfirmed(user),
//         'Delete confirmation?', 'Cancel', `Yes, I want to delete this account`,
//         `Are you sure you want to delete this account? This action is irreversable.`)
// }

</script>

<template>
    <!-- <Toaster />
    <GlobalAlertDialog ref="alert-dialog"></GlobalAlertDialog> -->
    <div class="max-w-4xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8 text-center">User List</h1>

        <div v-if="userStore.users.length > 0" class="bg-white w-full">
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
                        <td class="py-2 border-b text-center">{{ user.name }}</td>
                        <td class="py-2 border-b text-center">{{ user.email }}</td>
                        <td class="py-2 border-b text-center">{{ user.type || 'Regular' }}</td>
                        <td class="py-2 border-b text-center">
                            <button @click="toggleBlockedStatus(user)"
                                :class="user.blocked ? 'text-red-500' : 'text-green-500'">
                                {{ user.blocked ? 'Blocked' : 'Active' }}
                            </button>
                        </td>
                        <td class="py-2 border-b text-center">
                            <button @click="deleteAccount(user)" class="text-red-500 hover:text-red-700">
                                <i class="pi pi-trash text-lg"></i>
                            </button>
                        </td>
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
            <p>No users found.</p>
        </div>
    </div>
</template>