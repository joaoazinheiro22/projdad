import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

import avatarNoneAssetURL from '@/assets/avatar-none.png'

export const useAuthStore = defineStore('auth', () => {
  const storeError = useErrorStore()
  const socket = inject('socket')
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || '')

  if (token.value) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
    axios.get('users/me').then(response => {
      user.value = response.data
    }).catch(() => {
      clearUser()
    })
  }

  const userName = computed(() => {
    return user.value ? user.value.name : ''
  })

  const userId = computed(() => {
    return user.value ? user.value.id : ''
  })

  const userFirstLastName = computed(() => {
    const nameValue = userName.value || ''
    const names = nameValue.trim().split(' ')
    const firstName = names[0] ?? ''
    const lastName = names.length > 1 ? names[names.length - 1] : ''
    return (firstName + ' ' + lastName).trim()
})

  const userEmail = computed(() => {
    return user.value ? user.value.email : ''
  })

  const userType = computed(() => {
    return user.value ? user.value.type : ''
  })

  const userGender = computed(() => {
    return user.value ? user.value.gender : ''
  })

  const userBrainCoinsBalance = computed(() => {
    return user.value ? user.value.brain_coins_balance : 0
  })

  const userPhotoUrl = computed(() => {
    const photoFile = user.value ? (user.value.photo_filename ?? '') : ''
    if (photoFile) {
      return axios.defaults.baseURL.replaceAll('/api', photoFile)
    }
    return avatarNoneAssetURL
  })

  const userPlayer = computed(() => {
    return userType.value === 'P'
  })

  const userAdmin = computed(() => {
    return userType.value === 'A'
  })

  const userLoggedIn = computed(() => {
    return !!user.value
  })

  const clearUser = () => {
    resetIntervalToRefreshToken()
    if (user.value) {
      socket.emit('logout', user.value)
    }
    user.value = null
    token.value = ''
    localStorage.removeItem('authToken')
    axios.defaults.headers.common.Authorization = ''
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('auth/register', userData)
      user.value = response.data
      return 'Registration successful'
    } catch (error) {
      console.error('Registration failed:', error)
      return 'Registration failed'
    }
  }

  const login = async (credentials) => {
    storeError.resetMessages()
    try {
      const responseLogin = await axios.post('auth/login', credentials)
      token.value = responseLogin.data.token
      localStorage.setItem('authToken', token.value)
      console.log('token', token.value)
      axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
      const responseUser = await axios.get('users/me')
      user.value = responseUser.data
      socket.emit('login', user.value)
      repeatRefreshToken()
      return user.value
    } catch (e) {
      clearUser()
      storeError.setErrorMessages(
        e.response.data.message,
        e.response.data.errors,
        e.response.status,
        'Authentication Error!'
      )
      return false
    }
  }

  const logout = async () => {
    storeError.resetMessages()
    try {
      await axios.post('auth/logout')
      clearUser()
      return true
    } catch (e) {
      clearUser()
      storeError.setErrorMessages(
        e.response.data.message,
        [],
        e.response.status,
        'Authentication Error!'
      )
      return false
    }
  }

  const removeAccount = async (password) => {
    storeError.resetMessages()
    try {
      await axios.delete('auth/delete-account', { data: { password } })
      clearUser()
      return true
    } catch (e) {
      storeError.setErrorMessages(
        e.response.data.message,
        [],
        e.response.status,
        'Failed to remove account'
      )
      return false
    }
  }


  let intervalToRefreshToken = null

  const resetIntervalToRefreshToken = () => {
    if (intervalToRefreshToken) {
      clearInterval(intervalToRefreshToken)
    }
    intervalToRefreshToken = null
  }

  const repeatRefreshToken = () => {
    if (intervalToRefreshToken) {
      clearInterval(intervalToRefreshToken)
    }
    intervalToRefreshToken = setInterval(
      async () => {
        try {
          const response = await axios.post('auth/refreshtoken')
          token.value = response.data.token
          axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
          return true
        } catch (e) {
          clearUser()
          storeError.setErrorMessages(
            e.response.data.message,
            e.response.data.errors,
            e.response.status,
            'Authentication Error!'
          )
          return false
        }
      },
      1000 * 60 * 110
    )
    return intervalToRefreshToken
  }

  const restoreToken = async function () {
    let storedToken = localStorage.getItem('token')
        if (storedToken) {
            try {
                token.value = storedToken
                axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
                const responseUser = await axios.get('users/me')
                user.value = responseUser.data.data
                socket.emit('login', user.value)
                repeatRefreshToken()
                return true                 
            } catch {
                clearUser()
                return false 
            }
    }
    return false
}


  return {
    user,
    userName,
    userId,
    userFirstLastName,
    userEmail,
    userType,
    userGender,
    userPhotoUrl,
    userPlayer,
    userAdmin,
    userLoggedIn,
    userBrainCoinsBalance,
    login,
    logout,
    register,
    removeAccount,
    repeatRefreshToken,
    restoreToken
  }
})