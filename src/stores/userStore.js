import { defineStore } from 'pinia';
import { format } from 'date-fns';

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { dbFireStore } from "../firebase";

/**
* User type definition
* @typedef {Object} User
* @property {string} email
* @property {string} role
* @property {string} labelRole
* @property {string} firstName
* @property {string} lastName
* @property {string} birthday
* @property {string} highSchool
* @property {string} businessName
* @property {string} graduationYear
* @property {string} zipCode
* @property {string} euResident
* @property {string} acceptTerms
* @property {string} uid
* @property {string} createdAt
* @property {string} updatedAt
* @property {boolean} isAdmin
*/


export const validRoles = ['guardian', 'student', 'educator'];

export const useUserStore = defineStore('user', {
  state: () => ({
      loading: true,
      /**
       * User info
       * @type {User}
       */
      userInfo: {},
      /**
       * Firebase auth instance
       * @type {import('firebase/auth').Auth}
       */
      auth: null,
      adminMode: false,
  }),
  getters: {
    isSetupFinished() {
      return Boolean(this.isLoggedIn && validRoles.includes(this.userInfo.role) && this.userInfo.firstName && this.userInfo.lastName);
    },
    isLoggedIn() {
      return Boolean(this.userInfo.email);
    },
    isAdmin() {
      return Boolean(this.userInfo.isAdmin && this.adminMode);
    },
    paidUser() {
      return false;
    },
    permissions() {
      const permissions = [];
      if (this.isAdmin) {
        permissions.push('admin')
      }
      if (this.isSetupFinished) {
        permissions.push('accountSetup')
      }
      if (this.isLoggedIn) {
        permissions.push('loggedIn')
      }
      return [
        ...permissions,
        ...(this.userInfo.permissions || []),
      ]
    }
  },
  actions: {
    async logout() {
      this.userInfo = {};
      await signOut(this.auth);
    },
    /**
     * Load user info from Firestore
     */
    async loadUserInfo() {
      this.auth = getAuth();
      this.adminMode = localStorage.getItem("adminMode") === 'true';
      await this.auth.authStateReady()
      await this.processCurrentUser(this.auth.currentUser)
      this.loading = false;
      onAuthStateChanged(this.auth, async (user) => {
        console.log("subscribed to auth state");
        await this.processCurrentUser(user);
      });
    },
    async processCurrentUser(user) {
      if (user) {
        const userDoc = await getDoc(doc(dbFireStore, 'users', user.uid));
        this.userInfo = userDoc.data() || {};
        this.userInfo.uid = user.uid;
      } else {
        this.userInfo = {};
      }
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
      this.adminMode = !this.adminMode;
      localStorage.setItem("adminMode", this.adminMode);
    },
    async updateUser(updatedUserInfo) {
      console.log('Updating user with:', updatedUserInfo, updateDoc);
      updatedUserInfo.birthday = format(updatedUserInfo.birthday, 'yyyy-MM-dd');
      this.userInfo = {
        ...this.userInfo,
        ...updatedUserInfo
      };
      
      const userDoc = doc(dbFireStore, 'users', this.userInfo.uid);
      await updateDoc(userDoc, updatedUserInfo);
    }
  }
});
