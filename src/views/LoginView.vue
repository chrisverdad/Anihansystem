<template>
  <div
    class="min-h-screen flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden"
  >
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-violet-100/90 via-slate-50 to-emerald-100/80"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -top-24 -right-24 z-0 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -left-16 z-0 h-80 w-80 rounded-full bg-emerald-200/45 blur-3xl"
      aria-hidden="true"
    />
    <!-- Home Button -->
    <div class="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
      <router-link
        to="/"
        class="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 shadow-md hover:bg-slate-50 hover:border-violet-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all"
      >
        <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="hidden xs:inline">Home</span>
      </router-link>
    </div>

    <div class="w-full max-w-sm sm:max-w-md mx-auto relative z-10">
      <div
        class="bg-white py-6 sm:py-8 lg:py-10 px-5 sm:px-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
      >
        <!-- Logo + titles on solid white for WCAG contrast -->
        <div class="flex justify-center mb-5 sm:mb-6">
          <div class="flex items-center gap-2 sm:gap-3">
            <img src="/image/logoAnihan.png" alt="AniHan" class="h-14 w-auto object-contain" />
            <span class="text-2xl sm:text-3xl font-bold logo-bubbly tracking-tight">AniHan</span>
          </div>
        </div>

        <h1 class="text-center text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-3">
          Sign in to your account
        </h1>
        <p class="text-center text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">
          <span class="text-slate-700">Or</span>
          <router-link
            to="/register"
            class="font-semibold text-violet-700 hover:text-violet-900 underline underline-offset-2 decoration-violet-400 hover:decoration-violet-700 ml-1"
          >
            create a new account
          </router-link>
        </p>

        <form class="space-y-4 sm:space-y-6" @submit.prevent="handleSubmit">
          <!-- Email -->
          <div>
            <label for="email" class="block text-xs sm:text-sm font-medium text-slate-800 mb-1 sm:mb-2">
              Email address
            </label>
            <div>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm sm:text-base"
                :class="{ 'border-red-500': errors.email }"
                placeholder="Enter your email"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-xs sm:text-sm text-danger-600">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-xs sm:text-sm font-medium text-slate-800 mb-1 sm:mb-2">
              Password
            </label>
            <div>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm sm:text-base"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Enter your password"
              />
            </div>
            <p v-if="errors.password" class="mt-1 text-xs sm:text-sm text-danger-600">{{ errors.password }}</p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-3 w-3 sm:h-4 sm:w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-xs sm:text-sm text-slate-800">
                Remember me
              </label>
            </div>

            <div class="text-xs sm:text-sm">
              <a href="#" class="font-semibold text-violet-700 hover:text-violet-900 underline underline-offset-2">
                Forgot password?
              </a>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="hidden xs:inline">Signing in...</span>
                <span class="xs:hidden">Signing in</span>
              </span>
              <span v-else>Sign in</span>
            </button>
          </div>

          <!-- Demo Accounts removed -->
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { LoginCredentials } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive<LoginCredentials & { rememberMe: boolean }>({
  email: '',
  password: '',
  rememberMe: false
})


const validateForm = () => {
  errors.value = {}
  
  if (!form.email) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'Email is invalid'
  }
  
  if (!form.password) {
    errors.value.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    await authStore.login({
      email: form.email,
      password: form.password
    })
    
    toast.success('Successfully logged in!')
    // Redirect based on user role
    if (authStore.isAdmin) {
      router.push('/admin/dashboard')
    } else if (authStore.isVendor) {
      router.push('/dashboard')
    } else {
      router.push('/user/dashboard')
    }
  } catch (error: any) {
    toast.error(error.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>
