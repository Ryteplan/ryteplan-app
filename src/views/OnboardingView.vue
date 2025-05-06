<template>
  <v-container class="mt-4">
    <v-stepper
      v-model="currentStep"
      class="mx-auto"
      max-width="800"
    >
      <v-stepper-header>
        <v-stepper-item
          v-for="step in steps"
          :key="step.title"
          :title="step.title"
          :value="step.value"
        />
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-card class="pa-4">
            <h2 class="text-h5 mb-4">
              Personal Information
            </h2>
            <v-form
              ref="personalForm"
              v-model="valid.personal"
              @submit.prevent
            >
              <v-text-field
                v-model="formData.firstName"
                label="First Name"
                :rules="[v => !!v || 'First name is required']"
                required
              />
              <v-text-field
                v-model="formData.lastName"
                label="Last Name"
                :rules="[v => !!v || 'Last name is required']"
                required
              />
              <v-date-input
                v-model="formData.birthday"
                prepend-icon=""
                label="Date of Birth"
                :rules="[
                  v => !!v || 'Date of birth is required',
                  v => checkAge(v) || 'You must be at least 13 years old'
                ]"
                required
              />
              <v-select
                v-model="formData.role"
                :items="roleOptions"
                label="Role"
                :rules="[v => !!v || 'Role is required']"
                required
              />
            </v-form>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <v-card class="pa-4">
            <h2 class="text-h5 mb-4">
              {{ isStudent || isParent || isEducator ? 'Education Information' : 'Business Information' }}
            </h2>
            <v-form
              ref="educationForm"
              v-model="valid.education"
              @submit.prevent
            >
              <v-text-field
                v-if="isStudent || isParent || isEducator"
                v-model="formData.highSchool"
                :label="isParent ? 'Student\'s High School of Attendance' : 'High School of Attendance'"
                :rules="[v => !!v || 'High school is required']"
                required
              />
              <v-text-field
                v-if="!(isStudent || isParent || isEducator)"
                v-model="formData.businessName"
                label="Business Name"
              />
              <v-text-field
                v-if="isStudent || isParent"
                v-model="formData.graduationYear"
                :label="isStudent ? 'Graduation Year' : 'Student\'s Graduation Year'"
                type="number"
                :rules="[
                  v => !!v || 'Graduation year is required',
                  v => (v >= 1900 && v <= 3000) || 'Year must be between 1900 and 3000'
                ]"
                required
              />
              <v-text-field
                v-if="isStudent"
                v-model="formData.zipCode"
                label="Zip Code"
                :rules="[v => !!v || 'Zip code is required']"
                required
              />
            </v-form>
          </v-card>
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <v-card class="pa-4">
            <h2 class="text-h5 mb-4">
              Terms and Conditions
            </h2>
            <v-form
              ref="termsForm"
              v-model="valid.terms"
              @submit.prevent
            >
              <v-checkbox
                v-model="formData.euResident"
                label="I am a resident of the European Union"
              />
              <TermsView />
              <v-checkbox
                v-model="formData.acceptTerms"
                :rules="[v => !!v || 'You must accept the terms and privacy policy']"
                label="I accept the Terms of Service and Privacy Policy"
                required
              />
            </v-form>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions>
        <template #prev>
          <v-btn
            :disabled="currentStep === 1"
            variant="text"
            @click="currentStep--"
          >
            Back
          </v-btn>
        </template>

        <v-spacer />

        <template #next>
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
            :disabled="false"
            @click="submitForm"
          >
            Complete
          </v-btn>
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { differenceInYears } from 'date-fns';

import { useUserStore, validRoles, ROLE_OPTIONS } from '@/stores/userStore';
import TermsView from '@/views/TermsView.vue';

export default {
  name: 'OnboardingView',
  components: {
    TermsView
  },
  setup() {
    const userStore = useUserStore();
    const currentStep = ref(1);
    const valid = reactive({
      personal: false,
      education: false,
      terms: false
    });

    console.log(userStore.userInfo)

    const formData = reactive({
      firstName: userStore.userInfo.firstName || '',
      lastName: userStore.userInfo.lastName || '',
      birthday: userStore.userInfo.birthday || '',
      role: validRoles.has(userStore.userInfo.role) ? userStore.userInfo.role : '',
      highSchool: userStore.userInfo.highSchool || '',
      businessName: userStore.userInfo.businessName || '',
      graduationYear: userStore.userInfo.graduationYear || '',
      zipCode: userStore.userInfo.zipCode || '',
      euResident: userStore.userInfo.euResident || false,
      acceptTerms: userStore.userInfo.acceptTerms || false,
    });

    const personalForm = ref(null);
    const educationForm = ref(null);
    const termsForm = ref(null);

    const router = useRouter();

    const steps = [
      { title: 'Personal Info', value: 1 },
      { title: 'Education', value: 2 },
      { title: 'Terms', value: 3 }
    ];

    const isFormValid = computed(() => {
      return valid.personal && valid.education && valid.terms;
    });

    const nextStep = async () => {
      const validateAndProceed = async (formRef) => {
        if (formRef.value) {
          const { valid } = await formRef.value.validate();
          if (valid) currentStep.value++;
        }
      };

      if (currentStep.value === 1) {
        await validateAndProceed(personalForm);
      } else if (currentStep.value === 2) {
        await validateAndProceed(educationForm);
      }
    }

    const submitForm = async () => {
      try {
        if (!personalForm.value || !educationForm.value || !termsForm.value) {
          console.error('Form references are not initialized');
          return;
        }

        const [personalValid, educationValid, termsValid] = await Promise.all([
          personalForm.value.validate(),
          educationForm.value.validate(),
          termsForm.value.validate()
        ]);

        if (personalValid.valid && educationValid.valid && termsValid.valid) {
          userStore.updateUser(formData);
          router.push('/');
        }
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    const isStudent = computed(() => {
      return formData.role === 'student';
    });

    const isParent = computed(() => {
      return formData.role === 'guardian';
    });

    const isEducator = computed(() => {
      return formData.role === 'educator';
    });

    const checkAge = (date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = differenceInYears(today, birthDate);
      return age > 12;
    };

    return {
      currentStep,
      steps,
      valid,
      formData,
      roleOptions: ROLE_OPTIONS,
      isFormValid,
      nextStep,
      submitForm,
      personalForm,
      educationForm,
      termsForm,
      isStudent,
      isParent,
      isEducator,
      checkAge,
    };
  },
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