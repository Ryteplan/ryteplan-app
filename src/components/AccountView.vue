<template>
  <v-container>
    <v-card class="mx-auto my-8" max-width="800">
      <v-card-title class="text-h4 mb-4">
        Account Settings
      </v-card-title>
      
      <v-card-text v-if="userStore.loading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <span class="ml-2">Loading account information...</span>
      </v-card-text>
      
      <v-card-text v-else-if="!userStore.isLoggedIn">
        <p>You need to be logged in to view account settings.</p>
        <v-btn color="primary" class="mt-4" :to="'/login'">
          Log In
        </v-btn>
      </v-card-text>
      
      <template v-else>
        <v-card-text>
          <!-- Personal Information Section -->
          <h3 class="text-h6 mb-4">Personal Information</h3>

          <v-btn color="outline" prepend-icon="mdi-account-edit" :to="'/onboarding'" class="mb-4">
            Edit Profile Information
          </v-btn>

          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">Email</div>
                <div>{{ userStore.userInfo.email || 'Not provided' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">Name</div>
                <div>{{ fullName }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">Role</div>
                <div>{{ displayRole }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6" v-if="userStore.userInfo.birthday">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">Date of Birth</div>
                <div>{{ formattedBirthday }}</div>
              </div>
            </v-col>
          </v-row>

          <!-- Education/Business Information Section -->
          <h3 class="text-h6 mt-6 mb-4">{{ educationOrBusinessTitle }}</h3>
          <v-row>
            <template v-if="isStudent || isParent || isEducator">
              <v-col cols="12" md="6" v-if="userStore.userInfo.highSchool">
                <div class="mb-4">
                  <div class="text-subtitle-1 font-weight-bold">{{ highSchoolLabel }}</div>
                  <div>{{ userStore.userInfo.highSchool }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="(isStudent || isParent) && userStore.userInfo.graduationYear">
                <div class="mb-4">
                  <div class="text-subtitle-1 font-weight-bold">{{ graduationYearLabel }}</div>
                  <div>{{ userStore.userInfo.graduationYear }}</div>
                </div>
              </v-col>
            </template>
            <template v-else> 
              <v-col cols="12" md="6" v-if="userStore.userInfo.businessName">
                <div class="mb-4">
                  <div class="text-subtitle-1 font-weight-bold">Business Name</div>
                  <div>{{ userStore.userInfo.businessName }}</div>
                </div>
              </v-col>
            </template>
            <v-col cols="12" md="6" v-if="isStudent && userStore.userInfo.zipCode">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">Zip Code</div>
                <div>{{ userStore.userInfo.zipCode }}</div>
              </div>
            </v-col>
             <v-col cols="12" v-if="noEducationOrBusinessInfo">
                <p>No additional information provided for this role.</p>
            </v-col>
          </v-row>

          <!-- Terms and Consent Section -->
          <h3 class="text-h6 mt-6 mb-4">Terms & Consent</h3>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">EU Resident</div>
                <div>{{ userStore.userInfo.euResident ? 'Yes' : 'No' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">College Contact Consent</div>
                <div>{{ collegeContactConsentText }}</div>
              </div>
            </v-col>
             <v-col cols="12">
              <div class="mb-4">
                <div class="text-subtitle-1 font-weight-bold">Terms Accepted</div>
                <div>{{ userStore.userInfo.acceptTerms ? 'Yes' : 'No' }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-divider class="mx-4 my-4"></v-divider>
        
        <v-card-actions class="pa-4 d-flex justify-space-between">
          <v-btn 
            color="error" 
            prepend-icon="mdi-delete" 
            variant="outlined"
            @click="confirmDeleteDialog = true"
            :disabled="userStore.loading || !userStore.isLoggedIn"
          >
            Delete Account
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
    
    <!-- Delete Account Confirmation Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          Delete Account
        </v-card-title>
        
        <v-card-text class="pt-4">
          <p class="text-body-1 mb-2">Are you sure you want to delete your account? This action cannot be undone.</p>
          <p class="text-body-1 mb-2">Your authentication record will be permanently removed.</p>
          
          <v-alert type="warning" class="mb-4">
            You will be immediately logged out and cannot recover your account after deletion.
          </v-alert>
          
          <v-text-field
            v-model="deleteConfirmation"
            label="Type 'DELETE' to confirm"
            variant="outlined"
            class="mt-2"
            :disabled="isDeleting || showReAuthPasswordDialog"
          ></v-text-field>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="closeConfirmDeleteDialog"
            :disabled="isDeleting || showReAuthPasswordDialog"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat" 
            @click="handleInitialDeleteAttempt"
            :disabled="deleteConfirmation !== 'DELETE' || isDeleting || showReAuthPasswordDialog"
            :loading="isDeleting && !showReAuthPasswordDialog"
          >
            Delete Account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Re-authenticate with Password Dialog -->
    <v-dialog v-model="showReAuthPasswordDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h5">
          Re-authenticate to Delete
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="text-body-1 mb-2">For security, please re-enter your password to confirm account deletion.</p>
          <v-text-field
            v-model="reAuthPassword"
            label="Password"
            type="password"
            variant="outlined"
            class="mt-2"
            @keyup.enter="handlePasswordReAuthSubmit"
            :error-messages="reAuthError"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="cancelReAuth"
            :disabled="isReAuthenticating"
          >
            Cancel Deletion
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            @click="handlePasswordReAuthSubmit"
            :loading="isReAuthenticating"
          >
            Confirm & Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>
 
<script>
import { useUserStore, ROLE_OPTIONS } from '../stores/userStore'; // Ensure ROLE_OPTIONS is exported from userStore
import { format, parseISO } from 'date-fns';
import { deleteUser, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup } from 'firebase/auth';
// Firestore imports are present if you re-add Firestore data deletion
// import { doc, deleteDoc } from 'firebase/firestore'; 
// import { dbFireStore } from "../firebase";

export default {
  setup() {
    const userStore = useUserStore();
    // Ensure user info is loaded if not already
    if (!userStore.userInfo.uid && !userStore.loading) {
        userStore.loadUserInfo();
    }
    return { userStore, ROLE_OPTIONS };
  },
  data() {
    return {
      confirmDeleteDialog: false,
      deleteConfirmation: '',
      isDeleting: false, 
      showReAuthPasswordDialog: false,
      reAuthPassword: '',
      isReAuthenticating: false, 
      reAuthError: ''
    }
  },
  computed: {
    fullName() {
      const { firstName, lastName } = this.userStore.userInfo;
      return [firstName, lastName].filter(Boolean).join(' ') || 'Not provided';
    },
    displayRole() {
      const roleInfo = ROLE_OPTIONS.find(r => r.value === this.userStore.userInfo.role);
      return roleInfo ? roleInfo.title : (this.userStore.userInfo.role || 'Not provided');
    },
    formattedBirthday() {
      if (!this.userStore.userInfo.birthday) return 'Not provided';
      try {
        return format(parseISO(this.userStore.userInfo.birthday), 'MMMM d, yyyy');
      } catch (e) {
        console.error('Error formatting birthday:', e, this.userStore.userInfo.birthday);
        return this.userStore.userInfo.birthday; // Fallback to raw value
      }
    },
    formattedCreatedAt() {
      if (!this.userStore.userInfo.createdAt) return 'Not provided';
      try {
        // Firestore Timestamps have a toDate() method
        if (this.userStore.userInfo.createdAt.toDate) {
          return format(this.userStore.userInfo.createdAt.toDate(), 'MMMM d, yyyy, h:mm a');
        } else {
          // Fallback for string or number timestamps (though Firestore usually provides Timestamp objects)
          return format(new Date(this.userStore.userInfo.createdAt), 'MMMM d, yyyy, h:mm a');
        }
      } catch (e) {
        console.error('Error formatting createdAt:', e, this.userStore.userInfo.createdAt);
        return 'Unknown';
      }
    },
    isStudent() {
      return this.userStore.userInfo.role === 'student';
    },
    isParent() {
      return this.userStore.userInfo.role === 'guardian';
    },
    isEducator() {
      return this.userStore.userInfo.role === 'educator';
    },
    educationOrBusinessTitle() {
      if (this.isStudent || this.isParent || this.isEducator) return 'Education Information';
      return 'Business Information';
    },
    highSchoolLabel() {
      if (this.isParent) return "Student's High School of Attendance";
      if (this.isStudent) return "High School of Attendance";
      return "High School";
    },
    graduationYearLabel() {
      if (this.isParent) return "Student's Graduation Year";
      return "Graduation Year";
    },
    collegeContactConsentText() {
      const consent = this.userStore.userInfo.collegeContactConsent;
      if (consent === true) return 'Yes, consented to college contact.';
      if (consent === false) return 'No, declined college contact.';
      return 'Not specified';
    },
    noEducationOrBusinessInfo() {
        if (this.isStudent || this.isParent || this.isEducator) {
            return !this.userStore.userInfo.highSchool && !this.userStore.userInfo.graduationYear;
        }
        return !this.userStore.userInfo.businessName;
    }
  },
  methods: {
    closeConfirmDeleteDialog() {
      this.confirmDeleteDialog = false;
      this.deleteConfirmation = '';
      this.isDeleting = false;
    },
    cancelReAuth() {
      this.showReAuthPasswordDialog = false;
      this.reAuthPassword = '';
      this.reAuthError = '';
      this.isReAuthenticating = false;
      this.closeConfirmDeleteDialog();
    },
    async handleInitialDeleteAttempt() {
      if (this.deleteConfirmation !== 'DELETE') return;
      this.isDeleting = true;
      this.reAuthError = '';
      await this.executeDeletionSequence();
    },
    async executeDeletionSequence(isAfterReAuth = false) {
      try {
        const user = this.userStore.auth.currentUser;
        if (!user) {
          throw new Error("User not found. Please log in again.");
        }
        
        await deleteUser(user);
        
        await this.userStore.logout();
        this.$router.push({ path: '/', query: { accountDeleted: 'true' } });
        this.closeConfirmDeleteDialog();

      } catch (error) {
        console.error('Error during deletion sequence:', error);
        if (error.code === 'auth/requires-recent-login' && !isAfterReAuth) {
          this.isDeleting = false; 
          const currentUser = this.userStore.auth.currentUser;
          if (currentUser && currentUser.providerData.length > 0) {
            const providerId = currentUser.providerData[0].providerId;
            if (providerId === 'password') {
              this.showReAuthPasswordDialog = true;
            } else if (providerId === 'google.com') {
              await this.handleGoogleReAuthAndRetry();
            } else {
              alert('Your session requires re-authentication. Please log out, log back in, and then try deleting your account again.');
              await this.userStore.logout();
              this.$router.push('/login');
              this.closeConfirmDeleteDialog();
            }
          } else {
            alert('Could not determine authentication provider. Please log out and log in again.');
            await this.userStore.logout();
            this.$router.push('/login');
            this.closeConfirmDeleteDialog();
          }
        } else {
          alert(`Failed to delete account: ${error.message}`);
          this.closeConfirmDeleteDialog(); 
        }
      } finally {
        if (!this.showReAuthPasswordDialog) {
            this.isDeleting = false;
        }
      }
    },
    async handlePasswordReAuthSubmit() {
      if (!this.reAuthPassword) {
        this.reAuthError = 'Password is required.';
        return;
      }
      this.isReAuthenticating = true;
      this.reAuthError = '';
      try {
        const user = this.userStore.auth.currentUser;
        if (!user) throw new Error("User not found for re-authentication.");

        const credential = EmailAuthProvider.credential(user.email, this.reAuthPassword);
        await reauthenticateWithCredential(user, credential);
        
        this.showReAuthPasswordDialog = false;
        this.reAuthPassword = '';
        this.isDeleting = true; 
        await this.executeDeletionSequence(true); 
      } catch (err) {
        console.error('Password re-authentication failed:', err);
        this.reAuthError = err.message || 'Incorrect password or re-authentication failed.';
      } finally {
        this.isReAuthenticating = false;
      }
    },
    async handleGoogleReAuthAndRetry() {
      this.isDeleting = true; 
      try {
        const user = this.userStore.auth.currentUser;
        if (!user) throw new Error("User not found for Google re-authentication.");

        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        
        await this.executeDeletionSequence(true); 
      } catch (err) {
        console.error('Google re-authentication failed:', err);
        alert(`Google re-authentication failed: ${err.message}. You might need to log out and log back in to proceed.`);
        this.isDeleting = false; 
      }
    }
  }
};
</script>

<style>
.v-card-title {
  word-break: normal;
}
</style>