import { songDb } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')
  const body = await readBody(event)

  const success = songDb.update(id, body)

  if (!success) {
    throw createError({
      statusCode: 404,
      message: 'Song not found'
    })
  }

  return songDb.getById(id)
})
