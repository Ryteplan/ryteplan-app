<template>
  <div class="app-container">
    <v-toolbar class="px-12">
      <v-toolbar-title>RytePlan</v-toolbar-title>
      <v-btn 
        to="/account"
        class="no-active"
      >
        Login
      </v-btn>
      <v-btn 
        to="/account"
        class="no-active"
      >
        Sign up
      </v-btn>
    </v-toolbar>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
};
</script>

<style>
  .v-toolbar__content {
    margin: 0 auto;
  }

  .no-active .v-btn__overlay {
    display: none;
  }

  a {
    color: blue;
  }
</style>