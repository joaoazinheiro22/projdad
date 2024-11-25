<script setup>
import { ref } from 'vue';

// Create a reactive reference for today's date
const today = new Date();

// Format the date to match "Monday, Nov. 25, 2024"
const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
const formattedDate = today.toLocaleDateString('en-US', options);
</script>

<template>
  <div class="bg-blue-500 h-128 flex flex-col items-center space-y-12 py-12">
    
    <!-- Header Section -->
    <div class="text-center text-white">
      <h1 class="text-4xl font-bold">Memory Game</h1>
      <p class="text-lg mt-2">{{formattedDate}}</p>
    </div>

    <!-- Main Puzzle Options -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 max-w-5xl">
      <!-- The Mini -->
      <div class="bg-white shadow-md rounded-md p-6 text-center">
        <div class="w-12 h-12 mx-auto bg-black"></div>
        <h2 class="text-2xl font-bold mt-4">3x4</h2>
        <p class="text-gray-600 mt-1">{{formattedDate}}</p>
        <!-- <p class="text-sm text-gray-500 mt-2">By WYNA LIU<br />Edited by SAM EZERSKY</p> -->
      </div>

      <!-- The Crossword -->
      <div class="bg-white shadow-md rounded-md p-6 text-center opacity-70">
        <div class="w-12 h-12 mx-auto bg-gray-300"></div>
        <h2 class="text-2xl font-bold mt-4">4x4</h2>
        <p class="text-gray-600 mt-1">{{formattedDate}}</p>
      </div>

      <!-- Spelling Bee -->
      <div class="bg-white shadow-md rounded-md p-6 text-center opacity-70">
        <div class="w-12 h-12 mx-auto bg-gray-300"></div>
        <h2 class="text-2xl font-bold mt-4">6x6</h2>
        <p class="text-gray-600 mt-1">{{formattedDate}}</p>
      </div>
    </div>

    <!-- Footer Section -->
    <div class="text-center text-white">
      <p class="underline cursor-pointer hover:text-gray-200">
        Login to see your history (???)
      </p>
    </div>

    <!-- More Games Section -->
</div>
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
</template>
