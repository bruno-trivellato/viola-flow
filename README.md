# Viola Flow

App web para tocar cifras com autoscroll e vídeo do YouTube lado a lado.

## Stack

- **Nuxt 3** (Vue 3)
- **Tailwind CSS** - estilização
- **Dexie.js** - banco de dados local (IndexedDB)

## Estrutura do Projeto

```
cifra-bruno-app/
├── pages/
│   └── index.vue              # Página principal com todo o app
├── composables/
│   ├── useDatabase.ts         # CRUD do banco de dados (Dexie/IndexedDB)
│   └── useChordDiagram.ts     # Diagramas de acordes em SVG
├── server/
│   └── api/
│       └── parse-cifra.ts     # API para fazer scraping do CifraClub
├── nuxt.config.ts
├── tailwind.config.js
└── package.json
```

## Como Rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## Funcionalidades

### 1. Layout Principal
- **Painel de Controles** (esquerda): Play/Stop, velocidade, tamanho da fonte, tema, ocultar tabs
- **Painel da Cifra** (centro): cifra com acordes coloridos e seções destacadas
- **Painel de Acordes** (colapsável): diagramas SVG dos acordes detectados na música
- **Player YouTube** (direita): vídeo da música embarcado
- **Header**: título, artista, inputs de URL, seletor de músicas

### 2. Parser do CifraClub
- Cola a URL do CifraClub e clica "Parse"
- Extrai automaticamente: título, artista, cifra completa
- Busca o vídeo no YouTube usando a API (título + artista)
- Carrega o vídeo automaticamente no player

### 3. Colorização Inteligente
- **Acordes em laranja**: detecta padrões como Am, C#m7, G, Dsus4, etc.
- **Seções em azul**: [Intro], [Verso], [Refrão], etc.
- **Ignora letras em contexto**: não colore "E" em "E eu vou estar"
- **Ignora tablaturas**: linhas como `E|---0-2-3---|` não são coloridas como acordes

### 4. Diagramas de Acordes
- Detecta automaticamente os acordes únicos da cifra
- Mostra diagramas SVG com posição dos dedos
- Painel colapsável entre a cifra e o vídeo
- Banco de dados com 100+ acordes (maiores, menores, 7, 9, sus, dim, aug, etc.)

### 5. Autoscroll
- Botão Play/Stop
- Controle de velocidade (+/-)
- Atalho: `Ctrl+Space`

### 6. Ocultar Tablaturas
- Checkbox "Ocultar Tabs" no painel de controles
- Esconde todas as linhas de tablatura (E|---, B|---, etc.)
- Útil para quem ainda não sabe ler tabs e quer pular essas partes
- Preferência salva por música

### 7. Temas
- Tema claro (padrão)
- Tema escuro
- Botão "Dark/Light" para alternar
- Todas as cores se adaptam ao tema

### 8. Auto-Save
- Salva automaticamente após parse
- Salva automaticamente ao fazer qualquer alteração (debounce de 1s)
- Se já existir música com mesmo título+artista, pergunta se quer atualizar ou carregar a versão salva
- Indicador visual: "Salvando..." / "Salvo"

### 9. Banco de Dados Local (IndexedDB)
Estrutura de cada música:
```typescript
interface Song {
  id?: number
  title: string           // Nome da música
  artist: string          // Artista
  content: string         // A cifra em si
  cifraClubUrl?: string   // Link do CifraClub de onde veio
  youtubeUrl?: string     // Link do YouTube
  speed: number           // Velocidade do scroll salva
  fontSize: number        // Tamanho da fonte salvo
  hideTabs?: boolean      // Esconder tablaturas
  createdAt: Date
  updatedAt: Date
}
```

## Arquivos Importantes

### `pages/index.vue`
Contém toda a lógica do app:
- Template com layout Tailwind
- State management com `ref()` e `computed()`
- Colorização de acordes com regex
- Auto-save com debounce

### `composables/useDatabase.ts`
CRUD completo com Dexie:
- `getAllSongs()`, `getSong(id)`, `createSong()`, `updateSong()`, `deleteSong()`
- `searchSongs()`, `findByTitleAndArtist()`

### `composables/useChordDiagram.ts`
Diagramas de acordes:
- `generateChordSVG()` - gera SVG do diagrama
- `extractChords()` - extrai acordes únicos do texto
- Banco de dados com posições dos dedos para 100+ acordes

### `server/api/parse-cifra.ts`
API server-side para scraping:
- Faz fetch da página do CifraClub com headers realistas
- Extrai título, artista e cifra com regex
- Busca vídeo no YouTube via API

## Possíveis Melhorias Futuras

- Importar/exportar músicas (JSON backup)
- Busca nas músicas salvas
- Ordenação (por data, alfabética)
- Responsividade mobile
- Transpor tom da cifra
- Metrônomo integrado

## Créditos e Inspirações

Este projeto foi inspirado por:

- **[ChordsAutoscroll](https://github.com/decadenza/ChordsAutoscroll)** - O conceito de interface com autoscroll e exibição de cifras veio deste projeto Python.
- **[Cifra Club](https://www.cifraclub.com.br)** - O app faz parsing/scraping das cifras do Cifra Club. Todo o conteúdo das cifras pertence aos seus respectivos autores e ao Cifra Club.

## Aviso Legal

Este é um projeto pessoal para fins educacionais. As cifras obtidas via scraping são de propriedade do Cifra Club e seus colaboradores. Use de forma responsável e respeite os direitos autorais.
