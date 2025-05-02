<template>
  <v-container class="mt-4">
    <v-stepper v-model="currentStep" class="mx-auto" max-width="800">
      <v-stepper-header>
        <v-stepper-item
          v-for="step in steps"
          :key="step.title"
          :title="step.title"
          :value="step.value"
        ></v-stepper-item>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-card class="pa-4">
            <h2 class="text-h5 mb-4">Personal Information</h2>
            <v-form ref="personalForm" v-model="valid.personal">
              <v-text-field
                v-model="formData.firstName"
                label="First Name"
                :rules="[v => !!v || 'First name is required']"
                required
              ></v-text-field>
              <v-text-field
                v-model="formData.lastName"
                label="Last Name"
                :rules="[v => !!v || 'Last name is required']"
                required
              ></v-text-field>
              <v-text-field
                v-model="formData.birthday"
                label="Date of Birth"
                type="date"
                :rules="[v => !!v || 'Date of birth is required']"
                required
              ></v-text-field>
              <v-select
                v-model="formData.role"
                :items="roleOptions"
                label="Role"
                :rules="[v => !!v || 'Role is required']"
                required
              ></v-select>
            </v-form>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <v-card class="pa-4">
            <h2 class="text-h5 mb-4">Education Information</h2>
            <v-form ref="educationForm" v-model="valid.education">
              <v-text-field
                v-model="formData.highSchool"
                label="High School of Attendance"
                :rules="[v => !!v || 'High school is required']"
                required
              ></v-text-field>
              <v-text-field
                v-model="formData.businessName"
                label="Business Name"
              ></v-text-field>
              <v-text-field
                v-model="formData.graduationYear"
                label="Graduation Year"
                type="number"
                :rules="[
                  v => !!v || 'Graduation year is required',
                  v => (v >= 1900 && v <= 3000) || 'Year must be between 1900 and 3000'
                ]"
                required
              ></v-text-field>
              <v-text-field
                v-if="formData.role === 'student'"
                v-model="formData.zipCode"
                label="Zip Code"
                :rules="[v => !!v || 'Zip code is required']"
                required
              ></v-text-field>
            </v-form>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <v-card class="pa-4">
            <h2 class="text-h5 mb-4">Terms and Conditions</h2>
            <v-form ref="termsForm" v-model="valid.terms">
              <v-checkbox
                v-model="formData.euResident"
                label="I am a resident of the European Union"
              ></v-checkbox>
              <v-checkbox
                v-model="formData.acceptTerms"
                :rules="[v => !!v || 'You must accept the terms and privacy policy']"
                label="I accept the Terms of Service and Privacy Policy"
                required
              ></v-checkbox>
            </v-form>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions>
        <template v-slot:prev>
          <v-btn
              :disabled="currentStep === 1"
              variant="text"
              @click="currentStep--"
          >
            Back
          </v-btn>
        </template>

        <v-spacer></v-spacer>

        <template v-slot:next>
          <v-btn
            v-if="currentStep < 3"
            color="primary"
            @click="nextStep"
          >
            Continue
          </v-btn>

          <v-btn
            v-if="currentStep === 3"
            color="primary"
            @click="submitForm"
            :disabled="false"
          >
            Complete
          </v-btn>
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script>
export default {
  name: 'OnboardingView',
  data() {
    return {
      currentStep: 1,
      steps: [
        { title: 'Personal Info', value: 1 },
        { title: 'Education', value: 2 },
        { title: 'Terms', value: 3 }
      ],
      valid: {
        personal: false,
        education: false,
        terms: false
      },
      formData: {
        firstName: '',
        lastName: '',
        birthday: '',
        role: '',
        highSchool: '',
        businessName: '',
        graduationYear: null,
        zipCode: '',
        euResident: false,
        acceptTerms: false
      },
      roleOptions: [
        { title: 'Student', value: 'student' },
        { title: 'Parent / Guardian', value: 'guardian' },
        { title: 'School Counselor', value: 'educator' },
        { title: 'CBO', value: 'educator' },
        { title: 'IEC', value: 'educator' },
        { title: 'Other', value: 'educator' }
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.valid.personal && this.valid.education && this.valid.terms;
    }
  },
  methods: {
    nextStep() {
      console.log(this.currentStep, "currentStep");
      let formRef;
      if (this.currentStep === 1) {
        formRef = this.$refs.personalForm;
      } else if (this.currentStep === 2) {
        formRef = this.$refs.educationForm;
      }

      if (formRef) {
        console.log(formRef);
        formRef.validate().then(({ valid }) => {
          if (valid) {
            this.currentStep++;
          }
        });
      }
    },
    async submitForm() {
      const validForms =await Promise.all([
        this.$refs.personalForm.validate(),
        this.$refs.educationForm.validate(),
        this.$refs.termsForm.validate()
      ]);

      if (this.isFormValid && validForms.every(v => v)) {
        // TODO: Implement form submission logic
        console.log('Form submitted:', this.formData);
        // Redirect to dashboard or next step
        this.$router.push('/');
      }
    }
  }
}
</script>

<style scoped>
.v-stepper {
  background: transparent !important;
}

.v-card {
  background: rgba(255, 255, 255, 0.5) !important;
}
</style> 