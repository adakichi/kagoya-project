<template>
  <v-container 
    class="d-flex 
    flex-column 
    align-center 
    justify-center" 
    style="height: 100%;"
    >
    <h1 class="text-h4 mb-6">電気工事士クイズアプリ</h1>

    <div class="d-flex flex-column" style="gap: 12px;">
      <v-btn
        v-for="item in menuItems"
        :key="item.label"
        :color="item.color"
        :variant="item.variant"
        @click="item.action"
      >
        {{ item.label }}
      </v-btn>
    </div>
    
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()


const menuItems = [
  {
    label: 'クイズを始める',
    color: 'primary',
    variant: 'flat',
    action: () => router.push('/quiz-setup')  // 例: 設定ページ
  },
  {
    label: '学習の進捗を見る',
    color: '',
    variant: 'outlined',
    action: () => router.push('/list')
  }
  // 今後ここに増やしていける
]

</script>
