<template>
  <v-container class="pt-8 px-8">
    <h1>Playground</h1>
    <div>
      <TiptapInputA v-model="content"/>

      {{  content  }}
    </div>
  </v-container>
 </template>
 
<script>
import TiptapInputA from "./TiptapInputA.vue"

export default {
  setup() {
  },
  mounted() {
  },
  beforeUnmount() {
  },
  data() {
    return {
      content:'hello world :)'
    }
  },
  methods: {
  },
  components: {
    TiptapInputA,
  }
};
</script>

<style>


</style>