<template>
  <v-container>
    <div class="AuthenticationView">
      <v-tabs
        v-model="tab"
        align-tabs="center"
        class="w-50 mx-auto"
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
        class="py-12 w-50 mx-auto text-center"
      >
        <v-window-item
          class="px-6"
          value="Sign Up"
        >
          <v-btn @click="signInWithGoogle">
            Sign in with Google
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
            />
            <v-text-field
              v-model="password"
              type="password"
              placeholder="Password"
            />
            <v-select
              v-model="userRole"
              :items="ROLE_OPTIONS"
              label="Select Role"
              placeholder="Select your role"
              required
              outlined
            />
            <p v-if="errorMessage">
              {{ errorMessage }}
            </p>
            <v-btn type="submit">
              Create Account
            </v-btn>
          </form>
        </v-window-item>
        <v-window-item
          class="px-6 text-center"
          value="Login"
        >
          <v-btn @click="signInWithGoogle">
            Login With Google
          </v-btn>
          <p class="mt-6 mb-6">
            Or
          </p>
          <h2>Use Email</h2>
          <form
            class="mt-6"
            @submit.prevent="signIn"
          >
            <v-text-field
              v-model="email"
              type="email"
              placeholder="Email address"
            />
            <v-text-field
              v-model="password"
              type="password"
              placeholder="Password"
            />
            <p v-if="errorMessage">
              {{ errorMessage }}
            </p>
            <v-btn type="submit">
              Login
            </v-btn>
          </form>
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
      userRole: "",
      ROLE_OPTIONS,
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
          this.errorMessage = 'No account with that email was found'
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
      const authResult = await createUserWithEmailAndPassword(getAuth(), this.email, this.password).catch((error) => {
        return new Error(error.code);
      });

      if (authResult instanceof Error) {
        this.processErrorCode(authResult.message);
        return;
      }
      const userRef = doc(dbFireStore, "users", authResult.user.uid);

      // Wait for the user collection to be created
      // because Rowy Extension overwrites the document
      await waitForUserDocToExist(userRef);

      const newUser = {
        uid: authResult.user.uid,
        role: this.userRole,
        updated: Timestamp.now()
      }
      await updateDoc(userRef, newUser);

      console.log("success");
      await this.userStore.loadUserInfo();
      this.$router.push('/onboarding');
    },
    signIn() {
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
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/user.birthday.read");
      signInWithPopup(getAuth(), provider)
        .then(async (result) => {
          const userRef = doc(dbFireStore, "users", result.user.uid);
          const userDoc = await getDoc(userRef);
          const userBaseData = {
            "uid": result.user.uid,
            "email": result.user.email,
            "firstName": result._tokenResponse.firstName,
            "lastName": result._tokenResponse.lastName,
            "role": "selfRegisteredUser",
            "birthday": await this.getBirthday(result._tokenResponse.oauthAccessToken),
          }
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              ...userBaseData,
              created: Timestamp.fromDate(new Date()),
              updated: Timestamp.fromDate(new Date()),
            });
          } else {
            const newData = {}
            const userData = userDoc.data()
            for (const key in userBaseData) {
              if (userData[key] === undefined) {
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
          console.log(error);
        });
    },
    async getBirthday(accessToken) {
      // Use the access token to call Google People API
      const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      const date = data.birthdays?.[0].date;
      console.log('date:', date);
      if (date) {
        const birthday = [date.year, date.month, date.day].join('-')
        console.log('birthday:', birthday);
        return birthday;
      } else {
        return null;
      }
      // const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
      // const data = await response.json();
      // console.log('Birthday:', data);
      // return data.birthday;
    }
  }
};
</script>

<style></style>