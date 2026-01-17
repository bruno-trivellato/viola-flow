# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
```

## Architecture

**Viola Flow** is a Nuxt 3 app for displaying guitar chords with autoscroll and embedded YouTube video.

### Data Flow

1. User pastes CifraClub URL → `server/api/parse-cifra.ts` scrapes the page
2. Parser extracts title, artist, tone, capo, chord content, and searches YouTube
3. Song is saved to SQLite via REST APIs → `server/api/songs/*`
4. Frontend fetches songs via `composables/useDatabase.ts` (API client)
5. Chords are colorized client-side with regex in `pages/index.vue`
6. Chord diagrams generated from `composables/useChordDiagram.ts` (100+ chord shapes)

### Project Structure

```
pages/
└── index.vue                 # Main page, orchestrates components (~600 lines)

components/
├── LoadingModal.vue          # Cifra parsing progress modal
├── ImportModal.vue           # Batch import interface with table
├── SongSelector.vue          # Dropdown with search for song selection
├── ControlsPanel.vue         # Left panel: play/stop, speed, font, theme
├── ChordsPanel.vue           # Detected chords display with diagrams
├── CifraDisplay.vue          # Chord sheet viewer with colorized chords (edit/view modes)
└── SettingsMenu.vue          # Gear icon dropdown menu

composables/
├── useDatabase.ts            # API client for songs CRUD
├── useChordDiagram.ts        # SVG chord diagram generator (100+ shapes)
├── useSongManager.ts         # Song state, auto-save, parse logic
├── useImportBatch.ts         # Batch import from CifraClub
├── useUIPreferences.ts       # Theme and panel sizes (localStorage)
├── useAutoScroll.ts          # Autoscroll functionality
└── usePanelResize.ts         # Drag-to-resize panels

server/
├── api/
│   ├── parse-cifra.ts        # Scrapes CifraClub pages
│   └── songs/                # REST endpoints (Nuxt file-based routing)
│       ├── index.get.ts
│       ├── index.post.ts
│       ├── [id].get.ts
│       ├── [id].put.ts
│       ├── [id].delete.ts
│       └── find.get.ts       # Find song by title and artist
└── utils/
    └── database.ts           # SQLite schema and prepared statements
```

### Database

SQLite file `viola-flow.db` in project root. Schema has single `songs` table with: title, artist, content, cifraClubUrl, youtubeUrl, tone, capo, speed, fontSize, hideTabs, timestamps.

### External Access

App is exposed via CloudFlare Tunnel at `viola-flow.helpersbot.com.br`. Config in `~/.cloudflared/config.yml`. Vite allowed hosts configured in `nuxt.config.ts`.

## Conventions

- Portuguese for user-facing strings
- Tailwind for all styling, supports dark/light themes via `isDark` ref
- State managed with Vue 3 Composition API (`ref`, `computed`, `watch`)
- Auto-save triggers on content changes with 1s debounce
- Components receive props and emit events (no direct state mutation)
- Composables encapsulate reusable logic and state
