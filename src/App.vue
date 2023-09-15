<template>
  <div class="app-container">
    <v-toolbar class="px-12">
      <v-toolbar-title class="logo"><a href="/" class="logo">RytePlan</a></v-toolbar-title>
      <div v-if="!isLoggedIn">
        <v-btn 
          to="/account"
          class="no-active"
        >
          Sign up
        </v-btn>
        <v-btn 
          to="/account"
          class="no-active"
        >
          Login
        </v-btn>
      </div>
      <v-btn
        v-if="isLoggedIn"
        @click="handleSignOut" 
        class="no-active"
      >
        Logout
      </v-btn>
    </v-toolbar>
    <router-view></router-view>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"

let auth;
export default {
  mounted() {
    auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    })
  },
  data() {
    return {
      isLoggedIn: false
    }
  },
  methods: {
    handleSignOut() {
      signOut(auth).then(() =>{
        this.$router.push("/");
      })
    }
  }
};

</script>

<style>
  .v-toolbar-title.logo {
    font-weight: 700;
  }

  a.logo {
    color: #000;
    text-decoration: none;
  }

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