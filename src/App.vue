<template>
  <v-layout class="app-container" :class="{ 'logged-in': isLoggedIn }">
    <v-app-bar class="elevation-1">
      <div
        class="header-container d-flex align-center justify-space-between ma-auto w-100 px-3 px-lg-0"
      >
        <a href="/" class="logo">
          <LogoGreenBlack />
        </a>
        <v-combobox
          ref="suggestedSearch"
          class="ml-8 mr-md-8"
          density="compact"
          variant="solo"
          single-line
          hide-details
          menu-icon=""
          placeholder="Search"
          :items="suggestedResults"
          v-model.search="searchInput"
          @keydown.enter="handleSearchEnter"
          item-props
          no-filter
        >
          <template v-slot:item="data">
            <v-list-item
              class="suggestion-link"
              @click-once="() => handleSearchClick(data.item.props)"
            >
              <v-list-item-title>
                <div class="d-flex align-center ga-2">
                  <!-- <v-icon
                    class="ml-3"
                    :icon="
                      data.item.props.type === 'real'
                        ? 'mdi-office-building-marker-outline'
                        : 'mdi-magnify'
                    "
                    size="small"
                  ></v-icon> -->
                  <span v-if="data.item.props.html" v-html="data.item.props.html"></span>
                  <span v-else>{{ data.item.props.name }}</span>
                </div>
              </v-list-item-title>
            </v-list-item>
          </template>
          <template v-slot:append-inner>
            <v-progress-circular
              v-if="isLoadingSuggestion"
              :size="20"
              color="primary"
              indeterminate
            ></v-progress-circular>
            <v-icon
              v-else
              class="ml-3"
              icon="mdi-magnify"
              size="small"
            ></v-icon>
          </template>
        </v-combobox>
        <div class="d-none d-md-block">
          <v-btn
            cols="2"
            block
            class="max-w-24"
            color="primary"
            variant="outlined"
            href="https://forms.gle/TkssoDbsbAaiuSnA6"
            target="_blank"
          >
            Submit feedback
          </v-btn>
        </div>
        <!-- <div v-if="!isLoggedIn">
          <v-btn 
            :to="{name: 'login', query: { tabDestination: 'Sign Up' }}"
            class="no-active"
          >
            Sign up
          </v-btn>
          <v-btn 
            class="no-active"
            :to="{name: 'login', query: { tabDestination: 'Login' }}"
          >
            Login
          </v-btn>
        </div> -->
      </div>
    </v-app-bar>
    <v-navigation-drawer v-if="isLoggedIn" permanent>
      <v-list nav>
        <v-list-item
          to="/"
          prepend-icon="mdi-magnify"
          title="Institutions"
          value="Institution Search"
        >
        </v-list-item>
        <v-list-item
          to="/lists"
          prepend-icon="mdi-list-box-outline"
          title="Lists"
          value="Saved Lists"
        >
        </v-list-item>
        <v-list-item
          to="/playground"
          prepend-icon="mdi-slide"
          title="Playground"
          value="Playground"
        >
        </v-list-item>
        <v-list-item
          to="/data-compare"
          prepend-icon="mdi-compare-horizontal"
          title="Data Compare"
          value="Data Compare"
        >
        </v-list-item>
        <v-list-item
          to="/data-integration"
          prepend-icon="mdi-call-merge"
          title="Data Integration"
          value="Data Integration"
        >
        </v-list-item>
        <v-list-item
          to="/image-work"
          prepend-icon="mdi-image-edit"
          title="Image Work"
          value="Image Work"
        >
        </v-list-item>
        <v-list-item
          to="/students"
          prepend-icon="mdi-account-school"
          title="Students"
          value="Students"
        >
        </v-list-item>
        <v-list-item
          to="/account"
          prepend-icon="mdi-cog"
          title="Account"
          value="Account"
        >
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          value="Logout"
          @click="handleSignOut"
        >
        </v-list-item>
        <v-switch
          class="px-4"
          label="Admin Mode"
          v-model="userStore.adminMode"
          color="primary"
          @change="userStore.saveAdminModeState"
        >
        </v-switch>
        <!-- <v-list-item
          v-if="userStore.adminMode"
          prepend-icon="mdi-table"
          title="Refresh Headers"
          value="Refresh Headers"
          @click="tableStore.refreshTableHeaders"
        >
        </v-list-item> -->
      </v-list>
    </v-navigation-drawer>
    <v-main class="d-flex flex-column">
      <router-view :key="$route.fullPath"></router-view>
      <v-spacer></v-spacer>
      <v-container class="footer-container pt-0">
        <v-footer class="pb-4 ml-0 mr-0 pl-0 pr-0">
          <v-row class="align-end">
            <v-col cols="6">
              <div style="font-size: 13px; margin-bottom: 0; gap: 8px; display: flex;">
                <span>Version: {{ appVersionStore.getVersion() }}</span> 
                <span>·</span>
                <span>Ryteplan LLC © 2025</span>
                <span>·</span>
                <router-link to="/terms" class="terms-link" target="_blank">Terms and Conditions</router-link>
            </div>
            </v-col>
          </v-row>
        </v-footer>
      </v-container>
    </v-main>
    <CookieNotification class="mb-8" style="position: fixed; bottom: 0; left: 0; right: 0;" />
  </v-layout>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import LogoGreenBlack from "@/components/svg/LogoGreenBlack.vue";
import { useAppVersionStore } from ".//stores/appVersionStore";
import { useUserStore } from ".//stores/userStore";
import { useTableStore } from ".//stores/tableStore";
import { useSearchFilterSortStore } from ".//stores/searchFilterSortStore";
import { useSuggestionSearchStore } from ".//stores/suggestionSearchStore";
import CookieNotification from '@/components/CookieNotification.vue'

let auth;

export default {
  setup() {
    let appVersionStore = useAppVersionStore();
    appVersionStore.compareVersion();

    let userStore = useUserStore();
    userStore.getAdminMode();

    let tableStore = useTableStore();

    let searchFilterSortStore = useSearchFilterSortStore();
    let suggestionSearchStore = useSuggestionSearchStore();

    function createDebounce() {
      let timeout = null;
      return function (fnc, delayMs) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          fnc();
        }, delayMs || 800);
      };
    }

    return {
      userStore,
      tableStore,
      searchFilterSortStore,
      suggestionSearchStore,
      appVersionStore,
      debounce: createDebounce(),
    };
  },
  components: {
    LogoGreenBlack,
    CookieNotification
  },
  mounted() {
    auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });

    // Check if the URL contains a "search" parameter
    if (this.$route.query.search) {
      this.searchFilterSortStore.activeSearchTerms = this.$route.query.search;
      this.searchInput = this.$route.query.search;
    }
  },
  data() {
    return {
      isLoggedIn: false,
      searchInput: "",
      suggestedResults: [],
      isLoadingSuggestion: false,
      initialLoading: true
    };
  },
  methods: {
    handleSignOut() {
      signOut(auth).then(() => {
        this.userStore.isLoggedIn = false;
        localStorage.removeItem("adminMode");
        this.$router.push("/");
      });
    },
    updateSearchBarInput() {
      if (this.searchFilterSortStore.activeSearchTerms === "") {
        this.searchFilterSortStore.searchParameters.q = "*";
        this.searchFilterSortStore.searchParameters.activeSearchTerms = "*";
      } else {
        this.searchFilterSortStore.searchParameters.q =
          this.searchFilterSortStore.activeSearchTerms;
      }
    },
    performSearch(source) {
      const searchQuery = this.searchFilterSortStore.activeSearchTerms
        ? decodeURIComponent(
            encodeURIComponent(
              this.searchFilterSortStore.activeSearchTerms.trim().toLowerCase()
            )
          )
        : "";

      this.tableStore.freshSearch = true;

      if (this.$route.path === "/") {
        this.searchFilterSortStore.activeSearchTerms = searchQuery;
        this.tableStore.performSearch();
        this.$router.push({
          query: { ...this.$route.query, search: searchQuery },
        });
      } else {
        if (source === "fromClear") return;

        let route = this.$router.resolve({
          name: "home",
          query: { search: searchQuery },
        });

        window.open(route.href, "_self");
      }
    },
    mapSuggestedItems(items) {
      let suggestedResults = [];
      if (items) {
        const realHits = items?.results[1]?.hits?.map((hit) => {
          return {
            html: hit.highlight?.name?.snippet,
            value: hit.document?.id,
            name: hit.document?.name,
            type: "real",
          };
        });
        suggestedResults = [...realHits];
      }
      this.$nextTick(() => {
        if (this.searchInput) {
          this.suggestedResults = suggestedResults;
          this.$refs.suggestedSearch.menu = true;
        }
      });
    },
    handleSearchClick(item) {
      if (item.type === "suggestion") {
        this.searchFilterSortStore.activeSearchTerms = item.name;
        this.performSearch("fromSuggestion");
      } else {
        this.searchInput = null;
        this.$router.push(`/institution/${item.value}`);
      }
      document.activeElement.blur();
    },
    handleSearchEnter() {
      if (this.searchInput === "") return;
      this.searchFilterSortStore.activeSearchTerms = this.searchInput;
      this.performSearch("fromSuggestion");
      document.activeElement.blur();
    },
  },
  watch: {
    searchInput(val) {
      if (val && !this.initialLoading) {
        this.isLoadingSuggestion = true;
        this.debounce(async () => {
          const results = await this.suggestionSearchStore.performMultiSearch(
            val
          );
          this.mapSuggestedItems(results);
          this.isLoadingSuggestion = false;
        });
      } else {
        this.suggestedResults = [];
        this.isLoadingSuggestion = false;
        this.initialLoading = false;
      }
    },
  },
};
</script>

<style>
.v-autocomplete--single:not(.v-autocomplete--selection-slot)
  .v-field--dirty:not(.v-field--focused)
  input {
  opacity: 1 !important;
}

a.logo {
  color: #000;
  text-decoration: none;
  line-height: 1;
  height: 23px;
  margin-top: 4px;
}

.v-toolbar__content {
  margin: 0 auto;
}

.no-active .v-btn__overlay {
  display: none;
}

a {
  color: blue;
}

.v-footer {
  background: transparent !important;
}

@media screen and (min-width: 960px) {
  .header-container {
    max-width: 900px;
  }
}

@media screen and (min-width: 1280px) {
  .header-container {
    max-width: 1200px;
  }
}

.suggestion-link {
  cursor: pointer;
}

.suggestion-link:hover {
  background-color: #eaeaea;
}

.terms-link {
  text-decoration: none;
  color: inherit;
}

.terms-link:hover {
  text-decoration: underline;
}

.v-main {
  min-height: 100vh;
}

.footer-container {
  margin-top: auto;
}
</style>
