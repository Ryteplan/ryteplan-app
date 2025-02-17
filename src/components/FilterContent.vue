<template>
  <div class="filters-container">
    <div class="d-flex align-center justify-space-between">
      <p 
        v-if="source !== 'dialog'"
        class="text-subtitle-2" 
        style="padding-left: 12px; height: 48px; display: flex; align-items: center;"
      >
        Filters
      </p>
      <v-btn 
        v-if="hasActiveFilters"
        @click="$emit('clear-filters')"
        color="primary"
        variant="text"
        size="x-small"
        class="text-caption mr-4"
      >
        Clear
      </v-btn>
    </div>
    <div class="filters-content flex-grow-1">
      <div class="filters-content-section">
        <h4>Location</h4>
        <v-select 
          class="mt-4" 
          density="compact"
          variant="outlined"
          hide-details 
          clearable 
          label="Country"
          :items="searchFilterSortStore.CountryList" 
          v-model="searchFilterSortStore.filters.Country"
          @update:menu="onUpdateMenu"
        />
        <v-autocomplete
          class="mt-4" 
          density="compact"
          variant="outlined"
          hide-details 
          multiple 
          clearable 
          chips 
          label="State(s)"
          :items="searchFilterSortStore.StatesList" 
          v-model="searchFilterSortStore.filters.State"
          @update:menu="onUpdateMenu" 
        />
        <v-select 
          class="mt-4" 
          density="compact"
          variant="outlined"
          hide-details 
          multiple 
          clearable 
          label="Campus Setting"
          :items="searchFilterSortStore.campusSettingList" 
          v-model="searchFilterSortStore.filters.campusSetting"
          @update:menu="onUpdateMenu"
        />
      </div>
      <div class="filters-content-section">
        <h4>Athletics</h4>
      <v-autocomplete 
        ref="sportFilter"
        class="mt-4" 
        density="compact"
        variant="outlined"
        hide-details 
        clearable 
        label="Sport"
        :items="searchFilterSortStore.sportList" 
        v-model="searchFilterSortStore.filters.sportName"
        :item-title="str => str?.replace(/\b\w/g, l => l.toUpperCase())"
        :menu-props="{ contentClass: 'text-capitalize' }"
        @update:menu="onUpdateMenu" 
      />
      <v-select
        v-if="searchFilterSortStore.filters.sportName && searchFilterSortStore.filters.sportName.length > 0"
        class="mt-4"
        density="compact"
        variant="outlined"
        hide-details 
        clearable 
        multiple
        label="Division"
        :items="divisions"
        item-title="title"
        item-value="value"
        v-model="searchFilterSortStore.filters.division"
        @update:menu="onUpdateMenu"
      />
      <v-select
        v-if="searchFilterSortStore.filters.sportName && searchFilterSortStore.filters.sportName.length > 0"
        class="mt-4"
        density="compact"
        variant="outlined"
        hide-details 
        clearable 
        label="Gender"
        :items="[
          { title: 'Men', value: 'men' },
          { title: 'Women', value: 'women' }
        ]"
        item-title="title"
        item-value="value"
        v-model="searchFilterSortStore.filters.gender"
        @update:menu="onUpdateMenu"
        />
      </div>
      <div class="filters-content-section">
        <h4>Public or Private</h4>
        <v-select 
          class="mt-4" 
        density="compact"
        variant="outlined"
        hide-details 
        clearable 
        label="Type"
        :items="searchFilterSortStore.TypeList" 
        v-model="searchFilterSortStore.filters.Type"
        @update:menu="onUpdateMenu"
        />
      </div>
      <div class="filters-content-section">
        <h4>Undergraduates</h4>
        <div class="d-flex mt-4" style="gap: 16px;">
          <v-text-field 
          v-model="searchFilterSortStore.filters.UndergraduatesMin" 
          label="Minimum"
          type="number" 
          clearable 
          hide-details
          density="compact"
          variant="outlined"
          hide-spin-buttons
        />
        <v-text-field 
          v-model="searchFilterSortStore.filters.UndergraduatesMax" 
          label="Maximum"
          type="number" 
          density="compact"
          variant="outlined"
          clearable 
          hide-details
          hide-spin-buttons
          />
        </div>
      </div>
      <div class="filters-content-section">
        <h4>Admit Range</h4>
        <v-range-slider 
        v-model="searchFilterSortStore.filters.admitRateRange" 
        :max="100" 
        :min="0" 
        :step="1"
        class="align-center mt-4" 
        hide-details
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="searchFilterSortStore.filters.admitRateRange[0]"
            density="compact"
            type="number"
            variant="outlined"
            hide-spin-buttons
            hide-details
            single-line
            style="width: 60px"
            class="mr-2"
          ></v-text-field>
        </template>
        <template v-slot:append>
          <v-text-field
            v-model="searchFilterSortStore.filters.admitRateRange[1]"
            density="compact"
            type="number"
            variant="outlined"
            hide-spin-buttons
            hide-details
            single-line
            style="width: 60px"
            class="ml-2"
          ></v-text-field>
        </template>
      </v-range-slider>
      </div>
      <div class="filters-content-section">
        <h4>Admission Difficulty</h4>
        <v-select
          class="mt-4"
          density="compact"
          variant="outlined"
          hide-details
          multiple
          clearable
          label="Difficulty Level"
          :items="searchFilterSortStore.admissionDifficultyList"
          v-model="searchFilterSortStore.filters.admissionDifficulty"
          @update:menu="onUpdateMenu"
        />
      </div>
      <div class="filters-content-section">
        <h4>Academics</h4>
        <v-autocomplete 
          class="mt-4" 
          density="compact"
          variant="outlined"
          hide-details 
          multiple 
        clearable 
        chips 
        label="Majors"
        :items="searchFilterSortStore.cipCodes" 
        item-value="cipCode" 
        item-title="major"
        v-model="searchFilterSortStore.filters.cipCode" 
        @update:menu="onUpdateMenu"
        />
      </div>
      <div class="filters-content-section">
        <h4>Religion</h4>
        <v-autocomplete 
          class="mt-4" 
          density="compact"
          variant="outlined"
          hide-details 
        multiple 
        clearable 
        chips 
        label="Denomination"
        :items="searchFilterSortStore.denomsList" 
        v-model="searchFilterSortStore.filters.denom"
        @update:menu="onUpdateMenu"
      />
      <v-autocomplete 
        class="mt-4 d-none" 
        density="compact"
        variant="outlined"
        hide-details 
        multiple 
        clearable 
        chips 
        label="Affiliation"
        :items="searchFilterSortStore.affilList" 
        v-model="searchFilterSortStore.filters.affil"
        @update:menu="onUpdateMenu" 
        />
      </div>
      <div class="filters-content-section">
        <h4>Specialized Community</h4>
        <v-checkbox density="compact" label="Tribal" v-model="searchFilterSortStore.filters.tribal" hide-details class="mt-2" />
        <v-checkbox density="compact" label="HBCU" v-model="searchFilterSortStore.filters.hbcu" hide-details />
      </div>
    </div>
  </div>
</template>

<script>
import { useSearchFilterSortStore } from '../stores/searchFilterSortStore';
import { defaultFilters } from '../data/defaultFilters';

export default {
  name: 'FilterContent',
  props: {
    sportFilterRef: {
      type: Object,
      default: null
    },
    source: {
      type: String,
      default: 'table'
    }
  },
  setup() {
    const searchFilterSortStore = useSearchFilterSortStore();
    return {
      searchFilterSortStore
    };
  },
  watch: {
    'searchFilterSortStore.filters.sportName'(newValue) {
      if (!newValue || newValue.length === 0) {
        // Reset division and gender when sport is cleared
        this.searchFilterSortStore.filters.division = null;
        this.searchFilterSortStore.filters.gender = null;
      }
    }
  },
  data() {
    return {
      divisions: [
        { value: '1', title: 'NCAA Division 1' },
        { value: '2', title: 'NCAA Division 2' },
        { value: '3', title: 'NCAA Division 3' },
        { value: 'A', title: 'NCAA Division 1 FBS' },
        { value: 'B', title: 'NCAA Division 1 FCS' },
        { value: 'NAIA', title: 'NAIA' },
      ]
    }
  },
  computed: {
    hasActiveFilters() {
      const currentFilters = this.searchFilterSortStore.filters;
      return Object.keys(defaultFilters).some(key => {
        if (Array.isArray(defaultFilters[key])) {
          return JSON.stringify(currentFilters[key]) !== JSON.stringify(defaultFilters[key]);
        }
        return currentFilters[key] !== defaultFilters[key];
      });
    }
  },
  methods: {
    onUpdateMenu(open) {
      if (open) {
        setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.filters-content {
  overflow: visible;
  flex: 1;
  padding-right: 16px;
  margin-bottom: 16px;

  h4 {
    &:first-of-type {
      margin-top: 0px;
    }
    margin-top: 32px;
    font-size: 15px;
    font-weight: 500;
  }
}

.filters-content-section {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 20px;

  @media (min-width: 1279px) {
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  }

  &:last-of-type {
    margin-bottom: 0px;
    border-bottom: none;
  }
}


</style> 