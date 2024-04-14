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
              <span v-if="this.testingPoliciesEmptyState || this.testingContainers.length == 0">—</span>
              <div 
                v-for="(container, index) in testingContainers" 
                :key="index"
                class="testing-container" 
              >
                <div 
                  v-if="getPolicyVisibilityValues(container.header)"
                >
                  <span class="d-block testing-header">{{ container.header }}</span>
                  <span class="d-block testing-body">{{ container.body }}</span>
                </div>
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
          v-if="editMode && userStore.adminMode"
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
              label="Value from Petersons"
              v-model="this.petersonsValue"
              disabled
            />
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
          console.log("not empty state");
          this.testingPoliciesEmptyState = false;
        }
      }
      
      if (this.testingContainers.some(container => container.header === "Considered")) {      
        if (this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy === undefined || this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy === false) {
          console.log("is it this? 123465");
          this.testingPoliciesEmptyState = false;
        }
      }

      if (this.testingContainers.some(container => container.header === "Required")) {
        if (this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy === undefined || this.testingPolicySwitchVisibiltyValues.showRequiredTestingPolicy === false) {
        console.log("is it this? 123465 7777");
        this.testingPoliciesEmptyState = false;
        }
      }

      if (this.testingContainers.some(container => container.header === "Rya's Note")) {
        this.testingPoliciesEmptyState = false;
      }
    },
    getPolicyVisibilityValues(header) {
      switch (header) {
        case "Rya's Note":
          return true
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
      this.testingContainers = [];
      for (let key in this.currentValue) {
        if (this.currentValue[key] && this.currentValue[key] !== '—') {
          let displayKey = key === 'manual' ? "Rya's Note" : key;
          // detect is currentValue contains the string 'Sat or ACT' remove strings that contain 'SAT' or 'ACT'
          if (this.currentValue[key].includes('SAT or ACT')) {
            this.currentValue[key] = 'SAT or ACT';
          }
          if (this.currentValue[key].includes('Other standardized tests')) {
            this.currentValue[key] = this.currentValue[key].replace(/Other standardized tests/g, '');
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
          break;
        case 'Considered':
          this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy = !this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy;
          setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
            showConsideredTestingPolicy: this.testingPolicySwitchVisibiltyValues.showConsideredTestingPolicy,
          }, { merge: true });
          break;
        case 'Not used':
          this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy = !this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy;
          setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
            showNotUsedTestingPolicy: this.testingPolicySwitchVisibiltyValues.showNotUsedTestingPolicy,
          }, { merge: true });
          break;
        default:
          break;
      }
    },
    updateDB() {
      if (this.updateValue === null) {
        setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
          [this.field]: deleteField()
        }, { merge: true });
      } else {
        setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
          [this.field]: this.updateValue
        }, { merge: true });
      }

      if (this.updateValue) {
        if (this.valueType === 'testingPolicy') {
          this.currentValue["manual"] = this.updateValue;
        } else {
          this.currentValue = this.updateValue;
        }
      } else {
        if (this.valueType === 'testingPolicy') {
          this.currentValue["manual"] = this.updateValue;
        } else {
          this.currentValue = this.petersonsValue;
        }
      }
    },
    saveButtonVisibility(){
      if (this.currentValue !== this.updateValue || this.updateValue === null) {
        return true
      } else {
        return false
      }
    },
    processValue(value, valueType) {

      const numberValue = Number(value);
      if (numberValue === 0) {
        return '—';
      }

      switch (valueType) {
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
          return ((Math.round(numberValue)?.toLocaleString() * 100) || '—' );
        case 'percentageWholeNumbers':
          this.displayPercentage = true;
          return (Math.round(numberValue)?.toLocaleString() || '—');
        default:
          return (numberValue?.toLocaleString() || '—');
      }
    }
  },
  props: {
    label: {
      type: String,
    },  
    valueFromPetersons: {
      type: [Number, String, Object],
    },
    valueFromManual: {
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
    valueFromPetersons(newVal) {
      if (newVal) {
        this.petersonsValue = newVal;
        this.currentValue = this.petersonsValue
      }
    },
    valueFromManual(newVal) {
      if (newVal) {
        this.manualValue = newVal;
        this.currentValue = this.manualValue
        this.updateValue = this.manualValue
      }
    },
    testingPolicySwitchVisibiltyValues: {
    handler() {
        this.getTestingPolicyEmptyState(); // Or your desired function
      },
      deep: true, // Deep watch for object changes
    },
  },
  computed: {
    showEditButton() {
      return this.userStore.adminMode
    },
  }
}
</script>
  
<style scoped>

</style>