<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        class="flex flex-col gap-4 p-8 rounded-2xl shadow-2xl min-w-[320px]"
        :class="isDark ? 'bg-gray-800' : 'bg-white'"
      >
        <!-- Header -->
        <div class="flex items-center gap-3 pb-2 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
          <img :src="isDark ? '/logo-dark.png' : '/logo.png'" alt="" class="w-8 h-8" />
          <span class="text-lg font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">Carregando cifra</span>
        </div>

        <!-- Steps -->
        <div class="flex flex-col gap-3">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-center gap-3"
          >
            <!-- Step indicator -->
            <div class="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <!-- Completed -->
              <svg v-if="step.status === 'done'" class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <!-- Loading -->
              <div v-else-if="step.status === 'loading'" class="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <!-- Pending -->
              <div v-else class="w-5 h-5 rounded-full border-2" :class="isDark ? 'border-gray-600' : 'border-gray-300'"></div>
            </div>
            <!-- Step text -->
            <span
              class="text-sm"
              :class="[
                step.status === 'done' ? (isDark ? 'text-green-400' : 'text-green-600') :
                step.status === 'loading' ? (isDark ? 'text-white' : 'text-gray-800') :
                (isDark ? 'text-gray-500' : 'text-gray-400')
              ]"
            >
              {{ step.text }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface LoadingStep {
  text: string
  status: 'pending' | 'loading' | 'done'
}

defineProps<{
  show: boolean
  isDark: boolean
  steps: LoadingStep[]
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
