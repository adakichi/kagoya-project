<template>
  <v-dialog v-model="isOpen" max-width="400">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn 
        v-if="mode === 'confirm'" 
        ref="cancelBtn"
        text 
        @click="handleCancel">キャンセル</v-btn>
        <v-btn 
        ref="okBtn"
        color="primary" 
        text 
        autofocus
        @click="handleOk"
        >OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

import { ref, onMounted, watch, nextTick, onBeforeUnmount  } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
const mode = ref<'alert' | 'confirm'>('alert')
const okBtn = ref<any>(null)
const cancelBtn = ref<any>(null)


// Promise の resolve を外に保持
let resolver: ((v: boolean) => void) | null = null

function open(t: string, m: string, type: 'alert' | 'confirm' = 'alert') {
  title.value = t
  message.value = m
  mode.value = type
  isOpen.value = true

  return new Promise<boolean>((resolve) => {
    resolver = resolve
  })
}


// 矢印キーでOK cancelを移動
// まずはkeyDownリスナー登録 
watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    // autofocus に任せるので focus() は不要
    window.addEventListener('keydown', handleKeyDown)
  } else {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

function handleKeyDown(e: KeyboardEvent) {
  if (!isOpen.value || mode.value !== 'confirm') return

  const okEl = okBtn.value?.$el
  const cancelEl = cancelBtn.value?.$el
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    cancelEl?.focus()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    okEl?.focus()
  }
}


function handleOk() {
  isOpen.value = false
  resolver?.(true)
}

function handleCancel() {
  isOpen.value = false
  resolver?.(false)
}

// 外から使えるように export
defineExpose({ open })



onMounted(() => {
  console.log('[ConfirmModal] マウント完了')
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

router.beforeEach((to, from, next) => {
  isOpen.value = false
  next()
})

</script>
