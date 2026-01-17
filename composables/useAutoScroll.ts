// Composable for managing auto-scroll functionality
export const useAutoScroll = () => {
  const isScrolling = ref(false)
  const speed = ref(30)

  let scrollInterval: ReturnType<typeof setInterval> | null = null
  let currentScrollElement: HTMLElement | null = null

  const startScroll = (element: HTMLElement | null) => {
    if (!element) return

    currentScrollElement = element
    isScrolling.value = true

    scrollInterval = setInterval(() => {
      if (!currentScrollElement) return

      currentScrollElement.scrollTop += 1

      if (currentScrollElement.scrollTop >= currentScrollElement.scrollHeight - currentScrollElement.clientHeight) {
        stopScroll()
      }
    }, 1000 / speed.value)
  }

  const stopScroll = () => {
    isScrolling.value = false
    if (scrollInterval) {
      clearInterval(scrollInterval)
      scrollInterval = null
    }
    currentScrollElement = null
  }

  const toggleScroll = (element: HTMLElement | null) => {
    if (isScrolling.value) {
      stopScroll()
    } else {
      startScroll(element)
    }
  }

  const changeSpeed = (delta: number, element?: HTMLElement | null) => {
    speed.value = Math.max(5, Math.min(200, speed.value + delta))

    // Restart scroll with new speed if currently scrolling
    if (isScrolling.value && element) {
      stopScroll()
      startScroll(element)
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopScroll()
  })

  return {
    isScrolling,
    speed,
    startScroll,
    stopScroll,
    toggleScroll,
    changeSpeed
  }
}
