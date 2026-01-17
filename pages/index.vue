<template>
  <div class="h-screen p-3 transition-colors duration-200" :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'">
    <!-- Loading Modal -->
    <LoadingModal
      :show="isParsing"
      :isDark="isDark"
      :steps="loadingSteps"
    />

    <!-- Import Modal -->
    <ImportModal
      :show="showImportModal"
      :isDark="isDark"
      :rows="importRows"
      :isImporting="isImporting"
      :progress="importProgress"
      :validCount="validImportRows.length"
      @close="showImportModal = false"
      @paste="handleImportPaste"
      @add="addImportRow"
      @remove="removeImportRow"
      @clear="clearImportRows"
      @import="startBatchImport"
      @overwrite="overwriteExistingRow"
    />

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

        <!-- Song Selector -->
        <SongSelector
          :songs="songs"
          :selectedId="selectedSongId"
          :isDark="isDark"
          @select="selectSong"
          @delete="deleteSongById"
        />

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

        <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">YouTube:</label>
        <input
          v-model="youtubeUrl"
          type="text"
          placeholder="Cole a URL e pressione Enter"
          class="flex-1 min-w-[150px] px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500"
          :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
          @keyup.enter="loadVideo"
        />

        <!-- Settings Menu -->
        <SettingsMenu :isDark="isDark" @openImport="showImportModal = true" />
      </div>

      <!-- Main Content -->
      <div ref="mainContainer" class="flex flex-1 overflow-hidden">
        <!-- Controls Panel -->
        <ControlsPanel
          :width="leftPanelWidth"
          :isDark="isDark"
          :isScrolling="isScrolling"
          :speed="speed"
          :hideTabs="hideTabs"
          @toggleScroll="toggleScroll(isEditing ? chordsTextarea : chordsDisplay)"
          @changeSpeed="(delta) => changeSpeed(delta, isEditing ? chordsTextarea : chordsDisplay)"
          @changeFontSize="changeFontSize"
          @toggleTheme="toggleTheme"
          @update:hideTabs="hideTabs = $event"
        />

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
            @dblclick="startEditing"
            class="flex-1 p-5 font-mono overflow-auto cursor-default transition-colors duration-200 whitespace-pre"
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

        <!-- Detected Chords Panel -->
        <ChordsPanel
          :show="showChordsPanel"
          :width="chordsPanelWidth"
          :chords="detectedChords"
          :isDark="isDark"
          @open="showChordsPanel = true"
          @close="showChordsPanel = false"
        />

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
const { extractChords } = useChordDiagram()

// UI Preferences
const {
  isDark,
  leftPanelWidth,
  middlePanelWidth,
  chordsPanelWidth,
  loadPreferences,
  getLastSongId,
  setLastSongId,
  toggleTheme
} = useUIPreferences()

// Song Manager
const {
  songs,
  selectedSongId,
  currentSong,
  isParsing,
  chordsContent,
  cifraClubUrl,
  youtubeUrl,
  speed,
  fontSize,
  hideTabs,
  saveForm,
  loadingSteps,
  loadSongs,
  selectSong,
  deleteSongById,
  parseCifra,
  findByTitleAndArtist,
  createSong,
  updateSong
} = useSongManager()

// Auto Scroll
const {
  isScrolling,
  toggleScroll,
  changeSpeed
} = useAutoScroll()

// Panel Resize
const { middlePanel, startResize } = usePanelResize(leftPanelWidth, middlePanelWidth, chordsPanelWidth)

// Import Batch
const {
  showImportModal,
  isImporting,
  importRows,
  importProgress,
  validImportRows,
  addImportRow,
  removeImportRow,
  clearImportRows,
  handleImportPaste,
  startBatchImport,
  overwriteExistingRow
} = useImportBatch(findByTitleAndArtist, createSong, updateSong, loadSongs)

// Local state
const videoId = ref('')
const isEditing = ref(false)
const showChordsPanel = ref(true)
const chordsTextarea = ref<HTMLTextAreaElement | null>(null)
const chordsDisplay = ref<HTMLDivElement | null>(null)
const mainContainer = ref<HTMLDivElement | null>(null)

// Detected chords from the cifra
const detectedChords = computed(() => {
  return extractChords(chordsContent.value)
})

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

  const lines = chordsContent.value.split('\n')
  let inTabSection = false
  const colorizedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    let escapedLine = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (isTabSectionHeader(line)) {
      inTabSection = true
    }

    const lineIsTab = isTabLine(line)

    if (inTabSection && !lineIsTab && line.trim() !== '' && !isTabSectionHeader(line)) {
      if (/^\[/.test(line.trim())) {
        inTabSection = false
      }
    }

    if (hideTabs.value && (lineIsTab || (inTabSection && isTabSectionHeader(line)))) {
      continue
    }

    if (/^\[/.test(line.trim()) && !isTabSectionHeader(line)) {
      inTabSection = false
    }

    if (lineIsTab) {
      colorizedLines.push(escapedLine)
      continue
    }

    const looksLikeLyrics = /[a-z]{3,}/.test(line)

    if (looksLikeLyrics) {
      const strictChordPattern = /\b([A-G][#b])(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b|\b([A-G])(m|M|dim|aug|sus|add|maj|min|2|4|5|6|7|9|11|13|7M)(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b/g
      escapedLine = escapedLine.replace(strictChordPattern, (match) => {
        return `<span class="text-orange-500 font-bold">${match}</span>`
      })
    } else {
      const chordPattern = /\b([A-G][#b]?)(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b/g
      escapedLine = escapedLine.replace(chordPattern, (match) => {
        return `<span class="text-orange-500 font-bold">${match}</span>`
      })
    }

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

const changeFontSize = (delta: number) => {
  fontSize.value = Math.max(10, Math.min(36, fontSize.value + delta))
}

// Watch for song changes and save last opened song
watch(selectedSongId, (newId) => {
  setLastSongId(newId)
})

// Watch youtubeUrl to auto-load video
watch(youtubeUrl, () => {
  if (youtubeUrl.value) {
    loadVideo()
  }
})

// Load on mount
onMounted(async () => {
  loadPreferences()
  await loadSongs()

  const lastSongId = getLastSongId()
  if (lastSongId && songs.value.some(s => s.id === lastSongId)) {
    selectSong(lastSongId)
  }

  // Keyboard shortcut
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault()
      toggleScroll(isEditing.value ? chordsTextarea.value : chordsDisplay.value)
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
