<template>
  <div class="h-screen p-3 transition-colors duration-200" :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'">
    <!-- Loading Modal -->
    <LoadingModal
      :show="isParsing"
      :isDark="isDark"
      :steps="loadingSteps"
    />

    <!-- Import Modal -->
    <ImportModal
      :show="showImportModal"
      :isDark="isDark"
      :rows="importRows"
      :isImporting="isImporting"
      :progress="importProgress"
      :validCount="validImportRows.length"
      @close="showImportModal = false"
      @paste="handleImportPaste"
      @add="addImportRow"
      @remove="removeImportRow"
      @clear="clearImportRows"
      @import="startBatchImport"
      @overwrite="overwriteExistingRow"
    />

    <div class="h-full flex flex-col rounded-xl overflow-hidden">
      <!-- Top Bar - Desktop -->
      <div v-if="!isMobile" class="flex items-center gap-3 p-3 border-b flex-wrap transition-colors duration-200" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300 shadow-sm'">
        <!-- App Logo -->
        <div class="flex items-center gap-2">
          <img
            :src="isDark ? '/logo-dark.png' : '/logo.png'"
            alt="Viola Flow"
            class="h-8 w-8"
          />
          <span class="font-bold text-lg" :class="isDark ? 'text-white' : 'text-gray-800'">Viola Flow</span>
        </div>

        <span :class="isDark ? 'text-gray-600' : 'text-gray-300'">|</span>

        <!-- Song Selector -->
        <SongSelector
          :songs="songs"
          :selectedId="selectedSongId"
          :isDark="isDark"
          @select="selectSong"
          @delete="deleteSongById"
        />

        <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">CifraClub:</label>
        <input
          v-model="cifraClubUrl"
          type="text"
          :placeholder="isParsing ? 'Carregando...' : 'Cole a URL e pressione Enter'"
          :disabled="isParsing"
          class="flex-1 min-w-[150px] px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
          :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
          @keyup.enter="parseCifra"
        />

        <label class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">YouTube:</label>
        <input
          v-model="youtubeUrl"
          type="text"
          placeholder="Cole a URL e pressione Enter"
          class="flex-1 min-w-[150px] px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500"
          :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
          @keyup.enter="loadVideo"
        />

        <!-- Settings Menu -->
        <SettingsMenu :isDark="isDark" @openImport="showImportModal = true" />
      </div>

      <!-- Top Bar - Mobile -->
      <div v-else class="flex items-center gap-2 p-2 border-b transition-colors duration-200" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300 shadow-sm'">
        <!-- App Logo (smaller) -->
        <img
          :src="isDark ? '/logo-dark.png' : '/logo.png'"
          alt="Viola Flow"
          class="h-6 w-6"
        />

        <!-- Song Selector (flex-1 to take remaining space) -->
        <div class="flex-1">
          <SongSelector
            :songs="songs"
            :selectedId="selectedSongId"
            :isDark="isDark"
            @select="selectSong"
            @delete="deleteSongById"
          />
        </div>

        <!-- Add song button -->
        <button
          @click="showMobileAddSong = true"
          class="p-2 rounded-lg"
          :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <!-- Settings Menu -->
        <SettingsMenu :isDark="isDark" @openImport="showImportModal = true" />
      </div>

      <!-- Main Content - Desktop -->
      <div v-if="!isMobile" ref="mainContainer" class="flex flex-1 overflow-hidden">
        <!-- Controls Panel -->
        <ControlsPanel
          :width="leftPanelWidth"
          :isDark="isDark"
          :isScrolling="isScrolling"
          :speed="speed"
          :hideTabs="hideTabs"
          @toggleScroll="toggleScroll(isEditing ? chordsTextarea : chordsDisplay)"
          @changeSpeed="(delta) => changeSpeed(delta, isEditing ? chordsTextarea : chordsDisplay)"
          @changeFontSize="changeFontSize"
          @toggleTheme="toggleTheme"
          @update:hideTabs="hideTabs = $event"
        />

        <!-- Resizer: Left Panel -->
        <div
          class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
          :class="isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-300 hover:bg-blue-500'"
          @mousedown="startResize('left', $event)"
        ></div>

        <!-- Chords Panel (MIDDLE - where the cifra text is) -->
        <div
          ref="middlePanel"
          class="flex flex-col border-r overflow-hidden"
          :class="isDark ? 'border-gray-700' : 'border-gray-300'"
          :style="middlePanelWidth ? { width: middlePanelWidth + 'px', flexShrink: 0 } : { flex: 1 }"
        >
          <!-- Tone and Capo info -->
          <div v-if="saveForm.tone || saveForm.capo" class="flex items-center gap-3 px-5 py-2 border-b" :class="isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'">
            <span v-if="saveForm.tone" class="px-2 py-1 rounded text-sm font-medium" :class="isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'">
              Tom: {{ saveForm.tone }}
            </span>
            <span v-if="saveForm.capo" class="px-2 py-1 rounded text-sm font-medium" :class="isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'">
              Capo: {{ saveForm.capo }}ª casa
            </span>
          </div>

          <!-- Edit mode -->
          <textarea
            v-if="isEditing"
            ref="chordsTextarea"
            v-model="chordsContent"
            @blur="isEditing = false"
            class="flex-1 p-5 font-mono resize-none focus:outline-none transition-colors duration-200"
            :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'"
            :style="{ fontSize: fontSize + 'px', lineHeight: '1.6' }"
            placeholder="Cole a cifra aqui..."
          ></textarea>

          <!-- View mode with colored chords -->
          <div
            v-else
            ref="chordsDisplay"
            @dblclick="startEditing"
            class="flex-1 p-5 font-mono overflow-auto cursor-default transition-colors duration-200 whitespace-pre"
            :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'"
            :style="{ fontSize: fontSize + 'px', lineHeight: '1.6' }"
          >
            <span v-if="!chordsContent" :class="isDark ? 'text-gray-600' : 'text-gray-400'">Clique aqui para colar a cifra...</span>
            <span v-else v-html="colorizedChords"></span>
          </div>
        </div>

        <!-- Resizer: Middle Panel -->
        <div
          class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
          :class="isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-300 hover:bg-blue-500'"
          @mousedown="startResize('middle', $event)"
        ></div>

        <!-- Detected Chords Panel -->
        <ChordsPanel
          :show="showChordsPanel"
          :width="chordsPanelWidth"
          :chords="detectedChords"
          :isDark="isDark"
          @open="showChordsPanel = true"
          @close="showChordsPanel = false"
        />

        <!-- Resizer: Chords Panel (before video) -->
        <div
          v-if="showChordsPanel && detectedChords.length > 0"
          class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
          :class="isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-300 hover:bg-blue-500'"
          @mousedown="startResize('chords', $event)"
        ></div>

        <!-- Video Panel -->
        <div class="flex-1 bg-black flex items-center justify-center min-w-0">
          <iframe
            v-if="videoId"
            :src="`https://www.youtube.com/embed/${videoId}?autoplay=0`"
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <div v-else class="text-gray-600 text-center">
            Cole a URL do YouTube acima
          </div>
        </div>
      </div>

      <!-- Main Content - Mobile -->
      <div v-else class="flex-1 flex flex-col overflow-hidden relative pb-14">
        <!-- Cifra Panel (Full Screen) -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Tone and Capo info -->
          <div v-if="saveForm.tone || saveForm.capo" class="flex items-center gap-2 px-3 py-2 border-b" :class="isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'">
            <span v-if="saveForm.tone" class="px-2 py-1 rounded text-xs font-medium" :class="isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'">
              Tom: {{ saveForm.tone }}
            </span>
            <span v-if="saveForm.capo" class="px-2 py-1 rounded text-xs font-medium" :class="isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'">
              Capo: {{ saveForm.capo }}ª casa
            </span>
          </div>

          <!-- Edit mode -->
          <textarea
            v-if="isEditing"
            ref="chordsTextarea"
            v-model="chordsContent"
            @blur="isEditing = false"
            class="flex-1 p-3 font-mono resize-none focus:outline-none transition-colors duration-200"
            :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'"
            :style="{ fontSize: fontSize + 'px', lineHeight: '1.5' }"
            placeholder="Cole a cifra aqui..."
          ></textarea>

          <!-- View mode with colored chords -->
          <div
            v-else
            ref="chordsDisplay"
            @dblclick="startEditing"
            class="flex-1 p-3 font-mono overflow-auto cursor-default transition-colors duration-200 whitespace-pre"
            :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'"
            :style="{ fontSize: fontSize + 'px', lineHeight: '1.5' }"
          >
            <span v-if="!chordsContent" :class="isDark ? 'text-gray-600' : 'text-gray-400'">Toque para colar a cifra...</span>
            <span v-else v-html="colorizedChords"></span>
          </div>
        </div>

        <!-- Mobile Bottom Controls Bar (Fixed) -->
        <div class="fixed bottom-0 left-0 right-0 flex items-center justify-around p-2 border-t z-40" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'">
          <!-- Play/Pause Scroll -->
          <button
            @click="toggleScroll(isEditing ? chordsTextarea : chordsDisplay)"
            class="flex flex-col items-center p-2 rounded-lg"
            :class="isScrolling ? 'text-green-500' : (isDark ? 'text-gray-400' : 'text-gray-600')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="isScrolling" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs mt-1">{{ isScrolling ? 'Parar' : 'Scroll' }}</span>
          </button>

          <!-- Speed Down -->
          <button
            @click="changeSpeed(-0.5, isEditing ? chordsTextarea : chordsDisplay)"
            class="flex flex-col items-center p-2 rounded-lg"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="text-xs mt-1">Lento</span>
          </button>

          <!-- Speed indicator -->
          <div class="flex flex-col items-center p-2">
            <span class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">{{ speed.toFixed(1) }}x</span>
            <span class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Veloc.</span>
          </div>

          <!-- Speed Up -->
          <button
            @click="changeSpeed(0.5, isEditing ? chordsTextarea : chordsDisplay)"
            class="flex flex-col items-center p-2 rounded-lg"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-xs mt-1">Rápido</span>
          </button>

          <!-- Chords -->
          <button
            @click="showMobileChords = true"
            class="flex flex-col items-center p-2 rounded-lg"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span class="text-xs mt-1">Acordes</span>
          </button>

          <!-- YouTube external link -->
          <a
            v-if="videoId"
            :href="`https://www.youtube.com/watch?v=${videoId}`"
            target="_blank"
            class="flex flex-col items-center p-2 rounded-lg text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span class="text-xs mt-1">YouTube</span>
          </a>

          <!-- More menu (...) -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="flex flex-col items-center p-2 rounded-lg relative"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span class="text-xs mt-1">Mais</span>
          </button>
        </div>

        <!-- Mobile More Menu (popup above bar) -->
        <div
          v-if="showMobileMenu"
          class="fixed bottom-16 right-2 rounded-lg shadow-xl border z-50 py-1 min-w-[140px]"
          :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
        >
          <!-- Font Size -->
          <div class="px-3 py-2 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-100'">
            <span class="text-xs font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Tamanho da fonte</span>
            <div class="flex items-center justify-between mt-1">
              <button
                @click="changeFontSize(-2)"
                class="p-1 rounded"
                :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
              >
                <span class="text-lg font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">A-</span>
              </button>
              <span class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">{{ fontSize }}px</span>
              <button
                @click="changeFontSize(2)"
                class="p-1 rounded"
                :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
              >
                <span class="text-lg font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">A+</span>
              </button>
            </div>
          </div>

          <!-- Theme toggle -->
          <button
            @click="toggleTheme(); showMobileMenu = false"
            class="w-full flex items-center gap-3 px-3 py-2"
            :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="isDark ? 'text-gray-400' : 'text-gray-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="isDark" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span :class="isDark ? 'text-white' : 'text-gray-800'">{{ isDark ? 'Modo claro' : 'Modo escuro' }}</span>
          </button>

          <!-- Mini player toggle -->
          <button
            v-if="videoId"
            @click="showMobileVideo = !showMobileVideo; showMobileMenu = false"
            class="w-full flex items-center gap-3 px-3 py-2"
            :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="showMobileVideo ? 'text-blue-500' : (isDark ? 'text-gray-400' : 'text-gray-600')" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span :class="isDark ? 'text-white' : 'text-gray-800'">{{ showMobileVideo ? 'Esconder mini' : 'Mostrar mini' }}</span>
          </button>
        </div>

        <!-- Backdrop for menu -->
        <div
          v-if="showMobileMenu"
          class="fixed inset-0 z-40"
          @click="showMobileMenu = false"
        ></div>

        <!-- Mobile Mini Video Player (PiP style) -->
        <div
          v-if="videoId && showMobileVideo"
          class="fixed bottom-16 right-2 w-40 aspect-video rounded-lg overflow-hidden shadow-lg border-2 z-30"
          :class="isDark ? 'border-gray-600' : 'border-gray-300'"
        >
          <iframe
            :src="`https://www.youtube.com/embed/${videoId}?autoplay=0`"
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <button
            @click="showMobileVideo = false"
            class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
          >
            ✕
          </button>
        </div>


        <!-- Mobile Chords Modal -->
        <Teleport to="body">
          <div
            v-if="showMobileChords"
            class="fixed inset-0 z-50 flex items-end justify-center"
            @click.self="showMobileChords = false"
          >
            <div class="absolute inset-0 bg-black/50" @click="showMobileChords = false"></div>
            <div
              class="relative w-full max-h-[70vh] rounded-t-2xl overflow-hidden"
              :class="isDark ? 'bg-gray-800' : 'bg-white'"
            >
              <div class="flex items-center justify-between p-3 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                <span class="font-semibold" :class="isDark ? 'text-white' : 'text-gray-800'">Acordes Detectados</span>
                <button @click="showMobileChords = false" class="p-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="p-3 overflow-auto max-h-[60vh]">
                <div class="flex flex-wrap gap-3 justify-center">
                  <div
                    v-for="chord in detectedChords"
                    :key="chord"
                    class="flex flex-col items-center chord-mobile"
                    v-html="generateChordSVG(chord, isDark)"
                  >
                  </div>
                </div>
                <p v-if="detectedChords.length === 0" class="text-center py-4" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                  Nenhum acorde detectado
                </p>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Mobile Add Song Modal -->
        <Teleport to="body">
          <div
            v-if="showMobileAddSong"
            class="fixed inset-0 z-50 flex items-end justify-center"
            @click.self="showMobileAddSong = false"
          >
            <div class="absolute inset-0 bg-black/50" @click="showMobileAddSong = false"></div>
            <div
              class="relative w-full rounded-t-2xl overflow-hidden"
              :class="isDark ? 'bg-gray-800' : 'bg-white'"
            >
              <div class="flex items-center justify-between p-3 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                <span class="font-semibold" :class="isDark ? 'text-white' : 'text-gray-800'">Adicionar Música</span>
                <button @click="showMobileAddSong = false" class="p-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="p-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">URL do CifraClub</label>
                  <input
                    v-model="cifraClubUrl"
                    type="text"
                    :placeholder="isParsing ? 'Carregando...' : 'Cole a URL aqui'"
                    :disabled="isParsing"
                    class="w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                    @keyup.enter="parseCifra(); showMobileAddSong = false"
                  />
                </div>
                <button
                  @click="parseCifra(); showMobileAddSong = false"
                  :disabled="isParsing || !cifraClubUrl"
                  class="w-full py-3 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isParsing ? 'Carregando...' : 'Importar Cifra' }}
                </button>
                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t" :class="isDark ? 'border-gray-700' : 'border-gray-200'"></div>
                  </div>
                  <div class="relative flex justify-center text-sm">
                    <span class="px-2" :class="isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'">ou</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">URL do YouTube</label>
                  <input
                    v-model="youtubeUrl"
                    type="text"
                    placeholder="Cole a URL aqui"
                    class="w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                    @keyup.enter="loadVideo"
                  />
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { extractChords, generateChordSVG } = useChordDiagram()

// UI Preferences
const {
  isDark,
  leftPanelWidth,
  middlePanelWidth,
  chordsPanelWidth,
  loadPreferences,
  getLastSongId,
  setLastSongId,
  toggleTheme
} = useUIPreferences()

// Song Manager
const {
  songs,
  selectedSongId,
  currentSong,
  isParsing,
  chordsContent,
  cifraClubUrl,
  youtubeUrl,
  speed,
  fontSize,
  hideTabs,
  saveForm,
  loadingSteps,
  loadSongs,
  selectSong,
  deleteSongById,
  parseCifra,
  findByTitleAndArtist,
  createSong,
  updateSong
} = useSongManager()

// Auto Scroll
const {
  isScrolling,
  toggleScroll,
  changeSpeed
} = useAutoScroll()

// Panel Resize
const { middlePanel, startResize } = usePanelResize(leftPanelWidth, middlePanelWidth, chordsPanelWidth)

// Import Batch
const {
  showImportModal,
  isImporting,
  importRows,
  importProgress,
  validImportRows,
  addImportRow,
  removeImportRow,
  clearImportRows,
  handleImportPaste,
  startBatchImport,
  overwriteExistingRow
} = useImportBatch(findByTitleAndArtist, createSong, updateSong, loadSongs)

// Local state
const videoId = ref('')
const isEditing = ref(false)
const showChordsPanel = ref(true)
const chordsTextarea = ref<HTMLTextAreaElement | null>(null)
const chordsDisplay = ref<HTMLDivElement | null>(null)
const mainContainer = ref<HTMLDivElement | null>(null)

// Mobile detection
const isMobile = ref(false)
const showMobileVideo = ref(false)
const showMobileControls = ref(false)
const showMobileChords = ref(false)
const showMobileAddSong = ref(false)
const showMobileMenu = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}


// Detected chords from the cifra
const detectedChords = computed(() => {
  return extractChords(chordsContent.value)
})

// Helper to check if a line is tablature
const isTabLine = (line: string): boolean => {
  return /^[EBGDA]\|[-0-9/hpbs~x\(\)\s]+\|?\s*$/i.test(line.trim())
}

// Helper to check if a line is a tab section header
const isTabSectionHeader = (line: string): boolean => {
  const lower = line.toLowerCase()
  return /\[(tab|solo|riff|intro tab|tab -|dedilhado)/.test(lower) ||
         /\[.*tab.*\]/i.test(line)
}

// Colorize chords - detect chord patterns and wrap in orange span
const colorizedChords = computed(() => {
  if (!chordsContent.value) return ''

  const lines = chordsContent.value.split('\n')
  let inTabSection = false
  const colorizedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    let escapedLine = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (isTabSectionHeader(line)) {
      inTabSection = true
    }

    const lineIsTab = isTabLine(line)

    if (inTabSection && !lineIsTab && line.trim() !== '' && !isTabSectionHeader(line)) {
      if (/^\[/.test(line.trim())) {
        inTabSection = false
      }
    }

    if (hideTabs.value && (lineIsTab || (inTabSection && isTabSectionHeader(line)))) {
      continue
    }

    if (/^\[/.test(line.trim()) && !isTabSectionHeader(line)) {
      inTabSection = false
    }

    if (lineIsTab) {
      colorizedLines.push(escapedLine)
      continue
    }

    const looksLikeLyrics = /[a-z]{3,}/.test(line)

    if (looksLikeLyrics) {
      const strictChordPattern = /\b([A-G][#b])(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b|\b([A-G])(m|M|dim|aug|sus|add|maj|min|2|4|5|6|7|9|11|13|7M)(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b/g
      escapedLine = escapedLine.replace(strictChordPattern, (match) => {
        return `<span class="text-orange-500 font-bold">${match}</span>`
      })
    } else {
      const chordPattern = /\b([A-G][#b]?)(m|M|dim|aug|sus|add|maj|min)?(2|4|5|6|7|9|11|13|7M)?(sus|add|aug|dim)?(2|4|5|6|9|11|13)?(\([^)]+\))?(\/[A-G][#b]?)?\b/g
      escapedLine = escapedLine.replace(chordPattern, (match) => {
        return `<span class="text-orange-500 font-bold">${match}</span>`
      })
    }

    escapedLine = escapedLine.replace(/\[([^\]]+)\]/g, '<span class="text-blue-500 font-bold">[$1]</span>')

    colorizedLines.push(escapedLine)
  }

  return colorizedLines.join('\n')
})

const startEditing = () => {
  isEditing.value = true
  nextTick(() => {
    chordsTextarea.value?.focus()
  })
}

const loadVideo = () => {
  const url = youtubeUrl.value.trim()
  if (!url) return

  if (url.includes('youtube.com/watch?v=')) {
    videoId.value = url.split('v=')[1].split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId.value = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    videoId.value = url.split('embed/')[1].split('?')[0]
  }
}

const changeFontSize = (delta: number) => {
  fontSize.value = Math.max(10, Math.min(36, fontSize.value + delta))
}

// Watch for song changes and save last opened song
watch(selectedSongId, (newId) => {
  setLastSongId(newId)
})

// Watch youtubeUrl to auto-load video
watch(youtubeUrl, () => {
  if (youtubeUrl.value) {
    loadVideo()
  }
})

// Load on mount
onMounted(async () => {
  loadPreferences()
  await loadSongs()

  const lastSongId = getLastSongId()
  if (lastSongId && songs.value.some(s => s.id === lastSongId)) {
    selectSong(lastSongId)
  }

  // Mobile detection
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Keyboard shortcut
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault()
      toggleScroll(isEditing.value ? chordsTextarea.value : chordsDisplay.value)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile chord diagrams */
.chord-mobile {
  width: 70px;
  height: 95px;
  flex-shrink: 0;
}

.chord-mobile :deep(svg) {
  width: 70px;
  height: 95px;
}
</style>
