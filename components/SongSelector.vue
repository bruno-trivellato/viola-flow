<template>
  <div class="relative" ref="container">
    <button
      @click="isOpen = !isOpen"
      class="w-full px-3 py-2 border rounded text-sm focus:outline-none flex items-center gap-2 overflow-hidden"
      :class="isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'"
    >
      <span class="flex-1 text-left truncate min-w-0">
        {{ selectedSong ? `${selectedSong.title} - ${selectedSong.artist}` : '-- Selecione uma música --' }}
      </span>
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-1 w-72 border rounded shadow-lg z-50"
      :class="isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'"
    >
      <!-- Search input -->
      <div class="p-2 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar música..."
          class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500"
          :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'"
          @click.stop
        />
      </div>

      <!-- Songs list -->
      <div class="max-h-52 overflow-y-auto">
        <div
          v-if="!searchQuery"
          @click="selectSong(null)"
          class="px-3 py-2 cursor-pointer text-sm"
          :class="isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"
        >
          -- Selecione uma música --
        </div>
        <div
          v-for="song in filteredSongs"
          :key="song.id"
          class="group px-3 py-2 cursor-pointer text-sm flex items-center justify-between"
          :class="[
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
            selectedId === song.id ? (isDark ? 'bg-gray-700' : 'bg-blue-50') : ''
          ]"
          @click="selectSong(song.id!)"
        >
          <span class="truncate flex-1">{{ song.title }} - {{ song.artist }}</span>
          <button
            @click.stop="$emit('delete', song.id!)"
            class="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
            :class="isDark ? 'hover:bg-red-600 text-gray-400 hover:text-white' : 'hover:bg-red-100 text-gray-400 hover:text-red-600'"
            title="Excluir música"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <div
          v-if="searchQuery && filteredSongs.length === 0"
          class="px-3 py-2 text-sm text-center"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          Nenhuma música encontrada
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '~/composables/useDatabase'

const props = defineProps<{
  songs: Song[]
  selectedId: number | null
  isDark: boolean
}>()

const emit = defineEmits<{
  select: [id: number | null]
  delete: [id: number]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const container = ref<HTMLDivElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const selectedSong = computed(() => {
  return props.songs.find(s => s.id === props.selectedId)
})

const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.songs
  }
  const query = searchQuery.value.toLowerCase().trim()
  return props.songs.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  )
})

const selectSong = (id: number | null) => {
  emit('select', id)
  isOpen.value = false
  searchQuery.value = ''
}

// Focus search input when dropdown opens
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
