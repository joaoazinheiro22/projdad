import HomeComponent from '@/components/HomeComponent.vue'
import Login from '@/components/auth/Login.vue'
import WebSocketTester from '@/components/WebSocketTester.vue'
import { createRouter, createWebHistory } from 'vue-router'
import GameBoard from '@/components/games/GameBoard.vue'
import Register from '@/components/auth/Register.vue'
import UserProfile from '@/components/users/UserProfile.vue'
import Games from '@/components/games/Games.vue'
import Users from '@/components/users/Users.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeComponent
    },
    {
      path: '/users',
      name: 'users',
      component: Users
    },
    {
      path:"/games",
      name:"games",
      component: Games
    },
    {
      path: '/profile/:id',
      name: 'UserProfile',
      component: UserProfile,
      props: true, // Pass route.params to props
    },
    {
      path: '/game/:mode',
      name: 'GameBoard',
      component: GameBoard,
      props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/testers',
      children: [
        {
          path: 'websocket',
          component: WebSocketTester
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // if (to.name === 'users') {
  //   if (!authStore.user || authStore.user.type !== 'A') {
  //     next('/login') // Redirect non-admin users
  //     return
  //   }
  // }
  
  next()
})

export default router
