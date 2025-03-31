import { defineStore } from 'pinia';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { dbFireStore } from "../firebase";

export const useUserStore = defineStore('user', {
  state: () => ({
      loading: true,
      userInfo: {},
      adminMode: false,
      paidUser: false,
      isLoggedIn: false,
      isAdmin: false,
  }),
  actions: {
    async getIsLoggedIn() {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.isLoggedIn = true;
            // Get user doc from Firestore
            const userDoc = await getDoc(doc(dbFireStore, 'users', user.uid));
            if (userDoc.exists()) {
              console.log('userDoc', userDoc.data());
              this.isAdmin = userDoc.data().isAdmin || false;
              console.log(this.isAdmin);
            }
          } else {
            this.isLoggedIn = false;
            this.isAdmin = false;
          }
          this.loading = false;
        });
    },
    getAdminMode() {
        if (localStorage.getItem("adminMode") !== null) {
            this.adminMode = localStorage.getItem("adminMode") === 'true';
        } else {
            this.adminMode = false;
        }
        return this.adminMode;
    },
    saveAdminModeState() {
        localStorage.setItem("adminMode", this.adminMode);
    }
  }
});
