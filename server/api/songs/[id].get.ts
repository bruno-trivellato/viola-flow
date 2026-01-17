import { songDb } from '../../utils/database'

export default defineEventHandler((event) => {
  const id = parseInt(event.context.params?.id || '0')
  const song = songDb.getById(id)

  if (!song) {
    throw createError({
      statusCode: 404,
      message: 'Song not found'
    })
  }

  return song
})
