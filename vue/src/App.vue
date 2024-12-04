<script setup>
import { useTemplateRef, provide, ref } from 'vue';
import Toaster from './components/ui/toast/Toaster.vue';
import { useAuthStore } from '@/stores/auth';
import GlobalAlertDialog from '@/components/common/GlobalAlertDialog.vue'
import router from './router';

const authStore = useAuthStore()
const isGameScoresOpen = ref(false)

const alertDialog = useTemplateRef('alert-dialog')
provide('alertDialog', alertDialog)

const logoutConfirmed = () => {
  authStore.logout()
  router.push('/')
}

const logout = () => {
  alertDialog.value.open(logoutConfirmed,
    'Logout confirmation?', 'Cancel', `Yes, I want to log out`,
    `Are you sure you want to log out? You can still access your account later with
your credentials.`)
}

const users = () => {
  router.push('/users')
}

const closeDropdown = () => {
  isGameScoresOpen.value = false
}

const toggleDropdown = () => {
  isGameScoresOpen.value = !isGameScoresOpen.value
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
            <RouterLink to="/statistics"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Statistics
            </RouterLink>

            <div class="relative" @mouseenter="isGameScoresOpen = true" @mouseleave="closeDropdown">
              <button @click="toggleDropdown"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="{ 'text-blue-600': isGameScoresOpen }">
                Game Scores
              </button>

              <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="isGameScoresOpen"
                  class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                  <RouterLink to="/scoreboard/global"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeDropdown">
                    Global Game Scores
                  </RouterLink>
                  <RouterLink :to="`/scoreboard/${authStore.userId}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeDropdown">
                    Personal Game Scores
                  </RouterLink>
                </div>
              </transition>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button v-if="authStore.userAdmin" @click="users"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              All Users
            </button>
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