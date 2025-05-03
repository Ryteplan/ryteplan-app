<template>
  <v-card>
    <v-card-title>
      {{ dialogStore.dialogData.title }}
    </v-card-title>
    <v-card-text>
      {{ dialogStore.dialogData.message }}
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="close">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { defineEmits } from 'vue'
import { useDialogStore } from '@/stores/dialogStore'

const dialogStore = useDialogStore()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>