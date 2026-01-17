<template>
  <!-- Collapsible panel -->
  <div
    v-if="show && chords.length > 0"
    class="border-r overflow-y-auto transition-colors duration-200 flex-shrink-0"
    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'"
    :style="{ width: width + 'px' }"
  >
    <div class="p-2 border-b flex items-center justify-between" :class="isDark ? 'border-gray-700' : 'border-gray-300'">
      <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Acordes ({{ chords.length }})</span>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-lg leading-none">&times;</button>
    </div>
    <div class="p-2 flex flex-wrap gap-2 justify-center">
      <div
        v-for="chord in chords"
        :key="chord"
        class="flex flex-col items-center chord-item"
        v-html="generateChordSVG(chord, isDark)"
      >
      </div>
    </div>
  </div>

  <!-- Toggle button when collapsed -->
  <button
    v-if="!show && chords.length > 0"
    @click="$emit('open')"
    class="w-8 flex items-center justify-center border-r transition-colors duration-200 hover:bg-opacity-80 flex-shrink-0"
    :class="isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'"
    title="Mostrar acordes"
  >
    <span class="transform -rotate-90 whitespace-nowrap text-xs font-medium">Acordes</span>
  </button>
</template>

<script setup lang="ts">
const { generateChordSVG } = useChordDiagram()

defineProps<{
  show: boolean
  width: number
  chords: string[]
  isDark: boolean
}>()

defineEmits<{
  open: []
  close: []
}>()
</script>

<style scoped>
/* Fixed size chord diagrams - don't scale with column width */
.chord-item {
  width: 80px;
  height: 110px;
  flex-shrink: 0;
}

.chord-item :deep(svg) {
  width: 80px;
  height: 110px;
}
</style>
