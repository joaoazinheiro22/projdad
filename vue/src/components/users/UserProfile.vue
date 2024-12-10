<script setup>
import { ref, computed, onMounted } from 'vue'
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
    photo: authStore.userPhotoUrl,
    password: '',
    photo_filename: authStore.user ? authStore.user.photo_filename : ''
})

console.log('User Profile:', userProfile)

const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    const response = await authStore.uploadPhoto(formData)
    if (response.photo_filename) {
        console.log('Photo uploaded:', response.photo_filename)
        userProfile.value.photo_filename = response.photo_filename
        userProfile.value.photo = authStore.userPhotoUrl // Update the photo URL
    }
}

const updateProfile = async () => {
    try {
        const updatedUser = await authStore.updateUser({
            ...userProfile.value,
            photo_filename: userProfile.value.photo_filename || undefined
        });
        if (updatedUser) {
            console.log('Profile updated:', updatedUser);
            authStore.user = updatedUser;
        }
    } catch (error) {
        console.error('Update error:', error.response?.data);
    }
}

const removeAccount = async (password) => {
    console.log('Removing account...');
    if (authStore.userType == 'A') {
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
                <input type="file" id="photo" @change="e => uploadPhoto(e.target.files[0])"
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

    </div>
</template>