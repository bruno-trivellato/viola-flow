import type { Song } from '~/composables/useDatabase'

export interface ImportRow {
  cifraUrl: string
  youtubeUrl: string
  status: 'pending' | 'loading' | 'done' | 'error' | 'exists'
  error?: string
  parsedData?: {
    title: string
    artist: string
    content: string
    tone: string
    capo: number | null
    youtubeUrl: string
  }
  existingSongId?: number
}

// Composable for batch import functionality
export const useImportBatch = (
  findByTitleAndArtist: (title: string, artist: string) => Promise<Song | null>,
  createSong: (song: Omit<Song, 'id'>) => Promise<number>,
  updateSong: (id: number, song: Partial<Song>) => Promise<void>,
  loadSongs: () => Promise<void>
) => {
  const showImportModal = ref(false)
  const isImporting = ref(false)
  const importRows = ref<ImportRow[]>([])
  const importProgress = ref({ current: 0, total: 0 })

  const validImportRows = computed(() => {
    return importRows.value.filter(row => row.cifraUrl.trim() && row.cifraUrl.includes('cifraclub.com.br'))
  })

  const addImportRow = () => {
    importRows.value.push({
      cifraUrl: '',
      youtubeUrl: '',
      status: 'pending'
    })
  }

  const removeImportRow = (index: number) => {
    importRows.value.splice(index, 1)
  }

  const clearImportRows = () => {
    importRows.value = []
  }

  const handleImportPaste = (event: ClipboardEvent) => {
    const pastedText = event.clipboardData?.getData('text') || ''
    if (!pastedText.trim()) return

    if (pastedText.includes('\n') || pastedText.includes('cifraclub.com.br')) {
      event.preventDefault()
    } else {
      return
    }

    const lines = pastedText.split('\n').filter(line => line.trim())

    for (const line of lines) {
      const parts = line.split(/\t+|\s{2,}/).map(p => p.trim()).filter(p => p)

      let cifraUrl = ''
      let youtubeUrl = ''

      for (const part of parts) {
        if (part.includes('cifraclub.com.br')) {
          cifraUrl = part
        } else if (part.includes('youtube.com') || part.includes('youtu.be')) {
          youtubeUrl = part
        }
      }

      if (cifraUrl) {
        importRows.value.push({
          cifraUrl,
          youtubeUrl,
          status: 'pending'
        })
      }
    }
  }

  const startBatchImport = async () => {
    const rowsToImport = validImportRows.value
    if (rowsToImport.length === 0) return

    isImporting.value = true
    importProgress.value = { current: 0, total: rowsToImport.length }

    for (let i = 0; i < importRows.value.length; i++) {
      const row = importRows.value[i]

      if (!row.cifraUrl.trim() || !row.cifraUrl.includes('cifraclub.com.br')) {
        continue
      }
      if (row.status === 'done' || row.status === 'exists') {
        continue
      }

      row.status = 'loading'
      importProgress.value.current++

      try {
        const response = await $fetch('/api/parse-cifra', {
          query: { url: row.cifraUrl }
        })

        if (response.success && response.data) {
          const data = response.data
          const finalYoutubeUrl = row.youtubeUrl.trim() || data.youtubeUrl

          const existingSong = await findByTitleAndArtist(data.title, data.artist)

          if (existingSong) {
            row.status = 'exists'
            row.parsedData = {
              title: data.title,
              artist: data.artist,
              content: data.content,
              tone: data.tone || '',
              capo: data.capo || null,
              youtubeUrl: finalYoutubeUrl
            }
            row.existingSongId = existingSong.id
          } else {
            const songData = {
              title: data.title,
              artist: data.artist,
              content: data.content,
              cifraClubUrl: row.cifraUrl,
              youtubeUrl: finalYoutubeUrl,
              tone: data.tone || '',
              capo: data.capo || null,
              speed: 30,
              fontSize: 16,
              hideTabs: false
            }
            await createSong(songData)
            row.status = 'done'
          }
        } else {
          row.status = 'error'
          row.error = 'Falha ao processar cifra'
        }
      } catch (error: any) {
        row.status = 'error'
        row.error = error.message || 'Erro desconhecido'
      }

      await new Promise(r => setTimeout(r, 500))
    }

    isImporting.value = false
    await loadSongs()

    const allDone = importRows.value.every(row =>
      row.status === 'done' || !row.cifraUrl.trim() || !row.cifraUrl.includes('cifraclub.com.br')
    )

    if (allDone) {
      setTimeout(() => {
        importRows.value = []
        showImportModal.value = false
      }, 1000)
    }
  }

  const overwriteExistingRow = async (index: number) => {
    const row = importRows.value[index]
    if (row.status !== 'exists' || !row.parsedData || !row.existingSongId) return

    row.status = 'loading'

    try {
      const songData = {
        title: row.parsedData.title,
        artist: row.parsedData.artist,
        content: row.parsedData.content,
        cifraClubUrl: row.cifraUrl,
        youtubeUrl: row.youtubeUrl.trim() || row.parsedData.youtubeUrl,
        tone: row.parsedData.tone,
        capo: row.parsedData.capo,
        speed: 30,
        fontSize: 16,
        hideTabs: false
      }

      await updateSong(row.existingSongId, songData)
      row.status = 'done'
      await loadSongs()

      const allDone = importRows.value.every(row =>
        row.status === 'done' || !row.cifraUrl.trim() || !row.cifraUrl.includes('cifraclub.com.br')
      )
      if (allDone) {
        setTimeout(() => {
          importRows.value = []
          showImportModal.value = false
        }, 1000)
      }
    } catch (error: any) {
      row.status = 'error'
      row.error = error.message || 'Erro ao sobrescrever'
    }
  }

  return {
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
  }
}
