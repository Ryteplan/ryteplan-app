<template>
  <v-container class="pt-4">
    <div v-if="!userID" class="text-center">
      <h2 class="text-h5 mb-4">Please Sign In</h2>
      <p class="text-body-1 mb-6">
        You need to create an account or sign in to view and manage your lists.
      </p>
      <v-btn color="primary" :to="`/login${redirect}`">
        Login or Create an account
      </v-btn>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "LoginWarningView",
  computed: {
    redirect() {
      if (this.$route.query.redirect) {
        return `?redirect=${this.$route.query.redirect}`;
      } else {
        return "";
      }
    },
  },
};
</script>
