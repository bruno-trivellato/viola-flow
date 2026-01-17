import Dexie, { type EntityTable } from 'dexie'

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
  createdAt: Date
  updatedAt: Date
}

// Create the database
const db = new Dexie('ChordsAutoscrollDB') as Dexie & {
  songs: EntityTable<Song, 'id'>
}

// Define schema - version 2 adds hideTabs field
db.version(1).stores({
  songs: '++id, title, artist, createdAt, updatedAt'
})

db.version(2).stores({
  songs: '++id, title, artist, createdAt, updatedAt'
  // hideTabs is not indexed, just stored
})

db.version(3).stores({
  songs: '++id, title, artist, createdAt, updatedAt'
  // tone and capo are not indexed, just stored
})

export function useDatabase() {
  // Get all songs
  const getAllSongs = async (): Promise<Song[]> => {
    return await db.songs.orderBy('updatedAt').reverse().toArray()
  }

  // Get a single song by ID
  const getSong = async (id: number): Promise<Song | undefined> => {
    return await db.songs.get(id)
  }

  // Create a new song
  const createSong = async (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const now = new Date()
    return await db.songs.add({
      ...song,
      createdAt: now,
      updatedAt: now
    })
  }

  // Update an existing song
  const updateSong = async (id: number, updates: Partial<Song>): Promise<void> => {
    await db.songs.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  // Delete a song
  const deleteSong = async (id: number): Promise<void> => {
    await db.songs.delete(id)
  }

  // Search songs by title or artist
  const searchSongs = async (query: string): Promise<Song[]> => {
    const lowerQuery = query.toLowerCase()
    return await db.songs
      .filter(song =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery)
      )
      .toArray()
  }

  // Find song by exact title and artist match
  const findByTitleAndArtist = async (title: string, artist: string): Promise<Song | undefined> => {
    const lowerTitle = title.toLowerCase().trim()
    const lowerArtist = artist.toLowerCase().trim()
    return await db.songs
      .filter(song =>
        song.title.toLowerCase().trim() === lowerTitle &&
        song.artist.toLowerCase().trim() === lowerArtist
      )
      .first()
  }

  return {
    db,
    getAllSongs,
    getSong,
    createSong,
    updateSong,
    deleteSong,
    searchSongs,
    findByTitleAndArtist
  }
}
