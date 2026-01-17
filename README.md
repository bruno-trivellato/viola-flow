# Viola Flow

App web para tocar cifras com autoscroll e vídeo do YouTube lado a lado.

<img width="1860" height="875" alt="image" src="https://github.com/user-attachments/assets/74e71746-19bb-4007-b344-5ff71682112e" />


## Stack

- **Nuxt 3** (Vue 3)
- **Tailwind CSS** - estilização
- **SQLite** (better-sqlite3) - banco de dados no servidor

## Estrutura do Projeto

```
cifra-bruno-app/
├── pages/
│   └── index.vue              # Página principal com todo o app
├── composables/
│   ├── useDatabase.ts         # Cliente API para CRUD de músicas
│   └── useChordDiagram.ts     # Diagramas de acordes em SVG
├── server/
│   ├── api/
│   │   ├── parse-cifra.ts     # API para fazer scraping do CifraClub
│   │   └── songs/             # APIs REST para CRUD de músicas
│   │       ├── index.get.ts   # GET /api/songs - listar todas
│   │       ├── index.post.ts  # POST /api/songs - criar
│   │       ├── [id].get.ts    # GET /api/songs/:id - buscar por ID
│   │       ├── [id].put.ts    # PUT /api/songs/:id - atualizar
│   │       ├── [id].delete.ts # DELETE /api/songs/:id - deletar
│   │       └── find.get.ts    # GET /api/songs/find - buscar por título/artista
│   └── utils/
│       └── database.ts        # Conexão e schema do SQLite
├── viola-flow.db              # Banco de dados SQLite
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
- **Painel da Cifra** (centro): cifra com acordes coloridos, seções destacadas, tom e capo
- **Painel de Acordes** (colapsável): diagramas SVG dos acordes detectados na música
- **Player YouTube** (direita): vídeo da música embarcado
- **Header**: logo, seletor de músicas com busca, inputs de URL do CifraClub e YouTube
- **Painéis redimensionáveis**: arraste as bordas entre os painéis para ajustar larguras
- **Duplo clique para editar**: clique duas vezes na cifra para entrar no modo de edição

### 2. Parser do CifraClub
- Cola a URL do CifraClub e pressiona Enter
- Modal de loading com progresso em etapas (buscando página, extraindo dados, salvando...)
- Extrai automaticamente: título, artista, tom, capo e cifra completa
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
- Painel colapsável e redimensionável entre a cifra e o vídeo
- **Colunas dinâmicas**: acordes se reorganizam automaticamente conforme a largura do painel (2, 3, 4+ colunas)
- **Tamanho fixo**: diagramas mantêm tamanho consistente independente da largura
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

### 7. Temas e Persistência de UI
- Tema claro (padrão) e tema escuro
- Botão "Dark/Light" para alternar
- Todas as cores se adaptam ao tema (incluindo diagramas de acordes)
- **Preferências salvas**: tema, larguras dos painéis e última música aberta são persistidos no localStorage

### 8. Auto-Save
- Salva automaticamente após parse
- Salva automaticamente ao fazer qualquer alteração (debounce de 1s)
- Se já existir música com mesmo título+artista, pergunta se quer atualizar ou carregar a versão salva
- Indicador visual: "Salvando..." / "Salvo"

### 9. Banco de Dados SQLite (Server-side)
- **Persistência no servidor**: banco SQLite local (`viola-flow.db`) em vez de IndexedDB no navegador
- **Compartilhado entre dispositivos**: acesse do PC ou celular e veja as mesmas músicas
- **APIs REST**: endpoints em `/api/songs/*` para CRUD completo
- **better-sqlite3**: biblioteca performante com prepared statements

Estrutura de cada música:
```typescript
interface Song {
  id?: number
  title: string           // Nome da música
  artist: string          // Artista
  content: string         // A cifra em si
  cifraClubUrl?: string   // Link do CifraClub de onde veio
  youtubeUrl?: string     // Link do YouTube
  tone?: string           // Tom da música (ex: "Am", "G")
  capo?: number           // Casa do capotraste
  speed: number           // Velocidade do scroll salva
  fontSize: number        // Tamanho da fonte salvo
  hideTabs?: boolean      // Esconder tablaturas
  createdAt: string
  updatedAt: string
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
Cliente para APIs REST de músicas:
- `getAllSongs()`, `getSong(id)`, `createSong()`, `updateSong()`, `deleteSong()`
- `searchSongs()`, `findByTitleAndArtist()`

### `server/utils/database.ts`
Configuração do SQLite com better-sqlite3:
- Schema da tabela `songs`
- Prepared statements para performance
- Funções de CRUD usadas pelas APIs

### `composables/useChordDiagram.ts`
Diagramas de acordes:
- `generateChordSVG()` - gera SVG do diagrama
- `extractChords()` - extrai acordes únicos do texto
- Banco de dados com posições dos dedos para 100+ acordes

### `server/api/parse-cifra.ts`
API server-side para scraping:
- Faz fetch da página do CifraClub com headers realistas
- Extrai título, artista, tom, capo e cifra com regex
- Busca vídeo no YouTube via API

## Possíveis Melhorias Futuras

- Importar/exportar músicas (JSON backup)
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
