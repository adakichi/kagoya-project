import { defineStore } from 'pinia'

export type CategoryStatus = 'not_downloaded' | 'outdated' | 'latest'

interface CategoryInfo {
  category: string
  title:  string
  version: string
  status: CategoryStatus
}

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as CategoryInfo[]
  }),
  actions: {
    setCategories(cats: CategoryInfo[]) {
      this.categories = cats
    },
    updateCategoryStatus(category: string, status: CategoryStatus) {
      const target = this.categories.find(c => c.category === category)
      if (target) target.status = status
    }
  }
})
