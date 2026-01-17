import { songDb } from '../../utils/database'

export default defineEventHandler((event) => {
  const id = parseInt(event.context.params?.id || '0')
  const success = songDb.delete(id)

  if (!success) {
    throw createError({
      statusCode: 404,
      message: 'Song not found'
    })
  }

  return { success: true }
})
