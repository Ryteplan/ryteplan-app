<template>
  <v-container>
    <div class="AuthenticationView">
      <v-tabs v-model="tab" align-tabs="center" class="w-50 mx-auto">
        <v-tab value="Sign Up">Sign up</v-tab>
        <v-tab value="Login">Login</v-tab>
      </v-tabs>
      <v-window class="py-12 w-50 mx-auto text-center" v-model="tab">
        <v-window-item class="px-6" value="Sign Up">
          <v-btn @click="signInWithGoogle">
            Sign in with Google
          </v-btn>
          <p class="mt-6 mb-6">Or</p>
          <h2>Use Email</h2>
          <form class="mt-6" @submit.prevent="register">
            <v-text-field type="email" placeholder="Email address" v-model="email" />
            <v-text-field type="password" placeholder="Password" v-model="password" />
            <v-select :items="[
              { text: 'Student', value: 'student' },
              { text: 'Educator', value: 'educator' },
              { text: 'Parent/Guardian', value: 'guardian' }
            ]" v-model="userRole" label="Select Role" placeholder="Select your role" required outlined
              item-title="text" item-value="value" />
            <p v-if="errorMessage">{{ errorMessage }}</p>
            <v-btn type="submit">
              Create Account
            </v-btn>
          </form>
        </v-window-item>
        <v-window-item class="px-6 text-center" value="Login">
          <v-btn @click="signInWithGoogle">
            Login With Google
          </v-btn>
          <p class="mt-6 mb-6">Or</p>
          <h2>Use Email</h2>
          <form class="mt-6" @submit.prevent="signIn">
            <v-text-field type="email" placeholder="Email address" v-model="email" />
            <v-text-field type="password" placeholder="Password" v-model="password" />
            <p v-if="errorMessage">{{ errorMessage }}</p>
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
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getCountFromServer, Timestamp } from 'firebase/firestore'
import { dbFireStore } from "../firebase";


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
  data() {
    return {
      tab: null,
      email: "",
      password: "",
      errorMessage: "",
      userRole: ""
    }
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
        role: this.userRole,
        updated: Timestamp.now()
      }
      await updateDoc(userRef, newUser);

      console.log("success");
      this.$router.push('/');
    },
    signIn() {
      signInWithEmailAndPassword(getAuth(), this.email, this.password)
        .then((data) => {
          console.log(data);
          console.log("success")
          this.$router.push('/')
        })
        .catch(error => {
          this.processErrorCode(error.code);
        });
    },
    signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      signInWithPopup(getAuth(), provider)
        .then(async (result) => {

          const users = collection(dbFireStore, 'users');
          const q = query(users, where("uid", "==", result.user.uid));
          const docSnap = await getCountFromServer(q);

          if (docSnap.data().count == 0) {
            const userData = {
              "uid": result.user.uid,
              "email": result.user.email,
              "firstName": result._tokenResponse.firstName,
              "lastName": result._tokenResponse.lastName,
              "role": "selfRegisteredUser",
              created: Timestamp.fromDate(new Date()),
              updated: Timestamp.fromDate(new Date()),
            }
            await setDoc(doc(dbFireStore, "users", result.user.uid), { ...userData });
            this.$router.push('/')
          } else {
            this.$router.push('/')
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
};
</script>

<style></style>