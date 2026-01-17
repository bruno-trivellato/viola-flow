import { songDb } from '../../utils/database'

export default defineEventHandler(() => {
  return songDb.getAll()
})
