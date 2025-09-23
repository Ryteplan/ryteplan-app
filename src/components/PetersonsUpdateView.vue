<template>
  <v-container class="pt-4">
    <div class="petersons-update">
      <div class="d-flex flex-column align-center justify-space-between mb-4">
        <h1>Petersons Update</h1>
        <div class="d-flex align-center gap-2 mt-4">
          <v-btn
          color="secondary"
          variant="outlined"
          :loading="loadingNextSchool"
          @click="goToPreviousSchool"
          >
            Previous School
          </v-btn>
          <v-btn
            v-if="institution.name"
            :to="`/institution/${$route.params.slug}`"
            color="primary"
            variant="outlined"
          >
            View Institution Page
          </v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            :loading="loadingNextSchool"
            @click="goToNextSchool"
          >
            Next School
          </v-btn>
        </div>
      </div>
      
      <div v-if="institution.name" class="institution-info mb-4">
        <h2>{{ institution.name }}</h2>
        <p>Last updated: <i>{{ formatTimestamp(institution.lastUpdated) }}</i></p>
      </div>
    </div>
    <v-data-table
      :headers="headers"
      :items="fieldItems"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :search="searchQuery"
      class="mt-4"
      item-value="fieldKey"
    >
      <template #top>
        <!-- <div class="d-flex align-center gap-2 pa-4 d-none">
          <v-text-field
            v-model="searchQuery"
            label="Search fields"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="flex-grow-1"
          />
        </div> -->
      </template>

      <template #[`item.fieldName`]="{ item }">
        <span class="font-weight-medium">{{ item.fieldName }}</span>
      </template>

      <template #[`item.integratedValue`]="{ item }">
        <span :class="{ 'text-grey': !item.integratedValue || item.integratedValue === '—' || item.integratedValue === '–' }">
          {{ formatValue(item.integratedValue, item.fieldKey) }}
        </span>
      </template>

      <template #[`item.manualValue`]="{ item }">
        <div v-if="editingCell === item.fieldKey" class="d-flex align-center gap-2">
          <v-text-field
            v-model="editingValue"
            density="compact"
            variant="outlined"
            hide-details
            @keyup.enter="saveManualValue(item)"
            @keyup.escape="cancelEdit"
            autofocus
            class="flex-grow-1"
          />
          <v-btn
            icon="mdi-check"
            size="small"
            color="success"
            variant="text"
            :loading="savingCell === item.fieldKey"
            @click="saveManualValue(item)"
          />
          <v-btn
            icon="mdi-close"
            size="small"
            color="error"
            variant="text"
            @click="cancelEdit"
          />
        </div>
        <span
          v-else
          :class="{ 
            'text-grey': !item.manualValue || item.manualValue === '—' || item.manualValue === '–',
            'cursor-pointer': true,
            'hover-highlight': true
          }"
          @click="startEditManualValue(item)"
          title="Click to edit"
        >
          {{ formatValue(item.manualValue, item.fieldKey) }}
        </span>
      </template>

      <template #[`item.petersonsValue`]="{ item }">
        <span :class="{ 'text-grey': !item.petersonsValue || item.petersonsValue === '—' || item.petersonsValue === '–' }">
          {{ formatValue(item.petersonsValue, item.fieldKey) }}
        </span>
      </template>

      <template #item="{ item }">
        <tr :class="getRowClass(item)">
          <td>{{ item.fieldName }}</td>
          <td>
            <span :class="{ 'text-grey': !item.petersonsValue || item.petersonsValue === '—' || item.petersonsValue === '–' }">
              {{ formatValue(item.petersonsValue, item.fieldKey) }}
            </span>
          </td>
          <td>
            <div v-if="editingCell === item.fieldKey" class="d-flex align-center gap-2">
              <v-text-field
                v-model="editingValue"
                density="compact"
                variant="outlined"
                hide-details
                @keyup.enter="saveManualValue(item)"
                @keyup.escape="cancelEdit"
                autofocus
                class="flex-grow-1"
              />
              <v-btn
                icon="mdi-check"
                size="small"
                color="success"
                variant="text"
                :loading="savingCell === item.fieldKey"
                @click="saveManualValue(item)"
              />
              <v-btn
                icon="mdi-close"
                size="small"
                color="error"
                variant="text"
                @click="cancelEdit"
              />
            </div>
            <span
              v-else
              :class="{ 
                'text-grey': !item.manualValue || item.manualValue === '—' || item.manualValue === '–',
                'cursor-pointer': true,
                'hover-highlight': true
              }"
              @click="startEditManualValue(item)"
              title="Click to edit"
            >
              {{ formatValue(item.manualValue, item.fieldKey) }}
            </span>
          </td>
          <td>
            <span :class="{ 'text-grey': !item.integratedValue || item.integratedValue === '—' || item.integratedValue === '–' }">
              {{ formatValue(item.integratedValue, item.fieldKey) }}
            </span>
          </td>
          <td>
            <v-btn
              v-if="item.isDifferent && item.petersonsValue !== '—' && item.petersonsValue !== '–'"
              color="primary"
              variant="outlined"
              size="small"
              :loading="updatingFields.has(item.fieldKey)"
              @click="updateField(item)"
            >
              Update
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
    <div class="d-flex justify-center mt-4">
      <v-btn
        color="primary"
        variant="elevated"
        :loading="bulkUpdating"
        @click="updateAllFromPetersons"
        class="mb-4"
      >
        Update fields that don't have manual overrides
      </v-btn>
    </div>
    <div class="d-flex align-center justify-center gap-2 mt-4">
      <v-btn
          color="secondary"
          variant="outlined"
          :loading="loadingNextSchool"
          @click="goToPreviousSchool"
          >
            Previous School
          </v-btn>
          <v-btn
            v-if="institution.name"
            :to="`/institution/${$route.params.slug}`"
            color="primary"
            variant="outlined"
          >
            View Institution Page
          </v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            :loading="loadingNextSchool"
            @click="goToNextSchool"
          >
            Next School
          </v-btn>
        </div>
  </v-container>
</template>

<script>
import { dbFireStore } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, orderBy, setDoc } from 'firebase/firestore';
import { useTableStore } from '../stores/tableStore';
import { formatTimestamp } from '../utils/timestampUtils';

export default {
  name: 'PetersonsUpdateView',
  data() {
    return {
      loading: true,
      institution: {},
      manualData: {},
      petersonsData: {},
      descriptionsData: {},
      searchQuery: '',
      itemsPerPage: 200,
      updatingFields: new Set(),
      institutionDocId: null,
      bulkUpdating: false,
      loadingNextSchool: false,
      editingCell: null, // Track which cell is being edited (fieldKey)
      editingValue: '', // The value being edited
      savingCell: null, // Track which cell is being saved
      headers: [
        { title: 'Field Name', key: 'fieldName', width: '20%', sortable: true },
        { title: 'Petersons', key: 'petersonsValue', width: '20%', sortable: false },
        { title: 'Manual', key: 'manualValue', width: '20%', sortable: false },
        { title: 'Current', key: 'integratedValue', width: '20%', sortable: false },
        { title: 'Update', key: 'actions', width: '20%', sortable: false },
      ]
    }
  },
  computed: {
    fieldItems() {
      // Don't process if data is still loading
      if (this.loading) {
        return [];
      }

      const tableStore = useTableStore();
      const headers = tableStore.tableHeaders;
      
      // Don't process if headers aren't loaded yet
      if (!headers || headers.length === 0) {
        return [];
      }
      
      const items = [];
      const processedKeys = new Set(); // Track processed keys to avoid duplicates
      
      // Process all headers including nested ones
      const processHeaders = (headerList, parentTitle = '') => {
        headerList.forEach(header => {
          if (header.children && header.children.length > 0) {
            // Process children with parent context
            processHeaders(header.children, header.title);
          } else if (header.key && header.key !== 'id' && header.key !== 'name' && !processedKeys.has(header.key)) {
            const fieldName = parentTitle ? `${parentTitle} - ${header.title}` : header.title;
            
            const integratedValue = this.institution[header.key] ?? '—';
            const manualValue = this.manualData[header.key] ?? '—';
            const petersonsValue = this.petersonsData[header.key] ?? '—';
            
            items.push({
              fieldKey: header.key,
              fieldName: fieldName,
              integratedValue: integratedValue,
              manualValue: manualValue,
              petersonsValue: petersonsValue,
              isDifferent: this.isValueDifferent(fieldName, petersonsValue, integratedValue)
            });
            processedKeys.add(header.key);
          }
        });
      };
      
      processHeaders(headers);
      
      // Add additional fields that appear on InstitutionPage but not in tableStore
      const additionalFields = [
        // Basic institution info
        { key: 'uri', label: 'URI' },
        { key: 'inunId', label: 'INUN ID' },
        { key: 'afilDesc', label: 'Affiliation Description' },
        { key: 'hbcu', label: 'HBCU' },
        { key: 'tribal', label: 'Tribal' },
        { key: 'adDiffAll', label: 'Admission Difficulty' },
        
        // Cost fields directly displayed
        { key: 'tuitStateFtD2025', label: 'Tuition In State' },
        { key: 'tuitNresFtD2025', label: 'Tuition Out of State' },
        { key: 'tuitIntlFtD2025', label: 'Tuition International' },
        { key: 'tuitOverallFtD2025', label: 'Tuition Overall' },
        { key: 'grsBachInitPellN', label: 'Undergrad Pell Grants Awarded' },
        { key: 'ugFtAvgNbGiftD', label: 'Average Need-Based Scholarship' },
        { key: 'ugFtNnNoneedN', label: 'Merit Scholarships Awarded' },
        { key: 'ugFtNnNoneedD', label: 'Average Merit Scholarship' },
        
        // Ethnicity fields
        { key: 'enNonresAlienN', label: 'International Students Count' },
        { key: 'enAsianNonhispanicN', label: 'Asian Students Count' },
        { key: 'enBlackNonhispanicN', label: 'Black Students Count' },
        { key: 'enHispanicEthnicityN', label: 'Hispanic Students Count' },
        { key: 'enIslanderNonhispanicN', label: 'Pacific Islander Students Count' },
        { key: 'enMultiraceNonhispanicN', label: 'Multirace Students Count' },
        { key: 'enNativeNonhispanicN', label: 'Native American Students Count' },
        { key: 'enRaceEthnicityUnknownN', label: 'Unknown Ethnicity Count' },
        { key: 'enWhiteNonhispanicN', label: 'White Students Count' },
        { key: 'ethnicityPopulationTotal', label: 'Total Ethnicity Population' },
        
        // Part-time enrollment fields for calculations
        { key: 'enTotPtMenN', label: 'Part Time Male Students' },
        { key: 'enTotPtWmnN', label: 'Part Time Female Students' },
        { key: 'enTotFtMenN', label: 'Full Time Male Students' },
        { key: 'enTotFtWmnN', label: 'Full Time Female Students' },
        
        // Additional SAT/ACT fields
        { key: 'sat1Math50thP', label: 'SAT Math 50th Percentile' },
        { key: 'sat1Verb50thP', label: 'SAT Verbal 50th Percentile' },
        
        // Academic programs
        { key: 'acadProgDesc', label: 'Academic Programs Description' },
        
        // Athletic associations
        { key: 'assnAthlNaia', label: 'NAIA Association' },
      ];
      
      // Add additional fields if they exist and haven't been processed
      additionalFields.forEach(field => {
        if (!processedKeys.has(field.key)) {
          const integratedValue = this.institution[field.key] ?? '—';
          const manualValue = this.manualData[field.key] ?? '—';
          const petersonsValue = this.petersonsData[field.key] ?? '—';
          
          items.push({
            fieldKey: field.key,
            fieldName: field.label,
            integratedValue: integratedValue,
            manualValue: manualValue,
            petersonsValue: petersonsValue,
            isDifferent: this.isValueDifferent(field.label, petersonsValue, integratedValue)
          });
          processedKeys.add(field.key);
        }
      });
      
      return items;
    }
  },
  async mounted() {
    // Load table headers to get field definitions
    await this.tableStore.loadTableHeaders();
    await this.loadInstitutionData();
  },
  methods: {
    formatTimestamp,
    async loadInstitutionData() {
      const slugFromURL = this.$route.params.slug;
      
      try {
        // Load integrated institution data
        const integratedQuery = query(
          collection(dbFireStore, 'institutions_integrated'),
          where("uri", "==", slugFromURL)
        );
        const integratedSnapshot = await getDocs(integratedQuery);
        integratedSnapshot.forEach((doc) => {
          this.institution = doc.data();
          this.institutionDocId = doc.id;
        });

        // Load manual institution data
        const manualQuery = query(
          collection(dbFireStore, 'manual_institution_data'),
          where("__name__", "==", slugFromURL)
        );
        const manualSnapshot = await getDocs(manualQuery);
        manualSnapshot.forEach((doc) => {
          this.manualData = doc.data();
        });

        // Load petersons data
        const petersonsQuery = query(
          collection(dbFireStore, 'institutions_petersons_processed_20250731'),
          where("uri", "==", slugFromURL)
        );
        const petersonsSnapshot = await getDocs(petersonsQuery);
        petersonsSnapshot.forEach((doc) => {
          this.petersonsData = doc.data();
        });

        // Load descriptions data
        const descriptionsQuery = query(
          collection(dbFireStore, 'Descriptions'),
          where("__name__", "==", slugFromURL)
        );
        const descriptionsSnapshot = await getDocs(descriptionsQuery);
        descriptionsSnapshot.forEach((doc) => {
          this.descriptionsData = doc.data();
        });

      } catch (error) {
        console.error('Error loading institution data:', error);
      } finally {
        this.loading = false;
      }
    },
    formatValue(value, fieldKey) {
      if (value === null || value === undefined || value === '' || value === -1 || value === '–') {
        return '—';
      }
            
      // Check if this field should be formatted as currency
      const tableStore = useTableStore();
      const header = this.findHeaderByKey(tableStore.tableHeaders, fieldKey);
      
      if (header?.displayCurrency && typeof value === 'number') {
        return '$' + value.toLocaleString();
      }
      
      if (header?.noCommas && typeof value === 'number') {
        return value.toString();
      }
      
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      return value.toString();
    },
    findHeaderByKey(headers, key) {
      for (const header of headers) {
        if (header.key === key) {
          return header;
        }
        if (header.children && header.children.length > 0) {
          const found = this.findHeaderByKey(header.children, key);
          if (found) return found;
        }
      }
      return null;
    },
    isValueDifferent(fieldName, petersonsValue, currentValue) {
      console.log('fieldName', fieldName, 'petersonsValue', petersonsValue, 'currentValue', currentValue);
      console.log('are they different?', petersonsValue !== currentValue);

      if (petersonsValue === '—' && currentValue === '-') {
        console.log('are they dashed similarly?', petersonsValue !== currentValue);
        return false;
      }
      
      // Handle null, undefined, empty string, and placeholder values
      const normalizedPetersons = this.normalizeValue(petersonsValue);
      const normalizedCurrent = this.normalizeValue(currentValue);
      
      // If both are empty/null, they're the same
      if (normalizedPetersons === null && normalizedCurrent === null) {
        return false;
      }
      
      // If one is empty and the other isn't, they're different
      if (normalizedPetersons === null || normalizedCurrent === null) {
        return true;
      }
      
      // Compare the normalized values
      return normalizedPetersons !== normalizedCurrent;
    },
    normalizeValue(value) {
      // Convert various "empty" representations to null for consistent comparison
      if (value === null || value === undefined || value === '' || value === '—' || value === '–' || value === -1) {
        return null;
      }
      
      // Convert numbers to strings for comparison
      if (typeof value === 'number') {
        return value.toString();
      }
      
      // Convert booleans to consistent string representation
      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }
      
      // Return string as-is, trimmed
      return value.toString().trim();
    },
    getRowClass(item) {
      if (item.fieldName === 'Hidden') {
        return;
      }
      
      // Check if manual value exists and is not empty
      const hasManualValue = item.manualValue !== null && 
                           item.manualValue !== undefined && 
                           item.manualValue !== '' && 
                           item.manualValue !== '—' && 
                           item.manualValue !== '–' && 
                           item.manualValue !== -1;
      
      // Priority: manual value highlighting over difference highlighting
      if (hasManualValue) {
        return 'manual-value-row';
      }
      
      return item.isDifferent ? 'highlighted-row' : ''; 
    },
    async updateField(item) {
      if (!this.institutionDocId) {
        console.error('No institution document ID available');
        return;
      }

      // Add field to updating set
      this.updatingFields.add(item.fieldKey);

      try {
        // Get the raw Petersons value (not formatted)
        const updateValue = this.petersonsData[item.fieldKey];
        
        // Update the Firestore document
        const institutionRef = doc(dbFireStore, 'institutions_integrated', this.institutionDocId);
        await updateDoc(institutionRef, {
          [item.fieldKey]: updateValue
        });

        // Update local state
        this.institution[item.fieldKey] = updateValue;

        console.log(`Successfully updated ${item.fieldName} to ${updateValue}`);
      } catch (error) {
        console.error('Error updating field:', error);
        // You could add a snackbar or toast notification here
      } finally {
        // Remove field from updating set
        this.updatingFields.delete(item.fieldKey);
      }
    },
    async updateAllFromPetersons() {
      if (!this.institutionDocId) {
        console.error('No institution document ID available');
        return;
      }

      this.bulkUpdating = true;

      try {
        const updateData = {};
        let updateCount = 0;

        // Go through all Petersons data
        Object.keys(this.petersonsData).forEach(fieldKey => {
          const petersonsValue = this.petersonsData[fieldKey];
          const manualValue = this.manualData[fieldKey];
          
          // Check if Petersons has a valid value
          const hasValidPetersonsValue = petersonsValue !== null && 
                                       petersonsValue !== undefined && 
                                       petersonsValue !== '' && 
                                       petersonsValue !== '—' && 
                                       petersonsValue !== '–' && 
                                       petersonsValue !== -1;

          // Check if manual value is empty/absent
          const hasNoManualValue = manualValue === null || 
                                  manualValue === undefined || 
                                  manualValue === '' || 
                                  manualValue === '—' || 
                                  manualValue === '–' || 
                                  manualValue === -1;

          // Update if Petersons has a value and there's no manual override
          if (hasValidPetersonsValue && hasNoManualValue) {
            updateData[fieldKey] = petersonsValue;
            updateCount++;
          }
        });

        if (updateCount === 0) {
          console.log('No fields to update - all valid Petersons values have manual overrides');
          return;
        }

        // Update Firestore document with all changes at once
        const institutionRef = doc(dbFireStore, 'institutions_integrated', this.institutionDocId);
        await updateDoc(institutionRef, updateData);

        // Update local state
        Object.keys(updateData).forEach(fieldKey => {
          this.institution[fieldKey] = updateData[fieldKey];
        });

        console.log(`Successfully bulk updated ${updateCount} fields from Petersons data`);
        
      } catch (error) {
        console.error('Error bulk updating from Petersons:', error);
        // You could add a snackbar or toast notification here
      } finally {
        this.bulkUpdating = false;
      }
    },
    async goToNextSchool() {
      if (!this.institution.uri) {
        console.error('No current institution URI available');
        return;
      }

      this.loadingNextSchool = true;

      try {
        // Get all institutions from the integrated collection, ordered by name for consistency
        const allInstitutionsQuery = query(
          collection(dbFireStore, 'institutions_integrated'),
          orderBy('name')
        );
        
        const snapshot = await getDocs(allInstitutionsQuery);
        const institutions = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.uri && data.name && !data.hidden) { // Only include institutions with both URI and name, and not hidden
            institutions.push({
              uri: data.uri,
              name: data.name,
              docId: doc.id
            });
          }
        });

        // Find current institution index
        const currentIndex = institutions.findIndex(inst => inst.uri === this.institution.uri);
        
        if (currentIndex === -1) {
          console.error('Current institution not found in the list');
          return;
        }

        // Check if this is the last school
        if (currentIndex >= institutions.length - 1) {
          console.log('This is the last school in the collection');
          // Could show a message to user here
          return;
        }

        // Get next school
        const nextSchool = institutions[currentIndex + 1];
        
        // Navigate to next school's Petersons update page
        this.$router.push(`/petersons-update/${nextSchool.uri}`);

      } catch (error) {
        console.error('Error loading next school:', error);
        // You could add a snackbar or toast notification here
      } finally {
        this.loadingNextSchool = false;
      }
    },
    async goToPreviousSchool() {
      if (!this.institution.uri) {
        console.error('No current institution URI available');
        return;
      }

      this.loadingNextSchool = true;

      try {
        // Get all institutions from the integrated collection, ordered by name for consistency
        const allInstitutionsQuery = query(
          collection(dbFireStore, 'institutions_integrated'),
          orderBy('name')
        );
        
        const snapshot = await getDocs(allInstitutionsQuery);
        const institutions = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.uri && data.name && !data.hidden) { // Only include institutions with both URI and name, and not hidden
            institutions.push({
              uri: data.uri,
              name: data.name,
              docId: doc.id
            });
          }
        });

        // Find current institution index
        const currentIndex = institutions.findIndex(inst => inst.uri === this.institution.uri);
        
        if (currentIndex === -1) {
          console.error('Current institution not found in the list');
          return;
        }

        // Check if this is the first school
        if (currentIndex <= 0) {
          console.log('This is the first school in the collection');
          // Could show a message to user here
          return;
        }

        // Get previous school
        const previousSchool = institutions[currentIndex - 1];
        
        // Navigate to previous school's Petersons update page
        this.$router.push(`/petersons-update/${previousSchool.uri}`);

      } catch (error) {
        console.error('Error loading previous school:', error);
        // You could add a snackbar or toast notification here
      } finally {
        this.loadingNextSchool = false;
      }
    },
    startEditManualValue(item) {
      this.editingCell = item.fieldKey;
      // Get the raw value (not the formatted display value)
      const rawValue = this.manualData[item.fieldKey];
      
      // Handle various empty value representations
      if (rawValue === null || rawValue === undefined || rawValue === '' || rawValue === '—' || rawValue === '–' || rawValue === -1) {
        this.editingValue = '';
      } else {
        this.editingValue = rawValue.toString();
      }
    },
    cancelEdit() {
      this.editingCell = null;
      this.editingValue = '';
      this.savingCell = null;
    },
    async saveManualValue(item) {
      if (this.savingCell === item.fieldKey) {
        return; // Already saving
      }

      this.savingCell = item.fieldKey;

      try {
        const slugFromURL = this.$route.params.slug;
        
        // Convert empty string to null for consistency
        const valueToSave = this.editingValue.trim() === '' ? null : this.editingValue.trim();
        
        // Check if valueToSave is a number
        let processedValue = valueToSave;
        if (valueToSave !== null && !isNaN(valueToSave) && !isNaN(parseFloat(valueToSave))) {
          processedValue = parseFloat(valueToSave);
        }
        
        // Create or update the manual data document
        const manualDocRef = doc(dbFireStore, 'manual_institution_data', slugFromURL);
        await setDoc(manualDocRef, {
          [item.fieldKey]: processedValue
        }, { merge: true }); // Use merge to only update the specific field
        
        // Also update the integrated collection with the manual override
        if (this.institutionDocId) {
          const institutionRef = doc(dbFireStore, 'institutions_integrated', this.institutionDocId);
          await updateDoc(institutionRef, {
            [item.fieldKey]: processedValue
          });
          
          // Update local integrated state
          this.institution[item.fieldKey] = processedValue;
        }
        
        // Update local manual state
        this.manualData[item.fieldKey] = processedValue;
        
        // Exit editing mode
        this.editingCell = null;
        this.editingValue = '';
        
        console.log(`Successfully updated manual value for ${item.fieldName} to ${processedValue}`);
        
      } catch (error) {
        console.error('Error saving manual value:', error);
        // You could add a snackbar or toast notification here
      } finally {
        this.savingCell = null;
      }
    }
  },
  setup() {
    const tableStore = useTableStore();
    return {
      tableStore
    };
  }
}
</script>

<style scoped>
.petersons-update {
  margin-bottom: 1rem;
}

.institution-info {
  padding: 1rem 0;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.gap-2 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-highlight:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px;
}
</style>

<style>
/* Global styles for highlighted rows - not scoped because they need to affect v-data-table internals */
.highlighted-row {
  background-color: #fff3cd !important;
  border-left: 4px solid #ffc107 !important;
}

.highlighted-row:hover {
  background-color: #ffeaa7 !important;
}

/* Blue highlighting for rows with manual values */
.manual-value-row {
  background-color: #e3f2fd !important;
  border-left: 4px solid #2196f3 !important;
}

.manual-value-row:hover {
  background-color: #bbdefb !important;
}

/* Ensure the highlighting works even with Vuetify's default styling */
.v-data-table .highlighted-row td {
  background-color: inherit !important;
}

.v-data-table .manual-value-row td {
  background-color: inherit !important;
}
</style>
