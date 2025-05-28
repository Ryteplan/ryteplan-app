<template>
  <v-container class="mt-4">
    <v-stepper
      v-model="currentStep"
      class="mx-auto"
      max-width="800"
      :complete="currentStep === steps.length && valid.terms"
    >
      <span class="d-block text-h7 mb-2" style="font-weight: 400">Create your Ryteplan account</span>
      <hr class="mb-4" style="border-color: #e0e0e0; border-width: 1px; border-style: solid;">
      <v-stepper-header class="d-none">
        <v-stepper-item
          v-for="step in steps"
          :key="step.title"
          :title="step.title"
          :value="step.value"
        />
      </v-stepper-header>
      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <h2 class="text-h6 mb-4">
            What best describes you?
          </h2>
          <v-form
            ref="roleForm"
            @submit.prevent
          >
            <v-radio-group
              v-model="formData.role"
              :error-messages="formData.role === '' && roleError ? 'Please select an option' : ''"
              :rules="[v => !!v || 'Role is required']"
              required
              class="align-radio-left"
            >
              <v-radio
                v-for="role in roleOptions"
                :key="role.value"
                :label="role.title"
                :value="role.value"
              />
            </v-radio-group>
          </v-form>
        </v-stepper-window-item>
        <v-stepper-window-item :value="2">
          <h2 class="text-h6 mb-4">
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
                v-if="formData.role === 'student'"
                v-model="formData.birthday"
                prepend-icon=""
                label="Date of Birth"
                :rules="[
                  v => !!v || 'Date of birth is required',
                  v => checkAge(v) || 'You must be at least 13 years old'
                ]"
                required
              />
            </v-form>
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <h2 class="text-h6 mb-4">
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
                :label="isParent ? 'Student\'s High School of Attendance' : `High School${isStudent ? ' of Attendance' : ''}`"
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
        </v-stepper-window-item>

        <v-stepper-window-item :value="4">
          <h2 class="text-h6 mb-4">
            Are you a resident of the European Union?
          </h2>
          <v-form
            ref="euResidentForm"
            @submit.prevent
          >
            <v-radio-group
              v-model="formData.euResident"
              :error-messages="formData.euResident === undefined && euResidentError ? 'Please select an option' : ''"
              required
            >
              <v-radio
                :value="true"
                label="Yes"
              />
              <v-radio
                :value="false"
                label="No"
              />
            </v-radio-group>
          </v-form>
        </v-stepper-window-item>

        <v-stepper-window-item :value="5">
          <h2 class="text-h6 mb-4">
            Do you consent to have your contact information shared with colleges so they can send you relevant information about their institutions and opportunities for students?
          </h2>
          <v-form
            ref="collegeConsentForm"
            @submit.prevent
          >
            <v-radio-group
              v-model="formData.collegeContactConsent"
              :error-messages="formData.collegeContactConsent === undefined && collegeConsentError ? 'Please select an option' : ''"
              required
            >
              <v-radio
                :value="true"
                label="Yes"
              />
              <v-radio
                :value="false"
                label="No"
              />
            </v-radio-group>
          </v-form>
        </v-stepper-window-item>

        <v-stepper-window-item :value="6">
          <v-form
            ref="termsForm"
            v-model="valid.terms"
            @submit.prevent
            class="ma-0 pa-0"
          >
            <TermsView class="ma-0 pa-0" />
            <PrivacyView />
            <v-checkbox
              v-model="formData.acceptTerms"
              :error-messages="!formData.acceptTerms && termsError ? 'You must accept the terms and privacy policy' : ''"
              label="I accept the Terms of Service and Privacy Policy"
              required
            />
            <v-checkbox
              v-model="formData.isAdult"
              :error-messages="!formData.isAdult && isAdultError ? 'You must accept the terms and privacy policy' : ''"
              :label="`By checking this box, I represent that I am ${!isStudent ? '18' : '13'} years of age or older and agree to the terms of service and privacy policy`"
              required
            />
          </v-form>
          <span v-if="(!formData.acceptTerms || !formData.isAdult)" class="mx-4 pa-4" style="margin-top: 0; border-radius: 8px; display: block; border: 1px solid lightcoral; background: #fff">You must accept the terms to create an account.</span>
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
            v-if="currentStep < steps.length"
            color="primary"
            @click="nextStep"
          >
            Continue
          </v-btn>
            <v-btn
            v-if="currentStep === steps.length && formData.acceptTerms"
            color="primary"
            @click="submitForm"
            :disabled="!valid.terms || !formData.acceptTerms"
          >
            Complete
          </v-btn>
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { differenceInYears } from 'date-fns';

import { useUserStore, validRoles, ROLE_OPTIONS } from '@/stores/userStore';
import TermsView from '@/views/TermsView.vue';
import PrivacyView from '@/views/PrivacyView.vue';
export default {
  name: 'OnboardingView',
  components: {
    TermsView,
    PrivacyView
  },
  setup() {
    const userStore = useUserStore();
    const currentStep = ref(1);
    const valid = reactive({
      personal: false,
      education: false,
      terms: false
    });

    const formData = reactive({
      firstName: userStore.userInfo.firstName || '',
      lastName: userStore.userInfo.lastName || '',
      birthday: userStore.userInfo.birthday || '',
      role: validRoles.has(userStore.userInfo.role) ? userStore.userInfo.role : '',
      highSchool: userStore.userInfo.highSchool || '',
      businessName: userStore.userInfo.businessName || '',
      graduationYear: userStore.userInfo.graduationYear || '',
      zipCode: userStore.userInfo.zipCode || '',
      euResident: userStore.userInfo.euResident || undefined,
      collegeContactConsent: userStore.userInfo.collegeContactConsent || undefined,
      acceptTerms: userStore.userInfo.acceptTerms || false,
    });

    const personalForm = ref(null);
    const educationForm = ref(null);
    const termsForm = ref(null);
    const euResidentForm = ref(null);
    const collegeConsentForm = ref(null);
    const roleForm = ref(null);
    const roleError = ref(false);

    const router = useRouter();

    const steps = [
      { title: 'Role', value: 1 },
      { title: 'Personal Info', value: 2 },
      { title: 'Education', value: 3 },
      { title: 'EU Resident', value: 4 },
      { title: 'College Contact Consent', value: 5 },
      { title: 'Terms', value: 6 }
    ];

    const isFormValid = computed(() => {
      return valid.personal && valid.education && valid.terms && formData.acceptTerms;
    });

    const euResidentError = ref(false);
    const collegeConsentError = ref(false);
    const termsError = ref(false);
    const isAdultError = ref(false);
    const nextStep = async () => {
      const validateAndProceed = async (formRef) => {
        if (formRef.value) {
          const { valid } = await formRef.value.validate();
          if (valid) currentStep.value++;
        }
      };

      if (currentStep.value === 1) {
        // Validate role selection
        if (formData.role) {
          roleError.value = false;
          currentStep.value++;
        } else {
          roleError.value = true;
        }
      } else if (currentStep.value === 2) {
        await validateAndProceed(personalForm);
      } else if (currentStep.value === 3) {
        await validateAndProceed(educationForm);
      } else if (currentStep.value === 4) {
        // Validate EU resident selection
        if (formData.euResident !== undefined) {
          euResidentError.value = false;
          currentStep.value++;
        } else {
          euResidentError.value = true;
        }
      } else if (currentStep.value === 5) {
        // Validate college contact consent
        if (formData.collegeContactConsent !== undefined) {
          collegeConsentError.value = false;
          currentStep.value++;
        } else {
          collegeConsentError.value = true;
        }
      } else if (currentStep.value === 6) {
        // For the final step, we don't want to increment currentStep
        if (termsForm.value) {
          const { valid } = await termsForm.value.validate();
          console.log('Terms form validation:', valid);
        }
      }
    }

    const submitForm = async () => {
      termsError.value = !formData.acceptTerms;
      isAdultError.value = !formData.isAdult;

      try {
        if (!formData.acceptTerms || !formData.isAdult) {
          return;
        }
        
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

    watch(() => formData.acceptTerms, (newValue) => {
      if (newValue) {
        termsError.value = false;
      }
    });

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
      euResidentForm,
      collegeConsentForm,
      isStudent,
      isParent,
      isEducator,
      checkAge,
      euResidentError,
      collegeConsentError,
      roleForm,
      roleError,
      termsError,
      isAdultError,
    };
  },
}
</script>

<style scoped>

.v-stepper.v-sheet {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;

  @media (min-width: 600px) {
    padding: 24px 24px 4px 24px;
    background: white;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
}

.v-stepper-actions {
  margin-top: 24px;
}

.v-stepper-window {
  margin: 0;
}

</style> 