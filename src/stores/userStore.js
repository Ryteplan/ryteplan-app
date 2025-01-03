import { defineStore } from 'pinia';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const useUserStore = defineStore('user', {
  state: () => ({
      loading: true,
      userInfo: {},
      adminMode: false,
      paidUser: false,
      isLoggedIn: false
  }),
  actions: {
    async isLoggedIn() {
        let auth;
        auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.isLoggedIn = true;
            } else {
                this.isLoggedIn = false;
            }
        })
        return this.isLoggedIn;
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
