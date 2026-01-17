<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="!isImporting && $emit('close')"
    >
      <div
        class="flex flex-col gap-4 p-6 rounded-2xl shadow-2xl w-[800px] max-w-[95vw] max-h-[85vh]"
        :class="isDark ? 'bg-gray-800' : 'bg-white'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-2 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center gap-3">
            <img :src="isDark ? '/logo-dark.png' : '/logo.png'" alt="" class="w-8 h-8" />
            <span class="text-lg font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">Importar Cifras</span>
          </div>
          <button
            v-if="!isImporting"
            @click="$emit('close')"
            class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Instructions -->
        <div class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          Cole links do CifraClub (Ctrl+V). Uma linha por música. Se quiser, adicione o link do YouTube na segunda coluna.
        </div>

        <!-- Table Container -->
        <div
          ref="tableContainer"
          class="flex-1 overflow-auto border rounded-lg"
          :class="isDark ? 'border-gray-700' : 'border-gray-300'"
          @paste="$emit('paste', $event)"
          tabindex="0"
        >
          <table class="w-full text-sm">
            <thead class="sticky top-0" :class="isDark ? 'bg-gray-700' : 'bg-gray-100'">
              <tr>
                <th class="w-10 px-2 py-2 text-center font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">#</th>
                <th class="px-3 py-2 text-left font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">URL CifraClub *</th>
                <th class="px-3 py-2 text-left font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">URL YouTube (opcional)</th>
                <th class="w-16 px-2 py-2 text-center font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">Status</th>
                <th class="w-10 px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in rows"
                :key="index"
                class="border-t"
                :class="isDark ? 'border-gray-700' : 'border-gray-200'"
              >
                <td class="px-2 py-2 text-center" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ index + 1 }}</td>
                <td class="px-1 py-1">
                  <input
                    v-model="row.cifraUrl"
                    type="text"
                    placeholder="https://www.cifraclub.com.br/..."
                    :disabled="isImporting"
                    class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    :class="[
                      isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
                      row.status === 'error' ? 'border-red-500' : ''
                    ]"
                  />
                </td>
                <td class="px-1 py-1">
                  <input
                    v-model="row.youtubeUrl"
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    :disabled="isImporting"
                    class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                  />
                </td>
                <td class="px-2 py-2 text-center">
                  <span v-if="row.status === 'pending'" class="text-gray-400">-</span>
                  <span v-else-if="row.status === 'loading'" class="inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                  <svg v-else-if="row.status === 'done'" class="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="row.status === 'error'" class="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" :title="row.error">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <button
                    v-else-if="row.status === 'exists'"
                    @click="$emit('overwrite', index)"
                    class="group relative"
                    :title="`'${row.parsedData?.title}' já existe. Clique para sobrescrever.`"
                  >
                    <svg class="w-5 h-5 text-yellow-500 mx-auto cursor-pointer hover:text-yellow-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </td>
                <td class="px-2 py-2 text-center">
                  <button
                    v-if="!isImporting"
                    @click="$emit('remove', index)"
                    class="p-1 rounded transition"
                    :class="isDark ? 'hover:bg-gray-700 text-gray-500 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
              <!-- Empty state -->
              <tr v-if="rows.length === 0" class="border-t" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                <td colspan="5" class="px-4 py-8 text-center" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                  Cole links do CifraClub aqui (Ctrl+V) ou clique em "Adicionar Linha"
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-2 border-t" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center gap-2">
            <button
              v-if="!isImporting"
              @click="$emit('add')"
              class="px-3 py-1.5 text-sm rounded transition flex items-center gap-1"
              :class="isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Linha
            </button>
            <button
              v-if="!isImporting && rows.length > 0"
              @click="$emit('clear')"
              class="px-3 py-1.5 text-sm rounded transition"
              :class="isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'"
            >
              Limpar
            </button>
          </div>

          <!-- Progress info -->
          <div v-if="isImporting" class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            Importando {{ progress.current }} de {{ progress.total }}...
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="!isImporting"
              @click="$emit('close')"
              class="px-4 py-2 text-sm rounded transition"
              :class="isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'"
            >
              Cancelar
            </button>
            <button
              @click="$emit('import')"
              :disabled="isImporting || validCount === 0"
              class="px-4 py-2 text-sm font-medium rounded transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'"
            >
              <svg v-if="isImporting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ isImporting ? 'Importando...' : `Importar (${validCount})` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { ImportRow } from '~/composables/useImportBatch'

defineProps<{
  show: boolean
  isDark: boolean
  rows: ImportRow[]
  isImporting: boolean
  progress: { current: number; total: number }
  validCount: number
}>()

defineEmits<{
  close: []
  paste: [event: ClipboardEvent]
  add: []
  remove: [index: number]
  clear: []
  import: []
  overwrite: [index: number]
}>()

const tableContainer = ref<HTMLDivElement | null>(null)
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
</style>
