<template>
  <v-card>
      <v-card-title>
        Account Setup Required
      </v-card-title>
      <v-card-text>
        To continue, please complete your account setup.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          to="/onboarding"
          @click="close"
        >
          Complete Account Setup
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