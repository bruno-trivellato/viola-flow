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

### Key Files

- **`pages/index.vue`** - Single-page app with all UI logic, state management, autoscroll, auto-save (1s debounce)
- **`server/utils/database.ts`** - SQLite schema and prepared statements (better-sqlite3)
- **`server/api/songs/`** - REST endpoints following Nuxt file-based routing (`[id].get.ts`, `index.post.ts`, etc.)
- **`composables/useChordDiagram.ts`** - SVG chord diagram generator with finger positions database

### Database

SQLite file `viola-flow.db` in project root. Schema has single `songs` table with: title, artist, content, cifraClubUrl, youtubeUrl, tone, capo, speed, fontSize, hideTabs, timestamps.

### External Access

App is exposed via CloudFlare Tunnel at `viola-flow.helpersbot.com.br`. Config in `~/.cloudflared/config.yml`. Vite allowed hosts configured in `nuxt.config.ts`.

## Conventions

- Portuguese for user-facing strings
- Tailwind for all styling, supports dark/light themes via `isDark` ref
- State managed with Vue 3 Composition API (`ref`, `computed`, `watch`)
- Auto-save triggers on content changes with 1s debounce
