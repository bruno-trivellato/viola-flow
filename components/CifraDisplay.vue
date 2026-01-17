<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Tone and Capo info -->
    <div
      v-if="tone || capo"
      class="flex items-center border-b"
      :class="[
        isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200',
        isMobile ? 'gap-2 px-3 py-2' : 'gap-3 px-5 py-2'
      ]"
    >
      <span
        v-if="tone"
        class="px-2 py-1 rounded font-medium"
        :class="[
          isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700',
          isMobile ? 'text-xs' : 'text-sm'
        ]"
      >
        Tom: {{ tone }}
      </span>
      <span
        v-if="capo"
        class="px-2 py-1 rounded font-medium"
        :class="[
          isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700',
          isMobile ? 'text-xs' : 'text-sm'
        ]"
      >
        Capo: {{ capo }}ª casa
      </span>
    </div>

    <!-- Edit mode -->
    <textarea
      v-if="isEditing"
      ref="textareaRef"
      :value="content"
      @input="$emit('update:content', ($event.target as HTMLTextAreaElement).value)"
      @blur="$emit('stopEditing')"
      class="flex-1 font-mono resize-none focus:outline-none transition-colors duration-200"
      :class="[
        isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900',
        isMobile ? 'p-3' : 'p-5'
      ]"
      :style="{ fontSize: fontSize + 'px', lineHeight: isMobile ? '1.5' : '1.6' }"
      placeholder="Cole a cifra aqui..."
    ></textarea>

    <!-- View mode with colored chords -->
    <div
      v-else
      ref="displayRef"
      @dblclick="$emit('startEditing')"
      class="flex-1 font-mono overflow-auto cursor-default transition-colors duration-200 whitespace-pre"
      :class="[
        isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900',
        isMobile ? 'p-3' : 'p-5'
      ]"
      :style="{ fontSize: fontSize + 'px', lineHeight: isMobile ? '1.5' : '1.6' }"
    >
      <span v-if="!content" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
        {{ isMobile ? 'Toque para colar a cifra...' : 'Clique aqui para colar a cifra...' }}
      </span>
      <span v-else v-html="colorizedContent"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string
  colorizedContent: string
  tone: string
  capo: number | null
  fontSize: number
  isDark: boolean
  isMobile: boolean
  isEditing: boolean
}>()

defineEmits<{
  'update:content': [value: string]
  'startEditing': []
  'stopEditing': []
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const displayRef = ref<HTMLDivElement | null>(null)

// Expose refs for parent to use (for scroll functionality)
defineExpose({
  textareaRef,
  displayRef
})
</script>
