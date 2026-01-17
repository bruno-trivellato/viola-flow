// Composable for managing UI preferences in localStorage
export const useUIPreferences = () => {
  const STORAGE_KEYS = {
    theme: 'cifra-app-theme',
    leftPanelWidth: 'cifra-app-left-panel-width',
    middlePanelWidth: 'cifra-app-middle-panel-width',
    chordsPanelWidth: 'cifra-app-chords-panel-width',
    lastSongId: 'cifra-app-last-song-id'
  }

  const isDark = ref(false)
  const leftPanelWidth = ref(80)
  const middlePanelWidth = ref<number | null>(null)
  const chordsPanelWidth = ref(192)

  const savePreferences = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.theme, isDark.value ? 'dark' : 'light')
    localStorage.setItem(STORAGE_KEYS.leftPanelWidth, leftPanelWidth.value.toString())
    if (middlePanelWidth.value !== null) {
      localStorage.setItem(STORAGE_KEYS.middlePanelWidth, middlePanelWidth.value.toString())
    }
    localStorage.setItem(STORAGE_KEYS.chordsPanelWidth, chordsPanelWidth.value.toString())
  }

  const loadPreferences = () => {
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

  const getLastSongId = (): number | null => {
    if (typeof window === 'undefined') return null
    const lastSongId = localStorage.getItem(STORAGE_KEYS.lastSongId)
    return lastSongId ? parseInt(lastSongId, 10) : null
  }

  const setLastSongId = (id: number | null) => {
    if (typeof window === 'undefined') return
    if (id) {
      localStorage.setItem(STORAGE_KEYS.lastSongId, id.toString())
    } else {
      localStorage.removeItem(STORAGE_KEYS.lastSongId)
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // Auto-save preferences when they change
  watch([isDark, leftPanelWidth, middlePanelWidth, chordsPanelWidth], () => {
    savePreferences()
  })

  return {
    isDark,
    leftPanelWidth,
    middlePanelWidth,
    chordsPanelWidth,
    loadPreferences,
    savePreferences,
    getLastSongId,
    setLastSongId,
    toggleTheme
  }
}
