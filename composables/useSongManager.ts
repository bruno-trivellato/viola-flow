import type { Song } from '~/composables/useDatabase'

// Composable for managing songs (CRUD, selection, auto-save)
export const useSongManager = () => {
  const { getAllSongs, getSong, createSong, updateSong, deleteSong: dbDeleteSong, findByTitleAndArtist } = useDatabase()

  const songs = ref<Song[]>([])
  const selectedSongId = ref<number | null>(null)
  const currentSong = ref<Song | null>(null)
  const isSaving = ref(false)
  const isParsing = ref(false)

  // Form data
  const chordsContent = ref('')
  const cifraClubUrl = ref('')
  const youtubeUrl = ref('')
  const speed = ref(30)
  const fontSize = ref(16)
  const hideTabs = ref(false)
  const saveForm = ref({
    title: '',
    artist: '',
    tone: '',
    capo: null as number | null
  })

  // Loading steps for parse modal
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

  // Debounce timer for auto-save
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

  const loadSongs = async () => {
    songs.value = await getAllSongs()
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
      youtubeUrl.value = song.youtubeUrl || ''
      saveForm.value.title = song.title
      saveForm.value.artist = song.artist
      saveForm.value.tone = song.tone || ''
      saveForm.value.capo = song.capo || null
    }
  }

  const selectSong = async (id: number | null) => {
    selectedSongId.value = id
    await loadSong()
  }

  const autoSave = async () => {
    if (!saveForm.value.title.trim() || !chordsContent.value.trim()) return
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
        await updateSong(currentSong.value.id, songData)
      } else {
        const id = await createSong(songData)
        selectedSongId.value = id
        currentSong.value = { ...songData, id } as Song
      }

      await loadSongs()
    } finally {
      isSaving.value = false
    }
  }

  const debouncedAutoSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(() => {
      autoSave()
    }, 1000)
  }

  const deleteSongById = async (id: number) => {
    const song = songs.value.find(s => s.id === id)
    if (!song) return

    if (confirm(`Excluir "${song.title}"?`)) {
      await dbDeleteSong(id)

      if (currentSong.value?.id === id) {
        clearCurrentSong()
      }

      await loadSongs()
    }
  }

  const clearCurrentSong = () => {
    currentSong.value = null
    selectedSongId.value = null
    chordsContent.value = ''
    cifraClubUrl.value = ''
    youtubeUrl.value = ''
    saveForm.value.title = ''
    saveForm.value.artist = ''
    saveForm.value.tone = ''
    saveForm.value.capo = null
  }

  const parseCifra = async () => {
    const url = cifraClubUrl.value.trim()
    if (!url || !url.includes('cifraclub.com.br')) {
      alert('Por favor, insira uma URL válida do CifraClub')
      return
    }

    isParsing.value = true
    resetLoadingSteps()
    clearCurrentSong()
    cifraClubUrl.value = url

    try {
      setStepLoading(0)
      await new Promise(r => setTimeout(r, 100))

      const response = await $fetch('/api/parse-cifra', {
        query: { url }
      })

      setStepDone(0)

      if (response.success && response.data) {
        const data = response.data

        setStepLoading(1)
        await new Promise(r => setTimeout(r, 200))
        setStepDone(1)

        setStepLoading(2)
        await new Promise(r => setTimeout(r, 200))
        setStepDone(2)

        setStepLoading(3)
        await new Promise(r => setTimeout(r, 200))
        setStepDone(3)

        setStepLoading(4)

        const existingSong = await findByTitleAndArtist(data.title, data.artist)

        if (existingSong) {
          const action = confirm(
            `"${data.title}" de "${data.artist}" já existe na sua biblioteca.\n\n` +
            `Clique OK para atualizar a música existente.\n` +
            `Clique Cancelar para carregar a versão salva.`
          )

          if (action) {
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
            hideTabs.value = existingSong.hideTabs || false
          } else {
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
          chordsContent.value = data.content
          saveForm.value.title = data.title
          saveForm.value.artist = data.artist
          saveForm.value.tone = data.tone || ''
          saveForm.value.capo = data.capo || null
          hideTabs.value = false

          if (data.youtubeUrl) {
            youtubeUrl.value = data.youtubeUrl
          }
        }

        setStepDone(4)
        await new Promise(r => setTimeout(r, 300))
      }
    } catch (error: any) {
      alert(`Falha ao fazer parse: ${error.message || 'Erro desconhecido'}`)
    } finally {
      isParsing.value = false
    }
  }

  // Watch for changes that should trigger auto-save
  watch([chordsContent, () => saveForm.value.title, () => saveForm.value.artist, youtubeUrl, cifraClubUrl, speed, fontSize, hideTabs], () => {
    if (currentSong.value?.id || saveForm.value.title.trim()) {
      debouncedAutoSave()
    }
  }, { deep: true })

  return {
    // State
    songs,
    selectedSongId,
    currentSong,
    isSaving,
    isParsing,
    chordsContent,
    cifraClubUrl,
    youtubeUrl,
    speed,
    fontSize,
    hideTabs,
    saveForm,
    loadingSteps,
    // Methods
    loadSongs,
    loadSong,
    selectSong,
    deleteSongById,
    clearCurrentSong,
    parseCifra,
    findByTitleAndArtist,
    createSong,
    updateSong
  }
}
