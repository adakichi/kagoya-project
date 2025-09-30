// composables/useLoader.ts
import { ref } from 'vue'

const loading = ref(false)

export function useLoader() {
  const start = () => (loading.value = true)
  const finish = () => (loading.value = false)

  return { loading, start, finish }
}
