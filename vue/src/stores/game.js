import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useGameStore = defineStore('game', () => {
    const storeError = useErrorStore()
    const gameHistory = ref([])

    const fetchGameHistory = async () => {
        try {
            const response = await axios.get('games/history')
            gameHistory.value = response.data.data // Adjusted to access the data property
        } catch (error) {
            console.error('Failed to fetch game history:', error)
            storeError.setErrorMessages(
                error.response.data.message,
                error.response.data.errors,
                error.response.status,
                'Failed to fetch game history'
            )
        }
    }

    return {
        gameHistory,
        fetchGameHistory
    }
})