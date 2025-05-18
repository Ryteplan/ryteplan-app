<template>
  <div>
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
          <a href="#" class="text-white" @click.prevent="showDialog = true">Learn more</a>
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

    <v-dialog v-model="showDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Cookie Policy
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="cookie-policy-content">
            <p>The website and mobile app provided by RytePlan ("RytePlan", "we", "us", or "ours") use cookies, pixel tags and other tracking technologies (collectively "Cookies"). This Cookie Policy explains how we use Cookies and describes what options you may have regarding those Cookies. This policy is limited to RytePlan's use of Cookies only in connection with our website and mobile app (collectively referred to as our "Site") that are owned and controlled by RytePlan.</p>

            <h3 class="text-h6 mt-4 mb-2">What Are Cookies?</h3>
            <p>"Cookies" are small electronic data text files, typically consisting of letters and numbers, placed on your computer, tablet, phone, or other electronic device, when you employ that device to visit a website. Cookies are placed on your device in a limited way to help deliver advertisements, to calculate unique Site visitors, and to track usage through our Site. Other uses include placement of cookies to make the login process more convenient for users of RytePlan.com. "Pixel tags" are tiny graphic images and are used to help us analyze your online behavior. Pixel tags operate like cookies and allow us to send you email in a format you can read and let us know when you have opened an email message from us. We may use pixel tags to collect information about your visit, including the pages you view, the links you click, and other actions taken in connection with our Site and the services.</p>

            <p class="mb-2">Below is a list of the different types of Cookies we may use on our Site:</p>
            <ul class="mb-4">
              <li><strong>Essential Cookies:</strong> These Cookies are required for the operation of our Site, including to enable you to log into any secure areas of our Site and to move around the Site and use its features. Disabling these Cookies can encumber the Site's performance and may make certain features and services unavailable.</li>
              <li><strong>Analytics and Customization Cookies:</strong> These Cookies allow us to analyze activities on our Site in order to improve and optimize the way our Site works. We may use these types of Cookies to ensure that visitors can easily find the information they are looking for on our Site. One way we do this is to recognize and count the number of visitors and see how they move around our Site as they are browsing.</li>
              <li><strong>Functionality Cookies:</strong> These Cookies are used to recognize you when you return to our Site. This enables us to personalize our content for you and remember your preferences.</li>
            </ul>

            <h3 class="text-h6 mt-4 mb-2">How Do We Use Cookies?</h3>
            <p>We may use Cookies for a variety of purposes, including to:</p>
            <ul class="mb-4">
              <li>Enable you to log into any secure areas of our Site</li>
              <li>Optimize your experience on our Site</li>
              <li>Help us obtain information about your visits to our Site</li>
              <li>Process your requests</li>
              <li>Analyze your visiting patterns to optimize our Site</li>
              <li>Remember your settings and other preferences</li>
              <li>Provide a safe and secure service for online transactions</li>
              <li>Measure how many people visit our Site and how they use it to better understand our audiences</li>
              <li>Keep our Site running efficiently</li>
            </ul>

            <h3 class="text-h6 mt-4 mb-2">How Long Do Cookies Stay On My Device?</h3>
            <p>Some Cookies operate from the time you visit our Site to the end of that particular web browsing session. These Cookies expire and are automatically deleted when you close your browser or app. These Cookies are known as "session" Cookies. Some Cookies will stay on your device between browsing sessions – they do not expire when you close your browser or app. These Cookies are called "persistent" Cookies. The length of time a persistent Cookie stays on your device varies from Cookie to Cookie. We use persistent Cookies for a variety of purposes. Persistent Cookies allow us to store your preferences so that they are available for the next visit and to keep a more accurate account of how often you visit our Site and how your use of the Site may vary over time.</p>

            <h3 class="text-h6 mt-4 mb-2">Who Puts The Cookies On My Device?</h3>
            <p>Cookies may be placed on your device by RytePlan as the Site operator. These Cookies are called "first party" Cookies.</p>

            <h3 class="text-h6 mt-4 mb-2">How Do I Manage Cookies?</h3>
            <p>You can decide whether or not to accept Cookies. One way you can do this is through your browser settings. Most internet browsers allow some control of most Cookies through the browser settings. Please note that if you use your browser settings to block all Cookies you may not be able to access parts of our Site.</p>
            <p>For information on how to adjust the Cookies settings on your browser, check your browser's website.</p>

            <h3 class="text-h6 mt-4 mb-2">How to Contact Us</h3>
            <p>If you have any questions about how we use Cookies, you can contact us at: support@ryteplan.com</p>
            <p>Please include your contact information and a detailed description of your request.</p>

            <p class="mt-4"><em>Effective: 12/31/2024</em></p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="tonal"
            @click="showDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      showDialog: false
    }
  },
  mounted() {
    this.checkCookieConsent()
  },
  methods: {
    setCookie(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
    },
    getCookie(name) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    checkCookieConsent() {
      const hasConsented = this.getCookie('cookieConsent');
      if (!hasConsented) {
        this.show = true;
      }
    },
    acceptCookies() {
      this.setCookie('cookieConsent', 'true', 365); // Cookie expires in 1 year
      this.show = false;
    }
  }
}
</script>

<style>
.cookie-notification {
  max-width: 100% !important;
}

.cookie-policy-content {
  font-size: 14px;
  line-height: 1.6;
}

.cookie-policy-content ul {
  padding-left: 20px;
  margin-bottom: 16px;
}

.cookie-policy-content li {
  margin-bottom: 8px;
}

.cookie-policy-content h3 {
  font-weight: 500;
}
</style> 