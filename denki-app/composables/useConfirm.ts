import { inject } from 'vue'
import type ConfirmModal from '~/components/ConfirmModal.vue'
import type { Ref } from 'vue'

export function useConfirm() {
  // inject するのは Ref
  const confirmRef = inject<Ref<InstanceType<typeof ConfirmModal> | null>>('confirm')

    console.log('[useConfirm] inject結果 =', confirmRef)
  if (!confirmRef) {
    throw new Error('ConfirmModal が provide されていません')
  }

  return {
    confirm: (title: string, message: string) =>
      confirmRef.value?.open(title, message, 'confirm'),
    alert: (title: string, message: string) =>
      confirmRef.value?.open(title, message, 'alert')
  }
}
