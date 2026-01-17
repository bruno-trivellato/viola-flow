import Database from 'better-sqlite3'
import { join } from 'path'

// Database file in project root
const dbPath = join(process.cwd(), 'viola-flow.db')

// Create and configure database
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    content TEXT NOT NULL,
    cifraClubUrl TEXT,
    youtubeUrl TEXT,
    tone TEXT,
    capo INTEGER,
    speed INTEGER DEFAULT 30,
    fontSize INTEGER DEFAULT 16,
    hideTabs INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`)

// Create index for faster lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_songs_title_artist ON songs(title, artist)
`)

export interface Song {
  id?: number
  title: string
  artist: string
  content: string
  cifraClubUrl?: string
  youtubeUrl?: string
  tone?: string
  capo?: number
  speed: number
  fontSize: number
  hideTabs?: boolean
  createdAt?: string
  updatedAt?: string
}

// Prepared statements for better performance
const statements = {
  getAll: db.prepare('SELECT * FROM songs ORDER BY updatedAt DESC'),
  getById: db.prepare('SELECT * FROM songs WHERE id = ?'),
  findByTitleAndArtist: db.prepare('SELECT * FROM songs WHERE title = ? AND artist = ?'),
  insert: db.prepare(`
    INSERT INTO songs (title, artist, content, cifraClubUrl, youtubeUrl, tone, capo, speed, fontSize, hideTabs)
    VALUES (@title, @artist, @content, @cifraClubUrl, @youtubeUrl, @tone, @capo, @speed, @fontSize, @hideTabs)
  `),
  update: db.prepare(`
    UPDATE songs SET
      title = @title,
      artist = @artist,
      content = @content,
      cifraClubUrl = @cifraClubUrl,
      youtubeUrl = @youtubeUrl,
      tone = @tone,
      capo = @capo,
      speed = @speed,
      fontSize = @fontSize,
      hideTabs = @hideTabs,
      updatedAt = datetime('now')
    WHERE id = @id
  `),
  delete: db.prepare('DELETE FROM songs WHERE id = ?')
}

// Convert boolean to integer for SQLite
const toDbSong = (song: Partial<Song>) => ({
  ...song,
  hideTabs: song.hideTabs ? 1 : 0
})

// Convert integer to boolean from SQLite
const fromDbSong = (row: any): Song | null => {
  if (!row) return null
  return {
    ...row,
    hideTabs: row.hideTabs === 1
  }
}

export const songDb = {
  getAll(): Song[] {
    const rows = statements.getAll.all()
    return rows.map(fromDbSong).filter((s): s is Song => s !== null)
  },

  getById(id: number): Song | null {
    const row = statements.getById.get(id)
    return fromDbSong(row)
  },

  findByTitleAndArtist(title: string, artist: string): Song | null {
    const row = statements.findByTitleAndArtist.get(title, artist)
    return fromDbSong(row)
  },

  create(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): number {
    const result = statements.insert.run(toDbSong(song))
    return result.lastInsertRowid as number
  },

  update(id: number, song: Partial<Song>): boolean {
    const existing = this.getById(id)
    if (!existing) return false

    const updated = { ...existing, ...song, id }
    statements.update.run(toDbSong(updated))
    return true
  },

  delete(id: number): boolean {
    const result = statements.delete.run(id)
    return result.changes > 0
  }
}

export default db
