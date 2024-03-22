<template>
    <div class="stat-container" style="position: relative">
      <div class="d-flex justify-between">
        <div>
        <span class="stat-label">{{ label }}</span>
        <span class="stat-content d-flex">
          <span class="d-block">{{ value?.toLocaleString() || '—' }}</span>
        </span>
      </div>
      <v-btn
        density="compact"
        class="ml-4"
        icon="mdi-pencil"
        @click="editMode = !editMode"
        variant="plain"
        color="primary"
      />
      </div>
      <div class="mt-4">
        <div 
          v-if="editMode"
        >
          <v-text-field
            label="Manual Value"
            v-model="this.updateValue"
            clearable
          >
          </v-text-field>

          <v-text-field
            label="Value from Petersons"
            v-model="this.valueFromPetersons"
            disabled
            >
          </v-text-field>
          <v-btn
            value="save"
            @click="this.updateDB"
          >Save</v-btn>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        editMode: false,
        currentValue: null,
        updateValue: null,
        valueFromPetersons: this.value
      }
    },
    methods: {
      updateDB() {
        console.log("whats up")
      }
    },
    props: {
      label: {
        type: String,
        required: true
      },
      value: {
        type: [Number, String],
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  /* Add your CSS styles here */
  </style>