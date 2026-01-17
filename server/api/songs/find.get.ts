import { songDb } from '../../utils/database'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const title = query.title as string
  const artist = query.artist as string

  if (!title || !artist) {
    throw createError({
      statusCode: 400,
      message: 'title and artist are required'
    })
  }

  const song = songDb.findByTitleAndArtist(title, artist)
  return song || null
})
