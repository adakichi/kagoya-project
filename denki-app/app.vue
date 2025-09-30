<template>
  <v-app>
    <!-- ヘッダー -->
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>電気工事士クイズ ⚡</v-toolbar-title>
    </v-app-bar>

    <!-- メインコンテンツ -->
    <v-main>
      <NuxtPage />
      <!-- confirm daialog -->
      <ConfirmModal ref="confirmRef" />
      <!-- loader -->
      <Loader v-if="loading" />
    </v-main>

    <!-- フッター -->
    <v-footer app color="grey-darken-3" dark>
      <v-container>
        <span>&copy; 2025 電気工事士クイズ</span>
      </v-container>
    </v-footer>
  </v-app>
</template>


<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import ConfirmModal from '~/components/ConfirmModal.vue'

import { useLoader } from '~/composables/useLoader'
import Loader from '~/components/Loader.vue'

const { loading } = useLoader()

const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null)

// refごと provide する（value ではなく）
console.log('[app.vue] setup: confirmRef 初期値 =', confirmRef.value)
provide('confirm', confirmRef)

</script>