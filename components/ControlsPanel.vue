<template>
  <!-- Desktop: Vertical sidebar -->
  <div
    v-if="!isMobile"
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
    <button @click="$emit('changeSpeed', 10)" class="py-2 rounded" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">+</button>
    <button @click="$emit('changeSpeed', -10)" class="py-2 rounded" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">-</button>

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

  <!-- Mobile: Horizontal bottom bar -->
  <div
    v-else
    class="fixed bottom-0 left-0 right-0 flex items-center justify-around p-2 border-t z-40"
    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'"
  >
    <!-- Play/Pause Scroll -->
    <button
      @click="$emit('toggleScroll')"
      class="flex flex-col items-center p-2 rounded-lg"
      :class="isScrolling ? 'text-green-500' : (isDark ? 'text-gray-400' : 'text-gray-600')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path v-if="isScrolling" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-xs mt-1">{{ isScrolling ? 'Parar' : 'Scroll' }}</span>
    </button>

    <!-- Speed Down -->
    <button
      @click="$emit('changeSpeed', -10)"
      class="flex flex-col items-center p-2 rounded-lg"
      :class="isDark ? 'text-gray-400' : 'text-gray-600'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span class="text-xs mt-1">Lento</span>
    </button>

    <!-- Speed indicator -->
    <div class="flex flex-col items-center p-2">
      <span class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">{{ speed }}</span>
      <span class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Veloc.</span>
    </div>

    <!-- Speed Up -->
    <button
      @click="$emit('changeSpeed', 10)"
      class="flex flex-col items-center p-2 rounded-lg"
      :class="isDark ? 'text-gray-400' : 'text-gray-600'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-xs mt-1">Rápido</span>
    </button>

    <!-- Chords -->
    <button
      @click="$emit('showChords')"
      class="flex flex-col items-center p-2 rounded-lg"
      :class="isDark ? 'text-gray-400' : 'text-gray-600'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
      <span class="text-xs mt-1">Acordes</span>
    </button>

    <!-- YouTube external link -->
    <a
      v-if="videoId"
      :href="`https://www.youtube.com/watch?v=${videoId}`"
      target="_blank"
      class="flex flex-col items-center p-2 rounded-lg text-red-500"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      <span class="text-xs mt-1">YouTube</span>
    </a>

    <!-- More menu (...) -->
    <button
      @click="showMenu = !showMenu"
      class="flex flex-col items-center p-2 rounded-lg relative"
      :class="isDark ? 'text-gray-400' : 'text-gray-600'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
      <span class="text-xs mt-1">Mais</span>
    </button>
  </div>

  <!-- Mobile More Menu (popup above bar) -->
  <div
    v-if="isMobile && showMenu"
    class="fixed bottom-16 right-2 rounded-lg shadow-xl border z-50 py-1 min-w-[140px]"
    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
  >
    <!-- Font Size -->
    <div class="px-3 py-2 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-100'">
      <span class="text-xs font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Tamanho da fonte</span>
      <div class="flex items-center justify-between mt-1">
        <button
          @click="$emit('changeFontSize', -2)"
          class="p-1 rounded"
          :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
        >
          <span class="text-lg font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">A-</span>
        </button>
        <span class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">{{ fontSize }}px</span>
        <button
          @click="$emit('changeFontSize', 2)"
          class="p-1 rounded"
          :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
        >
          <span class="text-lg font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">A+</span>
        </button>
      </div>
    </div>

    <!-- Hide Tabs Toggle -->
    <div class="px-3 py-2 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-100'">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          :checked="hideTabs"
          @change="$emit('update:hideTabs', ($event.target as HTMLInputElement).checked)"
          class="w-4 h-4 rounded"
        />
        <span :class="isDark ? 'text-white' : 'text-gray-800'">Ocultar Tabs</span>
      </label>
    </div>

    <!-- Theme toggle -->
    <button
      @click="$emit('toggleTheme'); showMenu = false"
      class="w-full flex items-center gap-3 px-3 py-2"
      :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="isDark ? 'text-gray-400' : 'text-gray-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path v-if="isDark" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <span :class="isDark ? 'text-white' : 'text-gray-800'">{{ isDark ? 'Modo claro' : 'Modo escuro' }}</span>
    </button>

    <!-- Mini player toggle -->
    <button
      v-if="videoId"
      @click="$emit('toggleMiniPlayer'); showMenu = false"
      class="w-full flex items-center gap-3 px-3 py-2"
      :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="showMiniPlayer ? 'text-blue-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span :class="isDark ? 'text-white' : 'text-gray-800'">{{ showMiniPlayer ? 'Esconder mini' : 'Mostrar mini' }}</span>
    </button>

    <!-- Batch import -->
    <button
      @click="$emit('openImport'); showMenu = false"
      class="w-full flex items-center gap-3 px-3 py-2 border-t"
      :class="[isDark ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-100 border-gray-100']"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="isDark ? 'text-gray-400' : 'text-gray-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <span :class="isDark ? 'text-white' : 'text-gray-800'">Importar em lote</span>
    </button>
  </div>

  <!-- Backdrop for menu -->
  <div
    v-if="isMobile && showMenu"
    class="fixed inset-0 z-40"
    @click="showMenu = false"
  ></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  width?: number
  isDark: boolean
  isMobile: boolean
  isScrolling: boolean
  speed: number
  fontSize: number
  hideTabs: boolean
  videoId?: string
  showMiniPlayer?: boolean
}>()

defineEmits<{
  toggleScroll: []
  changeSpeed: [delta: number]
  changeFontSize: [delta: number]
  toggleTheme: []
  'update:hideTabs': [value: boolean]
  showChords: []
  toggleMiniPlayer: []
  openImport: []
}>()

const showMenu = ref(false)
</script>
