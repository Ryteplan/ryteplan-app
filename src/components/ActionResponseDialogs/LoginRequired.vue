<template>
  <v-card>
    <v-card-title>
      Login Required
    </v-card-title>
    <v-card-text>
      Please login to continue.
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" to="/login" @click="close">
        Login
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>