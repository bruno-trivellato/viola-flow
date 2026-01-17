// Define the Song interface
export interface Song {
  id?: number
  title: string
  artist: string
  content: string           // A cifra em si
  cifraClubUrl?: string     // Link do CifraClub de onde veio a cifra
  youtubeUrl?: string       // Link do vídeo no YouTube
  tone?: string             // Tom da música (ex: "Bb", "G")
  capo?: number | null      // Capotraste (ex: 3 = 3ª casa)
  speed: number
  fontSize: number
  hideTabs?: boolean        // Esconder seções de tablatura
  createdAt?: string
  updatedAt?: string
}

export function useDatabase() {
  // Get all songs
  const getAllSongs = async (): Promise<Song[]> => {
    const data = await $fetch<Song[]>('/api/songs')
    return data
  }

  // Get a single song by ID
  const getSong = async (id: number): Promise<Song | undefined> => {
    try {
      const data = await $fetch<Song>(`/api/songs/${id}`)
      return data
    } catch {
      return undefined
    }
  }

  // Create a new song
  const createSong = async (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const data = await $fetch<Song>('/api/songs', {
      method: 'POST',
      body: song
    })
    return data.id!
  }

  // Update an existing song
  const updateSong = async (id: number, updates: Partial<Song>): Promise<void> => {
    await $fetch(`/api/songs/${id}`, {
      method: 'PUT',
      body: updates
    })
  }

  // Delete a song
  const deleteSong = async (id: number): Promise<void> => {
    await $fetch(`/api/songs/${id}`, {
      method: 'DELETE'
    })
  }

  // Search songs by title or artist (client-side filter for now)
  const searchSongs = async (query: string): Promise<Song[]> => {
    const songs = await getAllSongs()
    const lowerQuery = query.toLowerCase()
    return songs.filter(song =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery)
    )
  }

  // Find song by exact title and artist match
  const findByTitleAndArtist = async (title: string, artist: string): Promise<Song | undefined> => {
    const data = await $fetch<Song | null>('/api/songs/find', {
      query: { title, artist }
    })
    return data || undefined
  }

  return {
    getAllSongs,
    getSong,
    createSong,
    updateSong,
    deleteSong,
    searchSongs,
    findByTitleAndArtist
  }
}
