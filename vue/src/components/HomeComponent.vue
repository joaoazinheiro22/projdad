<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();

// Function to navigate to the GameBoard
const goToGameBoard = (mode) => {
  router.push({ name: 'GameBoard', params: { mode } });
};

const goToLogin = () => {
  router.push({ name: 'Login' });
};

const goToUserProfile = (id) => {
  router.push({ name: 'UserProfile', params: { id } });
};

// Auth store
const authStore = useAuthStore();

</script>

<template>
  <!--  -->
  <div v-if="!authStore.userAdmin">

    <div v-if="authStore.user" class="bg-blue-500 h-128 flex flex-col items-center space-y-12 py-12">

      <!-- Header Section -->
      <div class="text-center text-white">
        <h1 class="text-4xl font-bold">Memory Game</h1>
      </div>


      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 max-w-5xl">
        <!-- 3x4 -->
        <div @click="goToGameBoard('3x4')" class="bg-white shadow-md rounded-md p-6 text-center cursor-pointer">
          <img src="/3x4.png" alt="Card Back" class="w-12 h-12 mx-auto">
          <h2 class="text-2xl font-bold mt-4">3x4</h2>
        </div>

        <!-- 4x4 -->
        <div @click="goToGameBoard('4x4')" class="bg-white shadow-md rounded-md p-6 text-center cursor-pointer">
          <img src="/4x4.png" alt="Card Back" class="w-12 h-12 mx-auto">
          <h2 class="text-2xl font-bold mt-4">4x4</h2>
        </div>

        <!-- 6x6 -->
        <div @click="goToGameBoard('6x6')" class="bg-white shadow-md rounded-md p-6 text-center cursor-pointer">
          <img src="/6x6.png" alt="Card Back" class="w-12 h-12 mx-auto">
          <h2 class="text-2xl font-bold mt-4">6x6</h2>
        </div>
      </div>

      <!-- Footer Section -->
      <div class="text-center text-white">
        <p @click="goToUserProfile" class="underline cursor-pointer hover:text-gray-200">
          See my history
        </p>
      </div>

    </div>
    <div v-else class="bg-blue-500 h-128 flex flex-col items-center space-y-12 py-12">
      <div class="text-center text-white">
        <h1 class="text-4xl font-bold">Memory Game</h1>
      </div>

      <!-- Center the single card -->
      <div class="flex justify-center items-center w-full max-w-5xl">
        <!-- 3x4 -->
        <div @click="goToGameBoard('3x4')" class="bg-white shadow-md rounded-md p-6 text-center cursor-pointer">
          <img src="/3x4.png" alt="Card Back" class="w-12 h-12 mx-auto">
          <h2 class="text-2xl font-bold mt-4">3x4</h2>
        </div>
      </div>

      <div class="text-center text-white">
        <p @click="goToLogin" class="underline cursor-pointer hover:text-gray-200">
          Login to see your history and more game modes
        </p>
      </div>
    </div>




    <!-- More Games Section -->
    <div class="bg-white w-full py-12">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold mb-8">More Info Here</h2>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div class="bg-yellow-400 rounded-md p-6 shadow-md">
            <h3 class="text-lg font-bold">Example</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <h1 class="text-center">As an admin you can't access this page</h1>
  </div>
</template>
