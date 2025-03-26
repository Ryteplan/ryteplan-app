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
    async getIsLoggedIn() {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          this.isLoggedIn = !!user;  // Update the state property
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
