<template>
  <v-container>
    <div class="AuthenticationView">
      <form @submit.prevent="login">     
          <h2>Login</h2>     
          <input       
              type="email"       
              placeholder="Email address..."       
              v-model="email"     
          />     
          <input       
              type="password"       
              placeholder="password..."       
              v-model="password"     
          />     
          <button type="submit">
              Login
          </button>   
      </form> 
    </div>      
  </v-container>
</template>
 
<script>

export default {
  setup() {
  },
  mounted() {
  },
  beforeUnmount() {
  },
  data() {
    return {
    }
  },
  methods: {
  }
};
</script>

<style>


</style>