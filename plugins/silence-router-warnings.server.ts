// Silence Vue Router warnings for static asset paths on server
export default defineNuxtPlugin(() => {
  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && message.includes('No match found for location with path "/_nuxt/')) {
      return
    }
    originalWarn.apply(console, args)
  }
})
