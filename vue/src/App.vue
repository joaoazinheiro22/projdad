<script setup>
import { useTemplateRef, provide } from 'vue';
import Toaster from './components/ui/toast/Toaster.vue';
import { useAuthStore } from '@/stores/auth';
import GlobalAlertDialog from '@/components/common/GlobalAlertDialog.vue'

import router from './router';

const authStore = useAuthStore()

// const logout = async () => {
//   await authStore.logout()
//   router.push('/')
// };

const alertDialog = useTemplateRef('alert-dialog')
provide('alertDialog', alertDialog)

const logoutConfirmed = () => {
  authStore.logout()
}
const logout = () => {
  alertDialog.value.open(logoutConfirmed,
    'Logout confirmation?', 'Cancel', `Yes, I want to log out`,
    `Are you sure you want to log out? You can still access your account later with
your credentials.`)
}

</script>

<template>
  <Toaster />
  <GlobalAlertDialog ref="alert-dialog"></GlobalAlertDialog>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-8">
            <RouterLink to="/"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Home
            </RouterLink>
            <RouterLink to="/testers/websocket"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              WebSockets Tester
            </RouterLink>
          </div>
          <div class="flex items-center space-x-4">
            <div v-if="authStore.user" class="flex items-center space-x-2">
              <div class="flex items-center space-x-1 text-gray-900">
                <img src="@/assets/brain-coins-logo.png" alt="Brain Coins Logo" class="w-12 h-12">
                <span>{{ authStore.userBrainCoinsBalance }}</span>
              </div>
              <RouterLink :to="`/profile/${authStore.userId}`"
                class="flex items-center space-x-2 text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-blue-600 font-semibold">
                <img class="w-10 h-10 rounded-full" :src="authStore.userPhotoUrl" alt="User avatar">
                <span class="text-gray-900">{{ authStore.userFirstLastName }}</span>
              </RouterLink>
              <button v-if="authStore.user" @click="logout"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Logout
              </button>
            </div>
            <RouterLink v-else to="/login"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Login
            </RouterLink>
            <RouterLink v-if="!authStore.user" to="/register"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Register
            </RouterLink>
          </div>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>