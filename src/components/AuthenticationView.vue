<template>
  <v-container>
    <div class="AuthenticationView">
      <v-tabs
        v-model="tab"
        align-tabs="center"
        class="w-50 mx-auto"
      >
        <v-tab value="Sign Up" disabled>Sign up</v-tab>
        <v-tab value="Login">Login</v-tab>
      </v-tabs>
      <v-window class="py-12 w-50 mx-auto text-center" v-model="tab">
        <v-window-item 
          class="px-6"
          value="Sign Up"
        >
          <v-btn
            @click="signInWithGoogle"
          >
            Sign up With Google
          </v-btn>
          <form class="mt-6 d-none" @submit.prevent="login"> 
            <v-text-field       
                type="email"       
                placeholder="Email address"       
                v-model="email"     
            />     
            <v-text-field       
                type="password"       
                placeholder="Password"       
                v-model="password"     
            />     
            <p v-if="errorMessage">{{ errorMessage }}</p>                 
            <v-btn 
              type="submit"
              @click="register"
            >
              Create Account
            </v-btn>   
          </form> 
        </v-window-item>
        <v-window-item 
          class="px-6 text-center"
          value="Login"
        >
          <v-btn
            @click="signInWithGoogle"
          >
            Login With Google
          </v-btn>
          <form class="mt-6 d-none" @submit.prevent="signIn"> 
            <v-text-field       
                type="email"       
                placeholder="Email address"       
                v-model="email"     
            />     
            <v-text-field       
                type="password"       
                placeholder="Password"       
                v-model="password"     
            />
            <p v-if="errorMessage">{{ errorMessage }}</p>                 
            <v-btn 
              type="submit"
              @click="signIn"
            >
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
import { doc, setDoc, collection, query, where, getCountFromServer, Timestamp } from 'firebase/firestore'
import { dbFireStore } from "../firebase";

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
      errorMessage: ""
    }
  },
  methods: {
    register() {
      createUserWithEmailAndPassword(getAuth(), this.email, this.password)
        .then((data)=>{
          console.log(data); 
          console.log("success")
          this.$router.push('/')
        })
        .catch((error) => {
          console.log(error.code);
          alert(error.message);
        })
    },
    signIn() {
      signInWithEmailAndPassword(getAuth(), this.email, this.password)
        .then((data)=>{
          console.log(data); 
          console.log("success")
          this.$router.push('/')
        })
        .catch(error => {
          switch (error.code) {
            case 'auth/invalid-email':
                this.errorMessage = 'Invalid email'
                break
            case 'auth/user-not-found':
                this.errorMessage = 'No account with that email was found'
                break
            case 'auth/wrong-password':
                this.errorMessage = 'Incorrect password'
                break
            default:
                this.errorMessage = 'Email or password was incorrect'
                break
          }
        });
    },
    signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      signInWithPopup(getAuth(), provider)
        .then(async (result)=>{
          
          const users = collection(dbFireStore, 'users');
          const q = query(users, where("uid", "==", result.user.uid));
          const docSnap = await getCountFromServer(q);

          if (docSnap.data().count == 0 ) {
            const userData = {
              "uid": result.user.uid,
              "email": result.user.email,
              "firstName": result._tokenResponse.firstName,
              "lastName": result._tokenResponse.lastName,
              "role": "selfRegisteredUser",
              created: Timestamp.fromDate(new Date()),
              updated: Timestamp.fromDate(new Date()),
            }
            await setDoc(doc(dbFireStore, "users", result.user.uid), {...userData});
            this.$router.push('/')
          } else {
            this.$router.push('/')
          }
        })
        .catch((error) =>{
          console.log(error);
        });
    }
  }
};
</script>

<style>


</style>