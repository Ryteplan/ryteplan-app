<template>
  <v-container class="pt-8 px-8">
    <h1>Playground</h1>
    <div>
      <TiptapInputA />
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
      content:''
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