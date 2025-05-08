import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
  const dialogTemplate = ref('')
  const dialogData = ref({})

  const showActionDialog = (response) => {
    dialogTemplate.value = response.missingPermissions[0]
    dialogData.value = response.data
  }

  return {
    dialogTemplate,
    dialogData,
    showActionDialog,
  }
})
