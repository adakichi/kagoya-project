<template>
  <v-container class="d-flex flex-column align-center justify-center" style="height: 100vh;">
    <h1 class="text-h4 mb-6">電気工事士クイズアプリ</h1>

    <v-btn 
      color="primary" 
      class="mb-4"
      @click="goToSetup"
    >
      クイズを始める
    </v-btn>

    <!-- 今後の拡張: 他のメニューを追加する余地 -->
    <v-btn 
      variant="outlined"
      @click="goToStats"
    >
      学習の進捗を見る
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToSetup() {
  router.push('quiz-setup')
}

function goToStats() {
  // 将来的に /denki/stats ページを作る想定
  router.push('stats')
}
</script>
