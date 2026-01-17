// Chord diagram data and SVG generator

export interface ChordPosition {
  frets: (number | 'x' | 0)[]  // 6 strings: E A D G B e (0 = open, x = muted)
  fingers?: (number | 0)[]     // Which finger to use (1-4, 0 = none)
  barres?: { fret: number; fromString: number; toString: number }[]
  baseFret?: number            // Starting fret (for chords higher up the neck)
}

// Database of common chord shapes
const chordDatabase: Record<string, ChordPosition> = {
  // Major chords
  'A': { frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'B': { frets: ['x', 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  'C': { frets: ['x', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D': { frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },

  // Minor chords
  'Am': { frets: ['x', 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'Bm': { frets: ['x', 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  'Cm': { frets: ['x', 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 3, fromString: 1, toString: 5 }], baseFret: 3 },
  'Dm': { frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'Fm': { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  'Gm': { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 3, fromString: 0, toString: 5 }], baseFret: 3 },

  // 7th chords
  'A7': { frets: ['x', 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
  'B7': { frets: ['x', 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  'C7': { frets: ['x', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'D7': { frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'E7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'F7': { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },

  // Major 7th chords
  'A7M': { frets: ['x', 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  'C7M': { frets: ['x', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'D7M': { frets: ['x', 'x', 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1] },
  'E7M': { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  'F7M': { frets: [1, 'x', 2, 2, 1, 0], fingers: [1, 0, 3, 4, 2, 0] },
  'G7M': { frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },

  // Minor 7th chords
  'Am7': { frets: ['x', 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'Bm7': { frets: ['x', 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  'Cm7': { frets: ['x', 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 3, fromString: 1, toString: 5 }], baseFret: 3 },
  'Dm7': { frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  'Em7': { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
  'Fm7': { frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  'Gm7': { frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 3, fromString: 0, toString: 5 }], baseFret: 3 },

  // Sus chords
  'Asus4': { frets: ['x', 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Asus2': { frets: ['x', 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
  'Dsus4': { frets: ['x', 'x', 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  'Dsus2': { frets: ['x', 'x', 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
  'Esus4': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0] },

  // Add chords
  'Cadd9': { frets: ['x', 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
  'Gadd9': { frets: [3, 2, 0, 2, 0, 3], fingers: [2, 1, 0, 3, 0, 4] },
  'Dadd9': { frets: ['x', 'x', 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
  'Aadd9': { frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Eadd9': { frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4] },

  // 9 chords (dominant 9th - different from add9)
  'C9': { frets: ['x', 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 3] },
  'G9': { frets: [3, 2, 0, 2, 0, 1], fingers: [3, 2, 0, 4, 0, 1] },
  'D9': { frets: ['x', 'x', 0, 2, 1, 0], fingers: [0, 0, 0, 2, 1, 0] },
  'A9': { frets: ['x', 0, 2, 4, 2, 3], fingers: [0, 0, 1, 3, 1, 2] },
  'E9': { frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
  'F9': { frets: [1, 0, 1, 2, 1, 'x'], fingers: [1, 0, 2, 4, 3, 0] },
  'B9': { frets: ['x', 2, 1, 2, 2, 2], fingers: [0, 2, 1, 3, 3, 4] },

  // Sharp/Flat variations
  'A#': { frets: ['x', 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }] },
  'Bb': { frets: ['x', 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }] },
  'C#': { frets: ['x', 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'Db': { frets: ['x', 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'D#': { frets: ['x', 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'Eb': { frets: ['x', 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'F#': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }] },
  'Gb': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }] },
  'G#': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Ab': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },

  // Sharp/Flat minors
  'A#m': { frets: ['x', 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }] },
  'Bbm': { frets: ['x', 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }] },
  'C#m': { frets: ['x', 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'Dbm': { frets: ['x', 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'D#m': { frets: ['x', 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'Ebm': { frets: ['x', 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'F#m': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }] },
  'Gbm': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }] },
  'G#m': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Abm': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },

  // Additional 7th variations
  'F#m7': { frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }] },
  'G#m7': { frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'C#m7': { frets: ['x', 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },

  // Dim chords
  'Adim': { frets: ['x', 0, 1, 2, 1, 'x'], fingers: [0, 0, 1, 3, 2, 0] },
  'Bdim': { frets: ['x', 2, 3, 4, 3, 'x'], fingers: [0, 1, 2, 4, 3, 0] },
  'Cdim': { frets: ['x', 3, 4, 5, 4, 'x'], fingers: [0, 1, 2, 4, 3, 0], baseFret: 3 },
  'Ddim': { frets: ['x', 'x', 0, 1, 0, 1], fingers: [0, 0, 0, 1, 0, 2] },
  'Edim': { frets: [0, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0] },

  // Aug chords
  'Caug': { frets: ['x', 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  'Eaug': { frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  'Gaug': { frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4] },

  // 4 chords (sus4 alternative notation)
  'A4': { frets: ['x', 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'D4': { frets: ['x', 'x', 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  'E4': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0] },
  'G4': { frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },

  // Power chords (5)
  'A5': { frets: ['x', 0, 2, 2, 'x', 'x'], fingers: [0, 0, 1, 2, 0, 0] },
  'B5': { frets: ['x', 2, 4, 4, 'x', 'x'], fingers: [0, 1, 3, 4, 0, 0] },
  'C5': { frets: ['x', 3, 5, 5, 'x', 'x'], fingers: [0, 1, 3, 4, 0, 0] },
  'D5': { frets: ['x', 'x', 0, 2, 3, 'x'], fingers: [0, 0, 0, 1, 2, 0] },
  'E5': { frets: [0, 2, 2, 'x', 'x', 'x'], fingers: [0, 1, 2, 0, 0, 0] },
  'F5': { frets: [1, 3, 3, 'x', 'x', 'x'], fingers: [1, 3, 4, 0, 0, 0] },
  'G5': { frets: [3, 5, 5, 'x', 'x', 'x'], fingers: [1, 3, 4, 0, 0, 0] },
}

export function useChordDiagram() {

  const getChordData = (chordName: string): ChordPosition | null => {
    // Normalize chord name variations
    const normalized = chordName
      .replace('maj7', '7M')
      .replace('Maj7', '7M')
      .replace('sus', 'sus')

    return chordDatabase[normalized] || null
  }

  const generateChordSVG = (chordName: string, isDark: boolean = false): string => {
    const chord = getChordData(chordName)

    if (!chord) {
      // Return a placeholder for unknown chords
      return `
        <svg viewBox="0 0 80 100" class="chord-diagram">
          <text x="40" y="15" text-anchor="middle" font-size="12" font-weight="bold" fill="${isDark ? '#fff' : '#333'}">${chordName}</text>
          <text x="40" y="60" text-anchor="middle" font-size="10" fill="${isDark ? '#888' : '#999'}">?</text>
        </svg>
      `
    }

    const stringSpacing = 12
    const fretSpacing = 16
    const startX = 10
    const startY = 30
    const numFrets = 5

    const strokeColor = isDark ? '#888' : '#333'
    const textColor = isDark ? '#fff' : '#333'
    const dotColor = isDark ? '#fff' : '#333'
    const openColor = isDark ? '#888' : '#666'

    let svg = `<svg viewBox="0 0 80 110" class="chord-diagram">`

    // Chord name
    svg += `<text x="40" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="${textColor}">${chordName}</text>`

    // Base fret indicator
    if (chord.baseFret && chord.baseFret > 1) {
      svg += `<text x="2" y="${startY + fretSpacing}" font-size="9" fill="${textColor}">${chord.baseFret}a</text>`
    }

    // Nut (thick line at top if no baseFret or baseFret is 1)
    if (!chord.baseFret || chord.baseFret === 1) {
      svg += `<rect x="${startX}" y="${startY - 2}" width="${stringSpacing * 5}" height="4" fill="${strokeColor}"/>`
    }

    // Frets (horizontal lines)
    for (let i = 0; i <= numFrets; i++) {
      svg += `<line x1="${startX}" y1="${startY + i * fretSpacing}" x2="${startX + stringSpacing * 5}" y2="${startY + i * fretSpacing}" stroke="${strokeColor}" stroke-width="1"/>`
    }

    // Strings (vertical lines)
    for (let i = 0; i < 6; i++) {
      svg += `<line x1="${startX + i * stringSpacing}" y1="${startY}" x2="${startX + i * stringSpacing}" y2="${startY + numFrets * fretSpacing}" stroke="${strokeColor}" stroke-width="1"/>`
    }

    // Barres
    if (chord.barres) {
      for (const barre of chord.barres) {
        const barreY = startY + (barre.fret - (chord.baseFret || 1) + 0.5) * fretSpacing
        const fromX = startX + barre.fromString * stringSpacing
        const toX = startX + barre.toString * stringSpacing
        svg += `<rect x="${fromX - 4}" y="${barreY - 5}" width="${toX - fromX + 8}" height="10" rx="5" fill="${dotColor}"/>`
      }
    }

    // Finger positions and open/muted strings
    for (let i = 0; i < 6; i++) {
      const fret = chord.frets[i]
      const x = startX + i * stringSpacing

      if (fret === 'x') {
        // Muted string
        svg += `<text x="${x}" y="${startY - 6}" text-anchor="middle" font-size="10" fill="${openColor}">x</text>`
      } else if (fret === 0) {
        // Open string
        svg += `<circle cx="${x}" cy="${startY - 8}" r="4" fill="none" stroke="${openColor}" stroke-width="1.5"/>`
      } else {
        // Fretted note
        const adjustedFret = (chord.baseFret && chord.baseFret > 1) ? fret - chord.baseFret + 1 : fret
        const y = startY + (adjustedFret - 0.5) * fretSpacing

        // Check if this position is covered by a barre
        const isBarre = chord.barres?.some(b =>
          fret === b.fret && i >= b.fromString && i <= b.toString
        )

        if (!isBarre) {
          svg += `<circle cx="${x}" cy="${y}" r="5" fill="${dotColor}"/>`

          // Finger number
          if (chord.fingers && chord.fingers[i] > 0) {
            svg += `<text x="${x}" y="${y + 3}" text-anchor="middle" font-size="7" fill="${isDark ? '#333' : '#fff'}">${chord.fingers[i]}</text>`
          }
        }
      }
    }

    svg += `</svg>`
    return svg
  }

  // Extract unique chords from cifra text
  const extractChords = (text: string): string[] => {
    // First, remove tablature lines (lines that look like: E|----, B|----, etc.)
    const cleanedText = text
      .split('\n')
      .filter(line => {
        // Remove lines that are tablature (start with E|, B|, G|, D|, A| followed by dashes/numbers)
        const tabPattern = /^[EBGDA]\|[-0-9/hpbs~x\(\)\s]+\|?\s*$/i
        return !tabPattern.test(line.trim())
      })
      .join('\n')

    // Get unique chords, preserving order of first appearance
    const seen = new Set<string>()
    const unique: string[] = []

    // Process line by line to better detect chord lines vs lyric lines
    for (const line of cleanedText.split('\n')) {
      // Skip lines that look like lyrics (contain many lowercase letters in sequence)
      const looksLikeLyrics = /[a-z]{3,}/.test(line)

      if (looksLikeLyrics) {
        // For lyric lines, only extract chords that have modifiers (Am, C7, G#m, etc.)
        // Single letters in lyrics are almost never chords
        const chordPatternStrict = /\b([A-G][#b])(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?|\b([A-G])(m|M|dim|aug|sus|add|maj|min|2|4|5|6|7|9|11|13|7M)(2|4|5|6|7|9|11|13|7M)?/g
        const matches = line.match(chordPatternStrict) || []
        for (const chord of matches) {
          const baseChord = chord.split('/')[0]
          if (!seen.has(baseChord)) {
            seen.add(baseChord)
            unique.push(baseChord)
          }
        }
      } else {
        // For non-lyric lines (likely chord lines), accept single letter chords too
        const chordPattern = /\b([A-G][#b]?)(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b/g
        const matches = line.match(chordPattern) || []
        for (const chord of matches) {
          const baseChord = chord.split('/')[0]
          if (!seen.has(baseChord)) {
            seen.add(baseChord)
            unique.push(baseChord)
          }
        }
      }
    }

    return unique
  }

  const hasChordData = (chordName: string): boolean => {
    return getChordData(chordName) !== null
  }

  return {
    getChordData,
    generateChordSVG,
    extractChords,
    hasChordData
  }
}
