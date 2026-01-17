import { songDb } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const song = {
    title: body.title,
    artist: body.artist,
    content: body.content,
    cifraClubUrl: body.cifraClubUrl || null,
    youtubeUrl: body.youtubeUrl || null,
    tone: body.tone || null,
    capo: body.capo || null,
    speed: body.speed || 30,
    fontSize: body.fontSize || 16,
    hideTabs: body.hideTabs || false
  }

  const id = songDb.create(song)
  return { id, ...song }
})
