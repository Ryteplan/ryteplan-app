<template>
    <div class="stat-container" style="position: relative">
      <div class="d-flex justify-between">
        <div>
        <span class="stat-label">{{ label }}</span>
        <span class="stat-content d-flex">
          <span class="d-flex">
            <div v-if="valueType !== 'testingPolicy'">
              <span v-html="processValue(currentValue, valueType)"></span>
              <span v-if="displayPercentage">%</span>
            </div>
            <div v-if="valueType === 'testingPolicy'">
              <div v-if="manualValue">
                <span class="d-block testing-header">Rya's Note</span>
                <span class="d-block testing-body">{{ manualValue }}</span>
              </div>
            </div>
          </span>
        </span>
      </div>
      <v-btn
        v-if="showEditButton"
        density="compact"
        class="ml-4"
        icon="mdi-pencil"
        @click="editMode = !editMode"
        variant="plain"
        color="primary"
      />
      </div>
      <div class="mt-4">
        <div 
          v-if="editMode && userStore.adminMode && field !== 'sat1Combined50th'"
        >
          <v-text-field
            label="Manual Value"
            v-model="this.updateValue"
            @input="saveButtonVisibility"
            clearable
          />
          <v-btn
            v-if="saveButtonVisibility"
            value="save"
            @click="this.updateDB"
          >Save</v-btn>
          <div 
            v-if="valueType === 'testingPolicy'" 
          >
            <div v-for="(value, key) in getPopulatedTestingPolicies()" :key="key" >
              <v-switch 
                :label=key
                color="primary"
                hide-details
                dense
                :model-value="getSwitchVisibility(key)"
                @change="toggleTestPolicyTrueFalse(key)" 
              >
              </v-switch>              
            </div>
          </div>
          <div 
            v-if="valueType !== 'testingPolicy'"
            class="mt-4"
          >
            <v-text-field
              label="Latest value from Petersons"
              v-model="this.petersonsValue"
              disabled
            />
          </div>
        </div>
        <div 
          v-if="editMode && userStore.adminMode && field == 'sat1Combined50th'"
        >
          <div class="d-flex flex-column">
            <v-text-field
              label="SAT 50th%ile"
              v-model="updateValue"
              @input="saveButtonVisibility"
              disabled
            />
            <v-text-field
              label="Math"
              v-model="updateMathValue" 
              @input="handleSatSubscoreInput"
            />
            <v-text-field
              label="Verbal"
              v-model="updateVerbalValue"
              @input="handleSatSubscoreInput" 
            />
            <v-btn
              color="primary"
              class="mt-4"
              :disabled="!saveButtonVisibility()"
              @click="this.updateDB"
            >Save</v-btn>
          </div>          
        </div>
      </div>
    </div>
  </template>

<script>
import { dbFireStore } from "../firebase";
import { setDoc, doc, deleteField, getDoc } from 'firebase/firestore'
import { useUserStore } from '../stores/userStore';

export default {
  setup() {
    let userStore = useUserStore();
    userStore.getAdminMode();
    return { 
      userStore 
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.valueType === 'testingPolicy') {
        this.getTestingPolicyVisiblilitySwitchValues();
        this.updateTestingContainers();
      }
    }, 1000);
  },
  data() {
    return {
      editMode: false,
      currentValue: null,
      updateValue: null,
      petersonsValue: null,
      manualValue: null,
      displayPercentage: false,
      petersonsMathValue: null,
      petersonsVerbalValue: null,
      manualMathValue: null,
      manualVerbalValue: null,
      updateMathValue: null,
      updateVerbalValue: null,
      initialEditValue: null,
      initialEditMathValue: null,
      initialEditVerbalValue: null,
      testingPolicySwitchVisibiltyValues: {},
      testingContainers: [],
      testingPoliciesEmptyState: true
    }
  },
  methods: {
    getTestingPolicyEmptyState() {
      this.testingPoliciesEmptyState = true;
      if (this.testingContainers.some(container => container.header === "Not used")) {
          if (this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy === undefined || this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy === false) {
          this.testingPoliciesEmptyState = false;
        }
      }
      
      if (this.testingContainers.some(container => container.header === "Considered")) {      
        if (this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy === undefined || this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy === false) {
          this.testingPoliciesEmptyState = false;
        }
      }

      if (this.testingContainers.some(container => container.header === "Required")) {
        if (this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy === undefined || this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy === false) {
        this.testingPoliciesEmptyState = false;
        }
      }
      console.log(this.testingPoliciesEmptyState);
    },
    getPolicyVisibilityValues(header) {
      
      switch (header) {
        case 'Required':
          return !this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy;
        case 'Considered':
          return !this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy;
        case 'Not used':
          return !this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy;
        default:
          return false
      }
    },
    updateTestingContainers() {
      // check if this.currentValue is an object
      if (typeof this.currentValue !== 'object') return;

      this.testingContainers = [];      
      for (let key in this.currentValue) {
        if (this.currentValue[key] && this.currentValue[key] !== '—') {
          let displayKey = key;

          if (this.currentValue[key].includes('SAT or ACT')) {
            this.currentValue[key] = 'SAT or ACT';
          }
          if (this.currentValue[key].includes('Other standardized tests')) {
            this.currentValue[key] = this.currentValue[key].replace(/Other standardized tests/g, '');
          }
          if (this.currentValue[key].includes('SAT Subject Tests')) {
            this.currentValue[key] = this.currentValue[key].replace(/SAT Subject Tests/g, '');
          }
          if (this.currentValue[key] !== '') {
            this.testingContainers.push({ header: displayKey, body: this.currentValue[key] });
          }
        }
      }
    },
    async getTestingPolicyVisiblilitySwitchValues() {
      if (!this.uri) return {};      
      const docRef = doc(dbFireStore, "manual_institution_data", this.uri);
      const docSnap = await getDoc(docRef);
      this.testingPolicySwitchVisibiltyValues = {
        "showRequiredTestingPolicy": docSnap.data()?.showRequiredTestingPolicy,
        "showConsideredTestingPolicy": docSnap.data()?.showConsideredTestingPolicy,
        "showNotUsedTestingPolicy": docSnap.data()?.showNotUsedTestingPolicy,
      };
    },
    getPopulatedTestingPolicies() {
      if (!this.currentValue) return {};
      let filteredObject = Object.keys(this.currentValue).reduce((obj, key) => {
        if (key !== 'manual' && this.currentValue[key] !== '—' && this.currentValue[key] !== '') {
          obj[key] = this.currentValue[key];
        }
        return obj;
      }, {});
      return filteredObject;
    },
    getSwitchVisibility(key) {
      switch (key) {
        case 'Required':
          return !this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy;
        case 'Considered':
          return !this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy;
        case 'Not used':
          return !this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy;
        default:
          return false
      }
    },
    toggleTestPolicyTrueFalse(key) {
      switch (key) {
        case 'Required':
          this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy = !this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy;
          setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
            showRequiredTestingPolicy: this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy,
          }, { merge: true });
          setDoc(doc(dbFireStore, 'institutions_integrated', this.uri), {
            showRequiredTestingPolicy: this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy,
          }, { merge: true });
          break;
        case 'Considered':
          this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy = !this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy;
          setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
            showConsideredTestingPolicy: this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy,
          }, { merge: true });
          setDoc(doc(dbFireStore, 'institutions_integrated', this.uri), {
            showConsideredTestingPolicy: this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy,
          }, { merge: true });
          break;
        case 'Not used':
          this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy = !this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy;
          setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
            showNotUsedTestingPolicy: this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy,
          }, { merge: true });
          setDoc(doc(dbFireStore, 'institutions_integrated', this.uri), {
            showNotUsedTestingPolicy: this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy,
          }, { merge: true });
          break;
        default:
          break;
      }
    },
    updateDB() {
      const manualDataUpdates = {};
      const integratedDataUpdates = {};

      // Handle combined score
      if (this.updateValue === null || this.updateValue === '') {
        // If manual value is cleared, delete from manual and revert integrated to petersons
        manualDataUpdates[this.field] = deleteField();
        integratedDataUpdates[this.field] = this.petersonsValue !== null ? this.petersonsValue : deleteField();
      } else {
        // If manual value exists, update both manual and integrated
        manualDataUpdates[this.field] = this.updateValue;
        integratedDataUpdates[this.field] = this.updateValue;
      }

      // Handle Math and Verbal scores specifically for SAT
      if (this.field === 'sat1Combined50th') {
        // Math
        if (this.updateMathValue === null || this.updateMathValue === '') {
          manualDataUpdates['sat1Math50thP'] = deleteField();
          integratedDataUpdates['sat1Math50thP'] = this.petersonsMathValue !== null ? this.petersonsMathValue : deleteField();
        } else {
          manualDataUpdates['sat1Math50thP'] = this.updateMathValue;
          integratedDataUpdates['sat1Math50thP'] = this.updateMathValue;
        }
        // Verbal
        if (this.updateVerbalValue === null || this.updateVerbalValue === '') {
          manualDataUpdates['sat1Verb50thP'] = deleteField();
          integratedDataUpdates['sat1Verb50thP'] = this.petersonsVerbalValue !== null ? this.petersonsVerbalValue : deleteField();
        } else {
          manualDataUpdates['sat1Verb50thP'] = this.updateVerbalValue;
          integratedDataUpdates['sat1Verb50thP'] = this.updateVerbalValue;
        }
      }

      // Apply updates to Firestore
      setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), manualDataUpdates, { merge: true });
      setDoc(doc(dbFireStore, 'institutions_integrated', this.uri), integratedDataUpdates, { merge: true });

      // Update local state after successful DB update
      this.currentValue = (this.updateValue !== null && this.updateValue !== '') ? this.updateValue : this.petersonsValue;
      this.manualValue = (this.updateValue !== null && this.updateValue !== '') ? this.updateValue : null;
      if (this.field === 'sat1Combined50th') {
        this.manualMathValue = (this.updateMathValue !== null && this.updateMathValue !== '') ? this.updateMathValue : null;
        this.manualVerbalValue = (this.updateVerbalValue !== null && this.updateVerbalValue !== '') ? this.updateVerbalValue : null;
      }

      localStorage.removeItem("tableData");
      this.editMode = false; // Close edit mode after saving
    },
    saveButtonVisibility(){
      // Compare current input values with the initial values set when edit mode started
      const combinedChanged = this.normalizeValue(this.updateValue) !== this.normalizeValue(this.initialEditValue);
      let mathChanged = false;
      let verbalChanged = false;

      if (this.field === 'sat1Combined50th') {
         mathChanged = this.normalizeValue(this.updateMathValue) !== this.normalizeValue(this.initialEditMathValue);
         verbalChanged = this.normalizeValue(this.updateVerbalValue) !== this.normalizeValue(this.initialEditVerbalValue);
      }
      // Enable save if any relevant value has changed
      if (combinedChanged || mathChanged || verbalChanged) {
         return true
      } else {
         return false
      }
    },
    processValue(value, valueType) {
      const numberValue = Number(value);
      if (numberValue === -1 || numberValue === 0 || numberValue === null || numberValue === undefined || numberValue === '-') {
        return '—';
      }

      switch (valueType) {
        case 'string':
          return (value || '—');
        case 'numberNoComma':
          return (value || '—');
        case 'date':
          if (value) {
            return value;
          } else {
            return '—';
          }
        case 'percentage':
          this.displayPercentage = true;
          return ((Math.round(numberValue  * 100)?.toLocaleString()) || '—' );
        case 'percentageWholeNumbers':
          this.displayPercentage = true;
          return (Math.round(numberValue)?.toLocaleString() || '—');
        default:
          return (numberValue?.toLocaleString() || '—');
      }
    },
    normalizeValue(value) {
      if (typeof value === 'string') {
        return value.trim();
      } else if (typeof value === 'number') {
        return value.toString().trim();
      } else if (typeof value === 'object' && value !== null) {
        return Object.values(value).map(this.normalizeValue).join('').trim();
      } else {
        return '';
      }
    },
    calculateAndUpdateCombinedScore() {
      const math = parseInt(this.updateMathValue) || 0;
      const verbal = parseInt(this.updateVerbalValue) || 0;
      // Only update if at least one value is entered, otherwise keep it consistent with initial state (null/empty)
      if (this.updateMathValue || this.updateVerbalValue) {
        this.updateValue = (math + verbal).toString();
      } else {
        // If both fields are cleared, reset combined score to reflect that (could be null or empty string depending on desired behavior)
        this.updateValue = null; // Or perhaps ''
      }
    },
    handleSatSubscoreInput() {
      this.saveButtonVisibility(); // Keep existing visibility logic
      this.calculateAndUpdateCombinedScore(); // Add combined score calculation
    }
  },
  props: {
    label: {
      type: String,
    },  
    valueFromIntegrated: {
      type: [Number, String, Object],
    },
    valueFromPetersons: {
      type: [Number, String, Object],
    },
    valueFromManual: {
      type: [Number, String],
    },
    valueFromPetersonsMath: {
      type: [Number, String],
    },
    valueFromPetersonsVerbal: {
      type: [Number, String],
    },
    valueFromManualMath: {
      type: [Number, String],
    },
    valueFromManualVerbal: {
      type: [Number, String],
    },
    uri: {
      type: String,
    },
    field: {
      type: String,
    },
    valueType: {
      type: String,
    },
  },
  watch: {
    editMode(newVal) {
      if (newVal === true) {
        // Initialize based on field type when entering edit mode
        if (this.field === 'sat1Combined50th') {
          // Start with Petersons values for SAT
          this.initialEditValue = this.petersonsValue;
          this.initialEditMathValue = this.petersonsMathValue;
          this.initialEditVerbalValue = this.petersonsVerbalValue;

          // Override with manual values if they exist
          if (this.manualValue !== null && this.manualValue !== undefined) this.initialEditValue = this.manualValue;
          if (this.manualMathValue !== null && this.manualMathValue !== undefined) this.initialEditMathValue = this.manualMathValue;
          if (this.manualVerbalValue !== null && this.manualVerbalValue !== undefined) this.initialEditVerbalValue = this.manualVerbalValue;

          // Set the editable values based on the determined initial values
          this.updateValue = this.initialEditValue;
          this.updateMathValue = this.initialEditMathValue;
          this.updateVerbalValue = this.initialEditVerbalValue;

        } else {
          // For other fields, initialize with the current manual value (which might be null)
          // The displayed value (currentValue) is already set by watchers
          this.initialEditValue = this.manualValue;
          this.updateValue = this.manualValue;
        }
      } else {
         // Reset initial edit values when closing edit mode
         this.initialEditValue = null;
         this.initialEditMathValue = null;
         this.initialEditVerbalValue = null;
      }
    },
    valueFromIntegrated(newVal) {
      if (newVal) {
        this.currentValue = newVal
      }
    },
    valueFromPetersons(newVal) {
      if (newVal) {
        this.petersonsValue = newVal;
        if (this.valueType == 'testingPolicy') {
          this.currentValue = newVal
        }
      }
    },
    valueFromManual(newVal) {
      // Update manualValue whenever the prop changes
      if (newVal !== undefined) { // Check specifically for undefined to allow null/empty strings
        this.manualValue = newVal;
        // Update currentValue only if not testingPolicy (handled separately)
        // and only if the manual value isn't null/undefined (otherwise integrated/petersons should show)
        if (this.valueType !== 'testingPolicy' && newVal !== null && newVal !== undefined) {
          this.currentValue = this.manualValue;
        } else if (this.valueType === 'testingPolicy') {
          // Update manual part of testing policy object if applicable
          this.currentValue = { ...this.currentValue, manual: newVal };
        }
        // Only update the 'updateValue' if *not* in edit mode, to avoid overwriting user input
        // or if the field is not SAT (where initialization happens on entering edit mode)
        if (!this.editMode || this.field !== 'sat1Combined50th') {
           this.updateValue = this.manualValue;
        }
      } else {
         // Handle case where manual value becomes null/undefined from prop
         this.manualValue = null;
         if (this.valueType !== 'testingPolicy') {
            // Revert currentValue to integrated/petersons if manual is cleared
            this.currentValue = this.valueFromIntegrated !== null ? this.valueFromIntegrated : this.petersonsValue;
         } else {
            this.currentValue = { ...this.currentValue, manual: null };
         }
         if (!this.editMode || this.field !== 'sat1Combined50th') {
            this.updateValue = null;
         }
      }
    },
    valueFromPetersonsMath(newVal) {
      this.petersonsMathValue = newVal;
    },
    valueFromPetersonsVerbal(newVal) {
      this.petersonsVerbalValue = newVal;
    },
    valueFromManualMath(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.manualMathValue = newVal;
        // Only update 'updateMathValue' if not in edit mode for SAT field
        if (!this.editMode || this.field !== 'sat1Combined50th') {
          this.updateMathValue = this.manualMathValue;
        }
      } else {
        this.manualMathValue = null;
        // Only update 'updateMathValue' if not in edit mode for SAT field
        if (!this.editMode || this.field !== 'sat1Combined50th') {
          this.updateMathValue = null;
        }
      }
    },
    valueFromManualVerbal(newVal) {
      if (newVal !== undefined && newVal !== null) {
        this.manualVerbalValue = newVal;
        // Only update 'updateVerbalValue' if not in edit mode for SAT field
        if (!this.editMode || this.field !== 'sat1Combined50th') {
           this.updateVerbalValue = this.manualVerbalValue;
        }
      } else {
        this.manualVerbalValue = null;
        // Only update 'updateVerbalValue' if not in edit mode for SAT field
        if (!this.editMode || this.field !== 'sat1Combined50th') {
           this.updateVerbalValue = null;
        }
      }
    },
    testingPolicySwitchVisibiltyValues: {
      handler() {
        this.getTestingPolicyEmptyState();
      },
      deep: true,
    },
  },
  computed: {
    showEditButton() {
      return this.userStore.adminMode
    },
  }
}
</script>