<template>
  <div class="h-screen p-3 transition-colors duration-200" :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'">
    <!-- Loading Modal -->
    <Transition name="fade">
      <div
        v-if="isParsing"
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
              v-for="(step, index) in loadingSteps"
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

    <div class="h-full flex flex-col rounded-xl overflow-hidden">
    <!-- Top Bar -->
    <div class="flex items-center gap-3 p-3 border-b flex-wrap transition-colors duration-200" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300 shadow-sm'">
      <!-- App Logo -->
      <div class="flex items-center gap-2">
        <img
          :src="isDark ? '/logo-dark.png' : '/logo.png'"
          alt="Viola Flow"
          class="h-8 w-8"
        />
        <span class="font-bold text-lg" :class="isDark ? 'text-white' : 'text-gray-800'">Viola Flow</span>
      </div>

      <span :class="isDark ? 'text-gray-600' : 'text-gray-300'">|</span>

      <!-- Song selector (custom dropdown) -->
      <div class="relative" ref="dropdownContainer">
        <button
          @click="showSongDropdown = !showSongDropdown"
          class="px-3 py-2 border rounded text-sm focus:outline-none flex items-center gap-2 min-w-[200px]"
          :class="isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'"
        >
          <span class="flex-1 text-left truncate">
            {{ selectedSongId ? songs.find(s => s.id === selectedSongId)?.title + ' - ' + songs.find(s => s.id === selectedSongId)?.artist : '-- Selecione uma música --' }}
          </span>
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <!-- Dropdown menu -->
        <div
          v-if="showSongDropdown"
          class="absolute top-full left-0 mt-1 w-72 border rounded shadow-lg z-50"
          :class="isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'"
        >
          <!-- Search input -->
          <div class="p-2 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
            <input
              ref="songSearchInput"
              v-model="songSearchQuery"
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
              v-if="!songSearchQuery"
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
                selectedSongId === song.id ? (isDark ? 'bg-gray-700' : 'bg-blue-50') : ''
              ]"
              @click="selectSong(song.id!)"
            >
              <span class="truncate flex-1">{{ song.title }} - {{ song.artist }}</span>
              <button
                @click.stop="deleteSongById(song.id!)"
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
              v-if="songSearchQuery && filteredSongs.length === 0"
              class="px-3 py-2 text-sm text-center"
              :class="isDark ? 'text-gray-500' : 'text-gray-400'"
            >
              Nenhuma música encontrada
            </div>
          </div>
        </div>
      </div>

      <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">CifraClub:</label>
      <input
        v-model="cifraClubUrl"
        type="text"
        :placeholder="isParsing ? 'Carregando...' : 'Cole a URL e pressione Enter'"
        :disabled="isParsing"
        class="flex-1 min-w-[150px] px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
        @keyup.enter="parseCifra"
      />

      <span :class="isDark ? 'text-gray-600' : 'text-gray-300'">|</span>

      <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">YouTube:</label>
      <input
        v-model="youtubeUrl"
        type="text"
        placeholder="Cole a URL e pressione Enter"
        class="flex-1 min-w-[150px] px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500"
        :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
        @keyup.enter="loadVideo"
      />

    </div>

    <!-- Main Content -->
    <div ref="mainContainer" class="flex flex-1 overflow-hidden">
      <!-- Controls Panel (LEFT) -->
      <div
        class="p-2 flex flex-col gap-2 border-r transition-colors duration-200 flex-shrink-0"
        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'"
        :style="{ width: leftPanelWidth + 'px' }"
      >
        <button
          @click="toggleScroll"
          :class="[
            'py-3 rounded text-sm font-medium transition text-white',
            isScrolling ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          ]"
        >
          {{ isScrolling ? 'Stop' : 'Play' }}
        </button>

        <div class="text-center text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-600'">Speed</div>
        <div class="text-center text-lg font-bold">{{ speed }}</div>
        <button @click="changeSpeed(5)" class="py-2 rounded" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">+</button>
        <button @click="changeSpeed(-5)" class="py-2 rounded" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">-</button>

        <div class="text-center text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-600'">Font</div>
        <button @click="changeFontSize(2)" class="py-2 rounded text-lg" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">A</button>
        <button @click="changeFontSize(-2)" class="py-2 rounded text-xs" :class="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'">A</button>

        <button
          @click="toggleTheme"
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
              v-model="hideTabs"
              class="w-4 h-4 rounded"
            />
            <span class="text-xs text-center leading-tight" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
              Ocultar<br/>Tabs
            </span>
          </label>
        </div>

      </div>

      <!-- Resizer: Left Panel -->
      <div
        class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
        :class="isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-300 hover:bg-blue-500'"
        @mousedown="startResize('left', $event)"
      ></div>

      <!-- Chords Panel (MIDDLE - where the cifra text is) -->
      <div
        ref="middlePanel"
        class="flex flex-col border-r overflow-hidden"
        :class="isDark ? 'border-gray-700' : 'border-gray-300'"
        :style="middlePanelWidth ? { width: middlePanelWidth + 'px', flexShrink: 0 } : { flex: 1 }"
      >
        <!-- Tone and Capo info -->
        <div v-if="saveForm.tone || saveForm.capo" class="flex items-center gap-3 px-5 py-2 border-b" :class="isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'">
          <span v-if="saveForm.tone" class="px-2 py-1 rounded text-sm font-medium" :class="isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'">
            Tom: {{ saveForm.tone }}
          </span>
          <span v-if="saveForm.capo" class="px-2 py-1 rounded text-sm font-medium" :class="isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'">
            Capo: {{ saveForm.capo }}ª casa
          </span>
        </div>
        <!-- Edit mode -->
        <textarea
          v-if="isEditing"
          ref="chordsTextarea"
          v-model="chordsContent"
          @blur="isEditing = false"
          class="flex-1 p-5 font-mono resize-none focus:outline-none transition-colors duration-200"
          :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'"
          :style="{ fontSize: fontSize + 'px', lineHeight: '1.6' }"
          placeholder="Cole a cifra aqui..."
        ></textarea>
        <!-- View mode with colored chords -->
        <div
          v-else
          ref="chordsDisplay"
          @click="startEditing"
          class="flex-1 p-5 font-mono overflow-auto cursor-text transition-colors duration-200 whitespace-pre"
          :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'"
          :style="{ fontSize: fontSize + 'px', lineHeight: '1.6' }"
        >
          <span v-if="!chordsContent" :class="isDark ? 'text-gray-600' : 'text-gray-400'">Clique aqui para colar a cifra...</span>
          <span v-else v-html="colorizedChords"></span>
        </div>
      </div>

      <!-- Resizer: Middle Panel -->
      <div
        class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
        :class="isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-300 hover:bg-blue-500'"
        @mousedown="startResize('middle', $event)"
      ></div>

      <!-- Detected Chords Panel (collapsible) -->
      <div
        v-if="showChordsPanel && detectedChords.length > 0"
        class="border-r overflow-y-auto transition-colors duration-200 flex-shrink-0"
        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'"
        :style="{ width: chordsPanelWidth + 'px' }"
      >
        <div class="p-2 border-b flex items-center justify-between" :class="isDark ? 'border-gray-700' : 'border-gray-300'">
          <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Acordes ({{ detectedChords.length }})</span>
          <button @click="showChordsPanel = false" class="text-gray-500 hover:text-gray-700 text-lg leading-none">&times;</button>
        </div>
        <div class="p-2 grid grid-cols-2 gap-2">
          <div
            v-for="chord in detectedChords"
            :key="chord"
            class="flex flex-col items-center"
            v-html="generateChordSVG(chord, isDark)"
          >
          </div>
        </div>
      </div>

      <!-- Toggle Chords Panel Button -->
      <button
        v-if="!showChordsPanel && detectedChords.length > 0"
        @click="showChordsPanel = true"
        class="w-8 flex items-center justify-center border-r transition-colors duration-200 hover:bg-opacity-80 flex-shrink-0"
        :class="isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'"
        title="Mostrar acordes"
      >
        <span class="transform -rotate-90 whitespace-nowrap text-xs font-medium">Acordes</span>
      </button>

      <!-- Resizer: Chords Panel (before video) -->
      <div
        v-if="showChordsPanel && detectedChords.length > 0"
        class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
        :class="isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-300 hover:bg-blue-500'"
        @mousedown="startResize('chords', $event)"
      ></div>

      <!-- Video Panel -->
      <div class="flex-1 bg-black flex items-center justify-center min-w-0">
        <iframe
          v-if="videoId"
          :src="`https://www.youtube.com/embed/${videoId}?autoplay=0`"
          class="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div v-else class="text-gray-600 text-center">
          Paste YouTube URL and click "Load Video"
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '~/composables/useDatabase'

const { getAllSongs, getSong, createSong, updateSong, deleteSong: dbDeleteSong, findByTitleAndArtist } = useDatabase()
const { generateChordSVG, extractChords } = useChordDiagram()

// State
const cifraClubUrl = ref('')
const youtubeUrl = ref('')
const videoId = ref('')
const chordsContent = ref('')
const speed = ref(30)
const fontSize = ref(16)
const isScrolling = ref(false)
const isDark = ref(false)
const isParsing = ref(false)
const isSaving = ref(false)

// Loading steps for the modal
const loadingSteps = ref([
  { text: 'Buscando página do Cifra Club', status: 'pending' as 'pending' | 'loading' | 'done' },
  { text: 'Extraindo título e artista', status: 'pending' as 'pending' | 'loading' | 'done' },
  { text: 'Processando cifra', status: 'pending' as 'pending' | 'loading' | 'done' },
  { text: 'Buscando vídeo no YouTube', status: 'pending' as 'pending' | 'loading' | 'done' },
  { text: 'Salvando na biblioteca', status: 'pending' as 'pending' | 'loading' | 'done' }
])

const resetLoadingSteps = () => {
  loadingSteps.value.forEach(step => step.status = 'pending')
}

const setStepLoading = (index: number) => {
  loadingSteps.value[index].status = 'loading'
}

const setStepDone = (index: number) => {
  loadingSteps.value[index].status = 'done'
}
const songs = ref<Song[]>([])
const selectedSongId = ref<number | null>(null)
const currentSong = ref<Song | null>(null)
const showSongDropdown = ref(false)
const dropdownContainer = ref<HTMLDivElement | null>(null)
const songSearchQuery = ref('')
const songSearchInput = ref<HTMLInputElement | null>(null)
const chordsTextarea = ref<HTMLTextAreaElement | null>(null)
const chordsDisplay = ref<HTMLDivElement | null>(null)
const isEditing = ref(false)
const showChordsPanel = ref(true)
const hideTabs = ref(false)

// Column widths (in pixels)
const leftPanelWidth = ref(80) // Controls panel
const chordsPanelWidth = ref(192) // Detected chords panel (w-48 = 192px)
const middlePanelWidth = ref<number | null>(null) // null = flex-1 (auto)

// Resizing state
const isResizing = ref(false)
const resizingColumn = ref<'left' | 'middle' | 'chords' | null>(null)
const startX = ref(0)
const startWidth = ref(0)

// Refs for panels
const mainContainer = ref<HTMLDivElement | null>(null)
const middlePanel = ref<HTMLDivElement | null>(null)

// Resize handlers
const startResize = (column: 'left' | 'middle' | 'chords', event: MouseEvent) => {
  isResizing.value = true
  resizingColumn.value = column
  startX.value = event.clientX

  if (column === 'left') {
    startWidth.value = leftPanelWidth.value
  } else if (column === 'middle') {
    // Get actual width of middle panel
    if (middlePanel.value) {
      startWidth.value = middlePanel.value.offsetWidth
    }
  } else if (column === 'chords') {
    startWidth.value = chordsPanelWidth.value
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value || !resizingColumn.value) return

  const delta = event.clientX - startX.value

  if (resizingColumn.value === 'left') {
    const newWidth = Math.max(60, Math.min(200, startWidth.value + delta))
    leftPanelWidth.value = newWidth
  } else if (resizingColumn.value === 'middle') {
    const newWidth = Math.max(200, startWidth.value + delta)
    middlePanelWidth.value = newWidth
  } else if (resizingColumn.value === 'chords') {
    // Dragging right increases chords panel width, dragging left decreases it
    const newWidth = Math.max(120, Math.min(400, startWidth.value + delta))
    chordsPanelWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  resizingColumn.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Filtered songs for search
const filteredSongs = computed(() => {
  if (!songSearchQuery.value.trim()) {
    return songs.value
  }
  const query = songSearchQuery.value.toLowerCase().trim()
  return songs.value.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  )
})

// Detected chords from the cifra
const detectedChords = computed(() => {
  return extractChords(chordsContent.value)
})

let scrollInterval: ReturnType<typeof setInterval> | null = null

// Helper to check if a line is tablature
const isTabLine = (line: string): boolean => {
  return /^[EBGDA]\|[-0-9/hpbs~x\(\)\s]+\|?\s*$/i.test(line.trim())
}

// Helper to check if a line is a tab section header
const isTabSectionHeader = (line: string): boolean => {
  const lower = line.toLowerCase()
  return /\[(tab|solo|riff|intro tab|tab -|dedilhado)/.test(lower) ||
         /\[.*tab.*\]/i.test(line)
}

// Colorize chords - detect chord patterns and wrap in orange span
const colorizedChords = computed(() => {
  if (!chordsContent.value) return ''

  // Process line by line to handle chord lines vs lyric lines differently
  const lines = chordsContent.value.split('\n')

  let inTabSection = false
  let tabSectionLines: string[] = []

  const colorizedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Escape HTML first
    let escapedLine = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Check if this starts a tab section
    if (isTabSectionHeader(line)) {
      inTabSection = true
    }

    // Check if this is a tablature line
    const lineIsTab = isTabLine(line)

    // Check if we're exiting a tab section (non-tab, non-empty line after tab lines)
    if (inTabSection && !lineIsTab && line.trim() !== '' && !isTabSectionHeader(line)) {
      // Check if this looks like a new section
      if (/^\[/.test(line.trim())) {
        inTabSection = false
      }
    }

    // If hiding tabs and this is a tab line or tab section header
    if (hideTabs.value && (lineIsTab || (inTabSection && isTabSectionHeader(line)))) {
      // Skip this line (don't add to output)
      continue
    }

    // Reset tab section if we hit a new non-tab section marker
    if (/^\[/.test(line.trim()) && !isTabSectionHeader(line)) {
      inTabSection = false
    }

    // Don't colorize tab lines
    if (lineIsTab) {
      colorizedLines.push(escapedLine)
      continue
    }

    // Check if line looks like lyrics (contains sequences of lowercase letters)
    const looksLikeLyrics = /[a-z]{3,}/.test(line)

    if (looksLikeLyrics) {
      // For lyric lines, only colorize chords with modifiers (Am, C7, F#m, etc.)
      const strictChordPattern = /\b([A-G][#b])(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b|\b([A-G])(m|M|dim|aug|sus|add|maj|min|2|4|5|6|7|9|11|13|7M)(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b/g
      escapedLine = escapedLine.replace(strictChordPattern, (match) => {
        return `<span class="text-orange-500 font-bold">${match}</span>`
      })
    } else {
      // For chord-only lines, colorize all chords including single letters
      const chordPattern = /\b([A-G][#b]?)(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b/g
      escapedLine = escapedLine.replace(chordPattern, (match) => {
        return `<span class="text-orange-500 font-bold">${match}</span>`
      })
    }

    // Color section markers like [Intro], [Verso], [Refrão]
    escapedLine = escapedLine.replace(/\[([^\]]+)\]/g, '<span class="text-blue-500 font-bold">[$1]</span>')

    colorizedLines.push(escapedLine)
  }

  return colorizedLines.join('\n')
})

const startEditing = () => {
  isEditing.value = true
  nextTick(() => {
    chordsTextarea.value?.focus()
  })
}

// Save form
const saveForm = ref({
  title: '',
  artist: '',
  tone: '',
  capo: null as number | null
})

// Debounce timer for auto-save
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

// Auto-save function
const autoSave = async () => {
  // Only auto-save if we have a title and content
  if (!saveForm.value.title.trim() || !chordsContent.value.trim()) return
  // Don't save while parsing
  if (isParsing.value) return

  isSaving.value = true

  try {
    const songData = {
      title: saveForm.value.title,
      artist: saveForm.value.artist,
      content: chordsContent.value,
      cifraClubUrl: cifraClubUrl.value,
      youtubeUrl: youtubeUrl.value,
      tone: saveForm.value.tone,
      capo: saveForm.value.capo,
      speed: speed.value,
      fontSize: fontSize.value,
      hideTabs: hideTabs.value
    }

    if (currentSong.value?.id) {
      // Update existing song
      await updateSong(currentSong.value.id, songData)
    } else {
      // Create new song
      const id = await createSong(songData)
      selectedSongId.value = id
      currentSong.value = { ...songData, id } as Song
    }

    await loadSongs()
  } finally {
    isSaving.value = false
  }
}

// Debounced auto-save (waits 1 second after last change)
const debouncedAutoSave = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    autoSave()
  }, 1000)
}

// Watch for changes that should trigger auto-save
watch([chordsContent, () => saveForm.value.title, () => saveForm.value.artist, youtubeUrl, cifraClubUrl, speed, fontSize, hideTabs], () => {
  // Only auto-save if we have a current song or valid title
  if (currentSong.value?.id || saveForm.value.title.trim()) {
    debouncedAutoSave()
  }
}, { deep: true })

// Local storage keys
const STORAGE_KEYS = {
  theme: 'cifra-app-theme',
  leftPanelWidth: 'cifra-app-left-panel-width',
  middlePanelWidth: 'cifra-app-middle-panel-width',
  chordsPanelWidth: 'cifra-app-chords-panel-width',
  lastSongId: 'cifra-app-last-song-id'
}

// Save UI preferences to localStorage
const saveUIPreferences = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.theme, isDark.value ? 'dark' : 'light')
  localStorage.setItem(STORAGE_KEYS.leftPanelWidth, leftPanelWidth.value.toString())
  if (middlePanelWidth.value !== null) {
    localStorage.setItem(STORAGE_KEYS.middlePanelWidth, middlePanelWidth.value.toString())
  }
  localStorage.setItem(STORAGE_KEYS.chordsPanelWidth, chordsPanelWidth.value.toString())
}

// Load UI preferences from localStorage
const loadUIPreferences = () => {
  if (typeof window === 'undefined') return

  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme)
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  }

  const savedLeftWidth = localStorage.getItem(STORAGE_KEYS.leftPanelWidth)
  if (savedLeftWidth) {
    leftPanelWidth.value = parseInt(savedLeftWidth, 10)
  }

  const savedMiddleWidth = localStorage.getItem(STORAGE_KEYS.middlePanelWidth)
  if (savedMiddleWidth) {
    middlePanelWidth.value = parseInt(savedMiddleWidth, 10)
  }

  const savedChordsWidth = localStorage.getItem(STORAGE_KEYS.chordsPanelWidth)
  if (savedChordsWidth) {
    chordsPanelWidth.value = parseInt(savedChordsWidth, 10)
  }
}

// Watch for UI preference changes and save them
watch([isDark, leftPanelWidth, middlePanelWidth, chordsPanelWidth], () => {
  saveUIPreferences()
})

// Watch for song changes and save last opened song
watch(selectedSongId, (newId) => {
  if (typeof window === 'undefined') return
  if (newId) {
    localStorage.setItem(STORAGE_KEYS.lastSongId, newId.toString())
  } else {
    localStorage.removeItem(STORAGE_KEYS.lastSongId)
  }
})

// Load songs and UI preferences on mount
onMounted(async () => {
  loadUIPreferences()
  await loadSongs()

  // Load last opened song
  const lastSongId = localStorage.getItem(STORAGE_KEYS.lastSongId)
  if (lastSongId) {
    const id = parseInt(lastSongId, 10)
    if (songs.value.some(s => s.id === id)) {
      selectedSongId.value = id
      await loadSong()
    }
  }
})

const loadSongs = async () => {
  songs.value = await getAllSongs()
}

const loadVideo = () => {
  const url = youtubeUrl.value.trim()
  if (!url) return

  if (url.includes('youtube.com/watch?v=')) {
    videoId.value = url.split('v=')[1].split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId.value = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    videoId.value = url.split('embed/')[1].split('?')[0]
  }
}

const parseCifra = async () => {
  const url = cifraClubUrl.value.trim()
  if (!url || !url.includes('cifraclub.com.br')) {
    alert('Por favor, insira uma URL válida do CifraClub')
    return
  }

  isParsing.value = true
  resetLoadingSteps()

  // Clear current song state while loading
  chordsContent.value = ''
  videoId.value = ''
  saveForm.value.title = ''
  saveForm.value.artist = ''
  saveForm.value.tone = ''
  saveForm.value.capo = null
  currentSong.value = null
  selectedSongId.value = null

  try {
    // Step 1: Fetching page
    setStepLoading(0)
    await new Promise(r => setTimeout(r, 100)) // Small delay to show the step

    const response = await $fetch('/api/parse-cifra', {
      query: { url }
    })

    setStepDone(0)

    if (response.success && response.data) {
      const data = response.data

      // Step 2: Extracting title and artist
      setStepLoading(1)
      await new Promise(r => setTimeout(r, 200))
      setStepDone(1)

      // Step 3: Processing cifra
      setStepLoading(2)
      await new Promise(r => setTimeout(r, 200))
      setStepDone(2)

      // Step 4: YouTube video (already done by API, just show it)
      setStepLoading(3)
      await new Promise(r => setTimeout(r, 200))
      setStepDone(3)

      // Step 5: Saving
      setStepLoading(4)

      // Check if song already exists
      const existingSong = await findByTitleAndArtist(data.title, data.artist)

      if (existingSong) {
        // Ask user what to do
        const action = confirm(
          `"${data.title}" de "${data.artist}" já existe na sua biblioteca.\n\n` +
          `Clique OK para atualizar a música existente.\n` +
          `Clique Cancelar para carregar a versão salva.`
        )

        if (action) {
          // Update existing song with new parse data
          currentSong.value = existingSong
          selectedSongId.value = existingSong.id!
          chordsContent.value = data.content
          saveForm.value.title = data.title
          saveForm.value.artist = data.artist
          saveForm.value.tone = data.tone || ''
          saveForm.value.capo = data.capo || null
          if (data.youtubeUrl) {
            youtubeUrl.value = data.youtubeUrl
          }
          // Keep existing hideTabs preference
          hideTabs.value = existingSong.hideTabs || false
          // Auto-save will trigger
        } else {
          // Load existing song
          currentSong.value = existingSong
          selectedSongId.value = existingSong.id!
          chordsContent.value = existingSong.content
          saveForm.value.title = existingSong.title
          saveForm.value.artist = existingSong.artist
          saveForm.value.tone = existingSong.tone || ''
          saveForm.value.capo = existingSong.capo || null
          speed.value = existingSong.speed
          fontSize.value = existingSong.fontSize
          hideTabs.value = existingSong.hideTabs || false
          cifraClubUrl.value = existingSong.cifraClubUrl || url
          if (existingSong.youtubeUrl) {
            youtubeUrl.value = existingSong.youtubeUrl
          }
        }
      } else {
        // New song - fill in the form
        chordsContent.value = data.content
        saveForm.value.title = data.title
        saveForm.value.artist = data.artist
        saveForm.value.tone = data.tone || ''
        saveForm.value.capo = data.capo || null
        currentSong.value = null
        selectedSongId.value = null
        hideTabs.value = false

        // Set YouTube URL
        if (data.youtubeUrl) {
          youtubeUrl.value = data.youtubeUrl
        }

        // Auto-save will create the new song
      }

      // Load video
      if (youtubeUrl.value) {
        const ytUrl = youtubeUrl.value
        if (ytUrl.includes('youtube.com/watch?v=')) {
          videoId.value = ytUrl.split('v=')[1].split('&')[0]
        } else if (ytUrl.includes('youtu.be/')) {
          videoId.value = ytUrl.split('youtu.be/')[1].split('?')[0]
        }
      }

      // Mark save as done
      setStepDone(4)
      await new Promise(r => setTimeout(r, 300)) // Brief pause to show completion
    }
  } catch (error: any) {
    alert(`Falha ao fazer parse: ${error.message || 'Erro desconhecido'}`)
  } finally {
    isParsing.value = false
  }
}

const loadSong = async () => {
  if (!selectedSongId.value) {
    currentSong.value = null
    return
  }

  const song = await getSong(selectedSongId.value)
  if (song) {
    currentSong.value = song
    chordsContent.value = song.content
    speed.value = song.speed
    fontSize.value = song.fontSize
    hideTabs.value = song.hideTabs || false
    cifraClubUrl.value = song.cifraClubUrl || ''
    if (song.youtubeUrl) {
      youtubeUrl.value = song.youtubeUrl
      loadVideo()
    }
    saveForm.value.title = song.title
    saveForm.value.artist = song.artist
    saveForm.value.tone = song.tone || ''
    saveForm.value.capo = song.capo || null
  }
}

const deleteSong = async () => {
  if (!currentSong.value?.id) return

  if (confirm(`Delete "${currentSong.value.title}"?`)) {
    await dbDeleteSong(currentSong.value.id)
    currentSong.value = null
    selectedSongId.value = null
    chordsContent.value = ''
    cifraClubUrl.value = ''
    youtubeUrl.value = ''
    videoId.value = ''
    saveForm.value.title = ''
    saveForm.value.artist = ''
    saveForm.value.tone = ''
    saveForm.value.capo = null
    await loadSongs()
  }
}

// Delete song by ID (from dropdown)
const deleteSongById = async (id: number) => {
  const song = songs.value.find(s => s.id === id)
  if (!song) return

  if (confirm(`Excluir "${song.title}"?`)) {
    await dbDeleteSong(id)

    // If deleting the currently selected song, clear the state
    if (currentSong.value?.id === id) {
      currentSong.value = null
      selectedSongId.value = null
      chordsContent.value = ''
      cifraClubUrl.value = ''
      youtubeUrl.value = ''
      videoId.value = ''
      saveForm.value.title = ''
      saveForm.value.artist = ''
      saveForm.value.tone = ''
      saveForm.value.capo = null
    }

    await loadSongs()
  }
}

// Select song from custom dropdown
const selectSong = async (id: number | null) => {
  selectedSongId.value = id
  showSongDropdown.value = false
  songSearchQuery.value = ''
  await loadSong()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
    showSongDropdown.value = false
    songSearchQuery.value = ''
  }
}

// Focus search input when dropdown opens
watch(showSongDropdown, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      songSearchInput.value?.focus()
    })
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleScroll = () => {
  if (isScrolling.value) {
    stopScroll()
  } else {
    startScroll()
  }
}

const startScroll = () => {
  // Use display div when not editing, textarea when editing
  const scrollElement = isEditing.value ? chordsTextarea.value : chordsDisplay.value
  if (!scrollElement) return

  isScrolling.value = true

  scrollInterval = setInterval(() => {
    scrollElement.scrollTop += 1

    if (scrollElement.scrollTop >= scrollElement.scrollHeight - scrollElement.clientHeight) {
      stopScroll()
    }
  }, 1000 / speed.value)
}

const stopScroll = () => {
  isScrolling.value = false
  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }
}

const changeSpeed = (delta: number) => {
  speed.value = Math.max(5, Math.min(200, speed.value + delta))

  if (isScrolling.value) {
    stopScroll()
    startScroll()
  }
}

const changeFontSize = (delta: number) => {
  fontSize.value = Math.max(10, Math.min(36, fontSize.value + delta))
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  // Could implement full theme toggle here
}

// Keyboard shortcut
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault()
      toggleScroll()
    }
  })
})
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
