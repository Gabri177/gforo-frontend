import { createRouter, createWebHistory } from 'vue-router'
import Home from '~/views/Home.vue'
import About from '~/views/About.vue'
import Register from '~/views/Register.vue'
import Login from '~/views/Login.vue'
import Message from '~/views/Message.vue'
import ForgetPassword from '~/views/ForgetPassword.vue'
import ForgetResetPassword from '~/views/ForgetResetPassword.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    //meta: { transition: null } 
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    //meta: { transition: 'fade-scale' }
  },
  {
    path: '/register/:userId/:token',
    name: 'RegisterWithVars',
    component: Register,
    //meta: { transition: 'fade-scale' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    //meta: { transition: 'fade-horizontal' }
  },
  {
    path: '/message',
    name: 'Message',
    component: Message,
    //meta: { transition: 'fade-rotate' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    //meta: { transition: 'fade-blur' }
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: ForgetPassword,
    //meta: { transition: 'fade-slide' }
  },
  {
    path: '/forget-reset-password',
    name: 'ForgetResetPassword',
    component: ForgetResetPassword,
    //meta: { transition: 'fade-slide' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
