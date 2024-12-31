<template>
  <v-snackbar
    v-model="show"
    location="bottom"
    :timeout="-1"
    color="grey-darken-3 mb-12"
    class="cookie-notification"
  >
    <div class="d-flex align-center">
      <span class="flex-grow-1">
        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        <router-link to="/terms" class="text-white">Learn more</router-link>
      </span>
      <v-btn
        color="white"
        variant="tonal"
        @click="acceptCookies"
        class="shrink ml-4"
      >
        Accept
      </v-btn>
    </div>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  mounted() {
    this.checkCookieConsent()
  },
  methods: {
    checkCookieConsent() {
      const hasConsented = localStorage.getItem('cookieConsent')
      if (!hasConsented) {
        this.show = true
      }
    },
    acceptCookies() {
      localStorage.setItem('cookieConsent', 'true')
      this.show = false
    }
  }
}
</script>

<style>
.cookie-notification {
  max-width: 100% !important;
}
</style> 