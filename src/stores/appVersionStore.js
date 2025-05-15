import { defineStore } from 'pinia';

export const useAppVersionStore = defineStore('appVersion', {
  state: () => ({
      version: '',
      versionFromLocalStorage: '',
      versionMatch: false,
  }),
  actions: {
    compareVersion() {
      console.log('comparing version');
      this.version = process.env.node_env.PACKAGE_VERSION;
      this.versionFromLocalStorage = localStorage.getItem('appVersion');

      console.log('version: ', this.version);
      console.log('versionFromLocalStorage: ', this.versionFromLocalStorage);
      
      if (this.versionFromLocalStorage == this.version) {
          this.versionMatch = true;
      } else {
          console.log('version does not match, clearing localStorage');
          this.versionMatch = false;
          localStorage.clear();
          localStorage.setItem("appVersion", this.version);
      }
      return this.versionMatch;
    },
    getVersion() {
        return this.version;
    },
  }
});
