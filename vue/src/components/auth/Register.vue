<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button'
import { useErrorStore } from '@/stores/error';
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const authStore = useAuthStore()
const errorStore = useErrorStore()

const errorMessage = ref('')
const successMessage = ref('')

const credentials = ref({
    email: '',
    nickname: '',
    name: '',
    photo: null,
    password: ''
})


const register = async () => {
    await authStore.register(credentials.value)
    console.log(credentials.value)
}

</script>


<template>
    <div class="max-w-md mx-auto">

        <h2 class="text-2xl font-bold text-gray-900 mb-6">Register a new User</h2>


        <form @submit.prevent="register">
            <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-gray-700">
                    Email:
                </label>
                <input type="email" id="email" v-model="credentials.email"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('email')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="nickname" class="block text-sm font-medium text-gray-700">
                    Nickname:
                </label>
                <input type="text" id="nickname" v-model="credentials.nickname"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('nickname')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="name" class="block text-sm font-medium text-gray-700">
                    Name:
                </label>
                <input type="text" id="name" v-model="credentials.name"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('name')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="photo" class="block text-sm font-medium text-gray-700">
                    Photo:
                </label>
                <input type="file" id="photo" @change="e => credentials.photo = e.target.files[0]"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('photo')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700">
                    Password:
                </label>
                <input type="password" id="password" v-model="credentials.password"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('password')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
                    Confirm Password:
                </label>
                <input type="password" id="password_confirmation" v-model="credentials.password_confirmation"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('password_confirmation')"></ErrorMessage>
            </div>


            <div v-if="errorMessage" class="text-red-500 text-sm">
                {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="text-green-500 text-sm">
                {{ successMessage }}
            </div>

            <Button type="submit">Register</Button>
        </form>
    </div>
</template>