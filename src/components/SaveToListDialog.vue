<template>
  <v-dialog
    v-model="show"
    width="700px"
  >
    <v-card>
      <div class="pa-8">
        <h2>Save to list</h2>
        <v-btn 
          color="primary" 
        >
          Create new list
        </v-btn>
      </div>
      <v-card-actions>
        <v-btn 
          color="primary" 
          block 
          @click="show=false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "SaveToListDialog",
  props: {
     value: Boolean
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>