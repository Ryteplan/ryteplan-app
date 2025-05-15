<template>
  <v-container>
    <div class="AuthenticationView">
      <v-tabs
        v-model="tab"
        align-tabs="center"
        class="w-md-33 mx-auto"
      >
        <v-tab value="Sign Up">
          Sign up
        </v-tab>
        <v-tab value="Login">
          Login
        </v-tab>
      </v-tabs>
      <v-window
        v-model="tab"
        class="py-12 w-md-33 mx-auto text-center"
      >
        <v-window-item
          class="px-12 px-md-0"
          value="Sign Up"
        >
          <v-btn @click="signInWithGoogle" class="gsi-material-button">
              <div class="gsi-material-button-state"></div>
              <div class="gsi-material-button-content-wrapper">
                <div class="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span class="gsi-material-button-contents">Continue with Google</span>
                <span style="display: none;">Continue with Google</span>
              </div>
            </v-btn>
          <p class="mt-6 mb-6">
            Or
          </p>
          <h2>Use Email</h2>
          <form
            class="mt-6"
            @submit.prevent="register"
          >
            <v-text-field
              v-model="email"
              type="email"
              placeholder="Email address"
              required
              :rules="[rules.required, rules.email]"
            />
            <v-text-field
              v-model="password"
              type="password"
              placeholder="Password"
              required
              :rules="[rules.required, rules.minPassword]"
            />
            <v-select
              v-model="userRole"
              :items="ROLE_OPTIONS"
              label="Select Role"
              placeholder="Select your role"
              required
              outlined
              :rules="[rules.required]"
            />
            <p v-if="errorMessage" class="text-error my-2">{{ errorMessage }}</p>
            <v-btn type="submit" color="primary" block class="mt-2">
              Create Account
            </v-btn>
          </form>
        </v-window-item>
        <v-window-item
          class="px-6 text-center"
          value="Login"
        >
          <v-btn @click="signInWithGoogle" class="gsi-material-button mb-6">
             <div class="gsi-material-button-state"></div>
              <div class="gsi-material-button-content-wrapper">
                <div class="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span class="gsi-material-button-contents">Continue with Google</span>
                <span style="display: none;">Continue with Google</span>
              </div>
          </v-btn>
          <p class="mt-6 mb-6">Or</p>
          <h2>Use Email</h2>
          <form
            class="mt-6"
            @submit.prevent="signIn"
          >
            <v-text-field
              v-model="email"
              type="email"
              placeholder="Email address"
              required
              :rules="[rules.required, rules.email]"
            />
            <v-text-field
              v-model="password"
              type="password"
              placeholder="Password"
              required
              :rules="[rules.required]"
            />
            <div class="d-flex justify-end mb-2">
              <a href="#" @click.prevent="handlePasswordReset" class="text-caption">Forgot Password?</a>
            </div>
            <p v-if="errorMessage" class="text-error my-2">{{ errorMessage }}</p>
            <p v-if="resetMessage" class="text-success my-2">{{ resetMessage }}</p>
            <v-btn type="submit" color="primary" block class="mt-2">
              Login
            </v-btn>
          </form>
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc, Timestamp } from 'firebase/firestore'
import { dbFireStore } from "../firebase";
import { useUserStore, ROLE_OPTIONS } from '@/stores/userStore';

const waitForUserDocToExist = async (userRef, maxAttempts = 10, interval = 500) => {
  let currentDoc = await getDoc(userRef);
  let attempts = 0;
  while (!currentDoc.exists()) {
    currentDoc = await getDoc(userRef);
    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
    if (attempts > maxAttempts) {
      throw new Error("Timed out waiting for user collection to be created");
    }
  }
}
export default {
  setup() {
    const userStore = useUserStore();
    return {
      userStore
    }
  },
  data() {
    return {
      tab: null,
      email: "",
      password: "",
      errorMessage: "",
      resetMessage: "",
      userRole: "",
      ROLE_OPTIONS,
      rules: {
        required: value => !!value || 'Required.',
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Invalid e-mail.'
        },
        minPassword: value => value.length >= 6 || 'Min 6 characters',
      }
    }
  },
  mounted() {
    if (this.$route.query.tabDestination == "Login") {
      this.tab = "Login";
    } else {
      this.tab = "Sign Up";
    }
  },
  beforeUnmount() {
  },
  methods: {
    processErrorCode(code) {
      this.resetMessage = '';
      switch (code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'This email is already registered. Please login instead.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          this.errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'Please choose a stronger password (at least 6 characters).';
          break;
        case 'auth/network-request-failed':
          this.errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/user-not-found':
          this.errorMessage = 'No account with that email was found for login or password reset.'
          break
        case 'auth/wrong-password':
          this.errorMessage = 'Incorrect password'
          break
        default:
          this.errorMessage = 'An error occurred. Please try again.';
          break;
      }
    },
    async register() {
      this.errorMessage = '';
      this.resetMessage = '';
      if (!this.email || !this.password || !this.userRole) {
        this.errorMessage = "All fields are required for sign up.";
        return;
      }
      if (this.password.length < 6) {
        this.errorMessage = "Password must be at least 6 characters.";
        return;
      }

      const authResult = await createUserWithEmailAndPassword(getAuth(), this.email, this.password).catch((error) => {
        return new Error(error.code);
      });

      if (authResult instanceof Error) {
        this.processErrorCode(authResult.message);
        return;
      }
      const userRef = doc(dbFireStore, "users", authResult.user.uid);

      try {
        await waitForUserDocToExist(userRef);
        const newUser = {
          uid: authResult.user.uid,
          email: this.email,
          role: this.userRole,
          created: Timestamp.now(),
          updated: Timestamp.now()
        }
        await updateDoc(userRef, newUser);
        console.log("success");
        await this.userStore.loadUserInfo();
        this.$router.push('/onboarding');
      } catch (error) {
        console.error("Error during user document creation/update:", error);
        this.errorMessage = "An error occurred setting up your account data. Please try again or contact support.";
      }
    },
    signIn() {
      this.errorMessage = '';
      this.resetMessage = '';
      if (!this.email || !this.password) {
        this.errorMessage = "Email and password are required.";
        return;
      }
      signInWithEmailAndPassword(getAuth(), this.email, this.password)
        .then(async () => {
          await this.userStore.loadUserInfo();
          if (this.userStore.isSetupFinished) {
            this.$router.push('/');
          } else {
            this.$router.push('/onboarding');
          }
        })
        .catch(error => {
          this.processErrorCode(error.code);
        });
    },
    signInWithGoogle() {
      this.errorMessage = '';
      this.resetMessage = '';
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/user.birthday.read");
      signInWithPopup(getAuth(), provider)
        .then(async (result) => {
          const userRef = doc(dbFireStore, "users", result.user.uid);
          const userDoc = await getDoc(userRef);
          let birthdayFromGoogle = null;
          try {
            birthdayFromGoogle = await this.getBirthday(result._tokenResponse.oauthAccessToken);
          } catch (e) {
            console.warn("Could not fetch birthday from Google:", e)
          }

          const userBaseData = {
            "uid": result.user.uid,
            "email": result.user.email,
            "firstName": result._tokenResponse.firstName,
            "lastName": result._tokenResponse.lastName,
            ...(birthdayFromGoogle && { "birthday": birthdayFromGoogle }),
          }
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              ...userBaseData,
              role: "selfRegisteredUser",
              created: Timestamp.fromDate(new Date()),
              updated: Timestamp.fromDate(new Date()),
            });
          } else {
            const newData = {}
            const userData = userDoc.data()
            for (const key in userBaseData) {
              if (userData[key] === undefined && userBaseData[key] !== undefined) {
                newData[key] = userBaseData[key];
              }
            }
            if (Object.keys(newData).length > 0) {
              await updateDoc(userRef, newData);
            }
          }
          await this.userStore.loadUserInfo();
          if (this.userStore.isSetupFinished) {
            this.$router.push('/');
          } else {
            this.$router.push('/onboarding');
          }
        })
        .catch((error) => {
          console.error("Google Sign-In Error:", error);
          if (error.code === 'auth/popup-closed-by-user') {
            this.errorMessage = 'Google sign-in was cancelled.';
          } else if (error.code === 'auth/network-request-failed') {
            this.errorMessage = 'Network error. Please check your internet connection and try again.';
          } else {
            this.errorMessage = 'An error occurred during Google sign-in. Please try again.';
          }
        });
    },
    async getBirthday(accessToken) {
      const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        console.error("Google People API error:", response.status, await response.text());
        return null;
      }
      const data = await response.json();
      const birthdayEntry = data.birthdays?.find(b => b.date?.year && b.date?.month && b.date?.day);
      if (birthdayEntry?.date) {
        const { year, month, day } = birthdayEntry.date;
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        return `${year}-${formattedMonth}-${formattedDay}`;
      }
      return null;
    },
    async handlePasswordReset() {
      this.errorMessage = '';
      this.resetMessage = '';
      if (!this.email) {
        this.errorMessage = 'Please enter your email address to reset your password.';
        return;
      }
      try {
        await sendPasswordResetEmail(getAuth(), this.email);
        this.resetMessage = 'If this email is registered, a password reset email has been sent! <br/> Please check your inbox (and spam folder).';
      } catch (error) {
        this.processErrorCode(error.code);
      }
    }
  }
};
</script>

<style>
.gsi-material-button {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-appearance: none;
  background-color: WHITE;
  background-image: none;
  border: 1px solid #747775;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #1f1f1f;
  cursor: pointer;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  height: 40px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  -webkit-transition: background-color .218s, border-color .218s, box-shadow .218s;
  transition: background-color .218s, border-color .218s, box-shadow .218s;
  vertical-align: middle;
  white-space: nowrap;
  width: auto;
  max-width: 400px;
  min-width: min-content;
  border:0;
  text-transform: none;
  &:hover {
    background-color: white;
  }
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  margin-right: 12px;
  min-width: 20px;
  width: 20px;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  -webkit-align-items: center;
  align-items: center;
  display: flex;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.gsi-material-button .gsi-material-button-contents {
  -webkit-flex-grow: 1;
  flex-grow: 1;
  font-family: 'Roboto', arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}

.gsi-material-button .gsi-material-button-state {
  -webkit-transition: opacity .218s;
  transition: opacity .218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.gsi-material-button:disabled {
  cursor: default;
  background-color: #ffffff61;
  border-color: #1f1f1f1f;
}

.gsi-material-button:disabled .gsi-material-button-contents {
  opacity: 38%;
}

.gsi-material-button:disabled .gsi-material-button-icon {
  opacity: 38%;
}

.gsi-material-button:not(:disabled):active .gsi-material-button-state, 
.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
  background-color: #303030;
  opacity: 12%;
}

.gsi-material-button:not(:disabled):hover {
  -webkit-box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
}

.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
}
</style>