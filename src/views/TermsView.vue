<template>
  <v-container class="mt-4">
        <h1 class="text-h4 mb-6">Terms and Conditions</h1>
        
        <p class="mb-4">Effective Date: March 19, 2024</p>

        <p class="mb-6">Welcome to Ryteplan ("we," "us," or "our"). These Terms and Conditions ("Terms") govern your use of our web application ("App") and any related services ("Services"). By accessing or using Ryteplan, you agree to comply with and be bound by these Terms. If you do not agree, please do not use our App.</p>

        <p class="mb-6">Data Source: Peterson's Databases<br />
          Copyright 2024 Peterson's LLC · All rights reserved
        </p>

        <div v-for="(section, index) in sections" :key="index" class="mb-6">
          <h2 class="text-h6 mb-3">{{ section.title }}</h2>
          <div v-html="section.content" class="terms-content"></div>
        </div>
  </v-container>
</template>

<script>
export default {
  name: 'TermsView',
  data() {
    return {
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By using Ryteplan, you affirm that you are at least 18 years old or have reached the age of majority in your jurisdiction and have the legal capacity to enter into these Terms. If you are using the App on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.'
        },
        {
          title: '2. Changes to Terms',
          content: 'We may update these Terms from time to time. Any changes will be effective immediately upon posting on the App. Your continued use of the App after changes are posted constitutes your acceptance of the updated Terms.'
        },
        {
          title: '3. User Accounts',
          content: `
            <p>Registration: To access certain features, you may need to create an account. You agree to provide accurate, complete, and up-to-date information.</p>
            <p>Security: You are responsible for maintaining the confidentiality of your account credentials and are liable for all activities under your account.</p>
            <p>Termination: We reserve the right to suspend or terminate your account at any time if you violate these Terms.</p>
          `
        },
        {
          title: '4. Use of the App',
          content: `
            <p>License: We grant you a non-exclusive, non-transferable, revocable license to use the App for personal or organizational purposes.</p>
            <p>Restrictions: You agree not to:</p>
            <ul>
              <li>Modify, copy, or distribute the App without permission.</li>
              <li>Use the App for unlawful purposes.</li>
              <li>Interfere with the operation or security of the App.</li>
            </ul>
          `
        },
        {
          title: '5. Intellectual Property',
          content: 'All content, features, and functionality of the App, including but not limited to text, graphics, logos, and software, are owned by Ryteplan or our licensors. You may not use any content without prior written consent.'
        },
        {
          title: '6. Privacy',
          content: 'Our collection and use of your information are governed by our Privacy Policy. Please review it to understand our practices.'
        },
        {
          title: '7. Third-Party Links',
          content: 'The App may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of third-party sites. Access such sites at your own risk.'
        },
        {
          title: '8. Disclaimers',
          content: `
            <p>The App is provided "AS IS" and "AS AVAILABLE." We make no warranties regarding the reliability, accuracy, or availability of the App.</p>
            <p>To the fullest extent permitted by law, we disclaim all warranties, express or implied, including fitness for a particular purpose and non-infringement.</p>
          `
        },
        {
          title: '9. Limitation of Liability',
          content: 'To the maximum extent permitted by law, Ryteplan and its affiliates are not liable for any direct, indirect, incidental, special, or consequential damages arising from your use or inability to use the App.'
        },
        {
          title: '10. Indemnification',
          content: 'You agree to indemnify and hold Ryteplan harmless from any claims, damages, or expenses arising from your use of the App or violation of these Terms.'
        },
        {
          title: '11. Governing Law',
          content: 'These Terms are governed by and construed in accordance with the laws of Delaware, without regard to its conflict of law principles. Any disputes will be resolved in the courts of Delaware.'
        },
        {
          title: '12. Termination',
          content: 'We reserve the right to suspend or terminate your access to the App at our discretion, without prior notice, if you violate these Terms or engage in conduct harmful to Ryteplan or other users.'
        },
        {
          title: '13. Contact Us',
          content: 'For questions or concerns about these Terms, please contact us at pat@ryteplan.com'
        }
      ]
    }
  }
}
</script>

<style scoped>
.terms-content {
  line-height: 1.6;
}

.terms-content ul {
  padding-left: 20px;
  margin: 16px 0;
}

.terms-content p {
  margin-bottom: 16px;
}

.terms-content p:last-child {
  margin-bottom: 0;
}
</style> 