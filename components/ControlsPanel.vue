<template>
  <div
    class="p-2 flex flex-col gap-2 border-r transition-colors duration-200 flex-shrink-0"
    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'"
    :style="{ width: width + 'px' }"
  >
    <button
      @click="$emit('toggleScroll')"
      :class="[
        'py-3 rounded text-sm font-medium transition text-white',
        isScrolling ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
      ]"
    >
      {{ isScrolling ? 'Stop' : 'Play' }}
    </button>

    <div class="text-center text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-600'">Speed</div>
    <div class="text-center text-lg font-bold">{{ speed }}</div>
    <button @click="$emit('changeSpeed', 5)" class="py-2 rounded" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">+</button>
    <button @click="$emit('changeSpeed', -5)" class="py-2 rounded" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">-</button>

    <div class="text-center text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-600'">Font</div>
    <button @click="$emit('changeFontSize', 2)" class="py-2 rounded text-lg" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">A</button>
    <button @click="$emit('changeFontSize', -2)" class="py-2 rounded text-xs" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">A</button>

    <button
      @click="$emit('toggleTheme')"
      class="py-2 rounded text-xs mt-2"
      :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'"
    >
      {{ isDark ? 'Light' : 'Dark' }}
    </button>

    <!-- Hide Tabs Toggle -->
    <div class="mt-3 pt-3 border-t" :class="isDark ? 'border-gray-700' : 'border-gray-300'">
      <label class="flex flex-col items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          :checked="hideTabs"
          @change="$emit('update:hideTabs', ($event.target as HTMLInputElement).checked)"
          class="w-4 h-4 rounded"
        />
        <span class="text-xs text-center leading-tight" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          Ocultar<br/>Tabs
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  width: number
  isDark: boolean
  isScrolling: boolean
  speed: number
  hideTabs: boolean
}>()

defineEmits<{
  toggleScroll: []
  changeSpeed: [delta: number]
  changeFontSize: [delta: number]
  toggleTheme: []
  'update:hideTabs': [value: boolean]
}>()
</script>
