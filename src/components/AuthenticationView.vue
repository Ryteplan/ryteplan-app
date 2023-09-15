<template>
  <v-container>
    <div class="AuthenticationView">
      <v-tabs
        v-model="tab"
        :transition="false"
        align-tabs="center"
        class="w-50 mx-auto"
      >
        <v-tab value="Sign Up">Sign up</v-tab>
        <v-tab value="Login">Login</v-tab>
      </v-tabs>
      <v-window class="py-12 w-50 mx-auto" v-model="tab">
        <v-window-item value="Sign Up">
          <v-btn
            @click="signInWithGoogle"
          >
            Sign up With Google
          </v-btn>
          <form class="mt-6" @submit.prevent="login"> 
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
        <v-window-item value="Login">
          <v-btn
            @click="signInWithGoogle"
          >
            Sign up With Google
          </v-btn>
          <form class="mt-6" @submit.prevent="signIn"> 
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
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
  } from 'firebase/auth';

export default {
  setup() {
  },
  mounted() {
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
        .then((result)=>{
          console.log(result);
          this.$router.push('/')
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