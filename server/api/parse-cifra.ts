// Decode HTML entities in a string
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url || !url.includes('cifraclub.com.br')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid CifraClub URL'
    })
  }

  try {
    // Fetch the page with realistic browser headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Extract title from h1.t1
    const titleMatch = html.match(/<h1 class="t1">([^<]+)<\/h1>/)
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : ''

    // Extract artist from h2.t3
    const artistMatch = html.match(/<h2 class="t3">[^>]*>([^<]+)<\/a><\/h2>/)
    const artist = artistMatch ? decodeHtmlEntities(artistMatch[1].trim()) : ''

    // Extract tone (Tom: Bb)
    // HTML: <span id="cifra_tom">Tom: <a class="js-modal-trigger" href="#" title="alterar o tom">Bb</a>
    // Try multiple patterns since the HTML structure may vary
    let tone = ''
    const tonePatterns = [
      /id="cifra_tom"[^>]*>\s*Tom:\s*<a[^>]*>([A-G][#b]?m?)<\/a>/i,
      /<span[^>]*id="cifra_tom"[^>]*>Tom:\s*<a[^>]*>([A-G][#b]?m?)<\/a>/i,
      /cifra_tom[^>]*>Tom:\s*<a[^>]*>([A-G][#b]?m?)/i
    ]
    for (const pattern of tonePatterns) {
      const match = html.match(pattern)
      if (match) {
        tone = match[1].trim()
        break
      }
    }

    // Extract capo (Capotraste na 3ª casa)
    const capoMatch = html.match(/id="cifra_capo"[^>]*>[\s\S]*?Capotraste na\s*<a[^>]*>(\d+)ª?\s*casa<\/a>/)
    const capo = capoMatch ? parseInt(capoMatch[1], 10) : null

    // Extract the cifra content from <pre> inside .cifra_cnt
    const preMatch = html.match(/<div class="cifra_cnt[^"]*"[^>]*>[\s\S]*?<pre>([\s\S]*?)<\/pre>/)
    let cifraHtml = preMatch ? preMatch[1] : ''

    // Clean up the cifra:
    // 1. Remove tablatura sections (optional - we'll keep them but mark them)
    // 2. Convert <b> tags to just the chord text
    // 3. Remove other HTML tags but keep structure

    let cifraText = cifraHtml
      // Remove tablatura spans (keep the content but strip the span)
      .replace(/<span class="tablatura">([\s\S]*?)<\/span>/g, (_, content) => {
        // Extract just the tab content
        return content.replace(/<span class="cnt">([\s\S]*?)<\/span>/g, '$1')
      })
      // Convert <b> tags to just text (chords)
      .replace(/<b>([^<]*)<\/b>/g, '$1')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')

    // Decode HTML entities
    cifraText = decodeHtmlEntities(cifraText)
      // Clean up extra whitespace but preserve line structure
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .trim()

    // Extract YouTube video ID - CifraClub loads videos dynamically via YouTube API
    // We'll search YouTube for the song using title + artist
    let youtubeId = ''
    let youtubeUrl = ''

    // Try to get video from YouTube Search API
    if (title && artist) {
      try {
        const searchQuery = encodeURIComponent(`${title} ${artist}`)
        const apiKey = 'AIzaSyD2I8uP0YAQbvdfovfJrBhJN48fh468rJw' // Same key CifraClub uses
        const ytResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${searchQuery}&type=video&key=${apiKey}`
        )

        if (ytResponse.ok) {
          const ytData = await ytResponse.json()
          if (ytData.items && ytData.items.length > 0) {
            youtubeId = ytData.items[0].id.videoId
            youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`
          }
        }
      } catch (ytError) {
        console.log('[parse-cifra] YouTube API error:', ytError)
      }
    }

    console.log('[parse-cifra] Extracted data:', { title, artist, tone, capo, youtubeId, youtubeUrl })

    return {
      success: true,
      data: {
        title,
        artist,
        tone,
        capo,
        content: cifraText,
        youtubeUrl,
        cifraClubUrl: url
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to parse cifra'
    })
  }
})
