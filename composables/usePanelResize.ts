// Composable for managing panel resize functionality
export const usePanelResize = (
  leftPanelWidth: Ref<number>,
  middlePanelWidth: Ref<number | null>,
  chordsPanelWidth: Ref<number>
) => {
  const isResizing = ref(false)
  const resizingColumn = ref<'left' | 'middle' | 'chords' | null>(null)
  const startX = ref(0)
  const startWidth = ref(0)

  const middlePanel = ref<HTMLDivElement | null>(null)

  const startResize = (column: 'left' | 'middle' | 'chords', event: MouseEvent) => {
    isResizing.value = true
    resizingColumn.value = column
    startX.value = event.clientX

    if (column === 'left') {
      startWidth.value = leftPanelWidth.value
    } else if (column === 'middle') {
      if (middlePanel.value) {
        startWidth.value = middlePanel.value.offsetWidth
      }
    } else if (column === 'chords') {
      startWidth.value = chordsPanelWidth.value
    }

    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleResize = (event: MouseEvent) => {
    if (!isResizing.value || !resizingColumn.value) return

    const delta = event.clientX - startX.value

    if (resizingColumn.value === 'left') {
      const newWidth = Math.max(60, Math.min(200, startWidth.value + delta))
      leftPanelWidth.value = newWidth
    } else if (resizingColumn.value === 'middle') {
      const newWidth = Math.max(200, startWidth.value + delta)
      middlePanelWidth.value = newWidth
    } else if (resizingColumn.value === 'chords') {
      const newWidth = Math.max(120, Math.min(800, startWidth.value + delta))
      chordsPanelWidth.value = newWidth
    }
  }

  const stopResize = () => {
    isResizing.value = false
    resizingColumn.value = null
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  return {
    isResizing,
    middlePanel,
    startResize
  }
}
