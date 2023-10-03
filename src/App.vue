<template>
  <v-layout class="app-container">
    <v-app-bar class="px-12 elevation-1">
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
    </v-app-bar>
      <v-navigation-drawer
        v-if="isLoggedIn"
        permanent
      >
        <v-list nav>
          <v-list-item 
            to="/" 
            prepend-icon="mdi-magnify" 
            title="Institutions" 
            value="Institution Search">
          </v-list-item>
          <v-list-item 
            to="/lists" 
            prepend-icon="mdi-list-box-outline" 
            title="Lists" 
            value="Saved Lists">
          </v-list-item>
          <v-list-item 
            to="/students" 
            prepend-icon="mdi-account-school" 
            title="Students" 
            value="Students">
          </v-list-item>
          <v-list-item 
            to="/account" 
            prepend-icon="mdi-cog" 
            title="Account" 
            value="Account">
          </v-list-item>
          <v-list-item 
            prepend-icon="mdi-logout" 
            title="Logout" 
            value="Logout" 
            @click="handleSignOut"
          >
          </v-list-item>
        </v-list>
      </v-navigation-drawer>    

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-layout>
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