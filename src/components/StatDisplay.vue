<template>
  <div class="stat-container" style="position: relative">
    <!-- Display Section -->
    <div class="d-flex justify-between">
      <div>
        <span class="stat-label">{{ label }}</span>
        <span class="stat-content d-flex">
          <span class="d-flex">
            <!-- Regular Value Display -->
            <div v-if="!isTestingPolicyField">
              <span v-html="formattedValue"></span>
              <span v-if="showPercentage">%</span>
            </div>
            
            <!-- Testing Policy Display -->
            <div v-else-if="manualValue">
              <span class="d-block testing-header">Rya's Note</span>
              <span class="d-block testing-body">{{ manualValue }}</span>
            </div>
          </span>
        </span>
      </div>
      
      <!-- Edit Button -->
      <v-btn
        v-if="showEditButton"
        density="compact"
        class="ml-4"
        icon="mdi-pencil"
        @click="toggleEditMode"
        variant="plain"
        color="primary"
      />
    </div>

    <!-- Edit Section -->
    <div class="mt-4" v-if="editMode && userStore.adminMode">
      <!-- SAT Score Editor -->
      <SatScoreEditor
        v-if="isSatField"
        :math-value="updateMathValue"
        :verbal-value="updateVerbalValue"
        :petersons-math="petersonsMathValue"
        :petersons-verbal="petersonsVerbalValue"
        :petersons-combined="petersonsValue"
        :initial-math="initialEditMathValue"
        :initial-verbal="initialEditVerbalValue"
        @change="handleSatChange"
        @save="handleSatSave"
      />

      <!-- Generic Value Editor -->
      <GenericValueEditor
        v-else-if="!isTestingPolicyField"
        :value="updateValue"
        :petersons-value="petersonsValue"
        :initial-value="initialEditValue"
        @change="handleValueChange"
        @save="handleGenericSave"
      />

      <!-- Testing Policy Editor -->
      <TestingPolicyEditor
        v-else
        :policies="currentValue"
        :visibility-settings="testingPolicySwitchVisibiltyValues"
        @toggle="handleTestingPolicyToggle"
      />
    </div>
  </div>
</template>

<script>
import { dbFireStore } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { useUserStore } from '../stores/userStore';
import { useValueFormatter } from '../composables/useValueFormatter';
import { useStatDatabase } from '../composables/useStatDatabase';
import SatScoreEditor from './StatDisplay/SatScoreEditor.vue';
import GenericValueEditor from './StatDisplay/GenericValueEditor.vue';
import TestingPolicyEditor from './StatDisplay/TestingPolicyEditor.vue';

// Constants
const SAT_FIELD = 'sat1Combined50th';
const TESTING_POLICY_VALUE_TYPE = 'testingPolicy';
const TESTING_POLICY_MAP = {
  'Required': 'showRequiredTestingPolicy',
  'Considered': 'showConsideredTestingPolicy',
  'Not used': 'showNotUsedTestingPolicy'
};

export default {
  name: 'StatDisplay',

  components: {
    SatScoreEditor,
    GenericValueEditor,
    TestingPolicyEditor
  },

  setup() {
    const userStore = useUserStore();
    userStore.getAdminMode();
    
    const { processValue, normalizeValue } = useValueFormatter();
    const { updateInstitutionData, updateTestingPolicyVisibility } = useStatDatabase();

    return {
      userStore,
      processValue,
      normalizeValue,
      updateInstitutionData,
      updateTestingPolicyVisibility
    };
  },

  props: {
    label: {
      type: String,
      required: true
    },
    valueFromIntegrated: {
      type: [Number, String, Object],
      default: null
    },
    valueFromPetersons: {
      type: [Number, String, Object],
      default: null
    },
    valueFromManual: {
      type: [Number, String],
      default: null
    },
    valueFromPetersonsMath: {
      type: [Number, String],
      default: null
    },
    valueFromPetersonsVerbal: {
      type: [Number, String],
      default: null
    },
    valueFromManualMath: {
      type: [Number, String],
      default: null
    },
    valueFromManualVerbal: {
      type: [Number, String],
      default: null
    },
    uri: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    valueType: {
      type: String,
      default: 'default'
    }
  },

  data() {
    return {
      editMode: false,
      currentValue: null,
      updateValue: null,
      petersonsValue: null,
      manualValue: null,
      petersonsMathValue: null,
      petersonsVerbalValue: null,
      manualMathValue: null,
      manualVerbalValue: null,
      updateMathValue: null,
      updateVerbalValue: null,
      initialEditValue: null,
      initialEditMathValue: null,
      initialEditVerbalValue: null,
      testingPolicySwitchVisibiltyValues: {}
    };
  },

  computed: {
    isSatField() {
      return this.field === SAT_FIELD;
    },

    isTestingPolicyField() {
      return this.valueType === TESTING_POLICY_VALUE_TYPE;
    },

    showEditButton() {
      return this.userStore.adminMode;
    },

    formattedValue() {
      const result = this.processValue(this.currentValue, this.valueType);
      return result.formatted;
    },

    showPercentage() {
      const result = this.processValue(this.currentValue, this.valueType);
      return result.showPercentage;
    }
  },

  watch: {
    valueFromIntegrated: {
      immediate: true,
      handler(newVal) {
        if (newVal !== undefined && newVal !== null) {
          this.currentValue = newVal;
        }
      }
    },

    valueFromPetersons: {
      immediate: true,
      handler(newVal) {
        if (newVal !== undefined && newVal !== null) {
          this.petersonsValue = newVal;
          if (this.isTestingPolicyField) {
            this.currentValue = newVal;
          }
        }
      }
    },

    valueFromManual: {
      immediate: true,
      handler(newVal) {
        this.handleManualValueChange(newVal);
      }
    },

    valueFromPetersonsMath: {
      immediate: true,
      handler(newVal) {
        this.petersonsMathValue = newVal;
      }
    },

    valueFromPetersonsVerbal: {
      immediate: true,
      handler(newVal) {
        this.petersonsVerbalValue = newVal;
      }
    },

    valueFromManualMath: {
      immediate: true,
      handler(newVal) {
        this.handleManualMathChange(newVal);
      }
    },

    valueFromManualVerbal: {
      immediate: true,
      handler(newVal) {
        this.handleManualVerbalChange(newVal);
      }
    },

    editMode(isEditMode) {
      if (isEditMode) {
        this.initializeEditMode();
      } else {
        this.resetEditMode();
      }
    }
  },

  mounted() {
    if (this.isTestingPolicyField) {
      setTimeout(() => {
        this.loadTestingPolicySettings();
      }, 1000);
    }
  },

  methods: {
    // Edit Mode Management
    toggleEditMode() {
      this.editMode = !this.editMode;
    },

    initializeEditMode() {
      if (this.isSatField) {
        this.initializeSatEditMode();
      } else {
        this.initialEditValue = this.manualValue;
        this.updateValue = this.manualValue;
      }
    },

    initializeSatEditMode() {
      this.initialEditValue = this.petersonsValue;
      this.initialEditMathValue = this.petersonsMathValue;
      this.initialEditVerbalValue = this.petersonsVerbalValue;

      if (this.manualValue !== null && this.manualValue !== undefined) {
        this.initialEditValue = this.manualValue;
      }
      if (this.manualMathValue !== null && this.manualMathValue !== undefined) {
        this.initialEditMathValue = this.manualMathValue;
      }
      if (this.manualVerbalValue !== null && this.manualVerbalValue !== undefined) {
        this.initialEditVerbalValue = this.manualVerbalValue;
      }

      this.updateValue = this.initialEditValue;
      this.updateMathValue = this.initialEditMathValue;
      this.updateVerbalValue = this.initialEditVerbalValue;
    },

    resetEditMode() {
      this.initialEditValue = null;
      this.initialEditMathValue = null;
      this.initialEditVerbalValue = null;
    },

    // Value Change Handlers
    handleManualValueChange(newVal) {
      if (newVal !== undefined) {
        this.manualValue = newVal;
        
        if (this.isTestingPolicyField) {
          this.currentValue = { ...this.currentValue, manual: newVal };
        } else if (newVal !== null && newVal !== undefined) {
          this.currentValue = this.manualValue;
        } else {
          this.currentValue = this.valueFromIntegrated !== null 
            ? this.valueFromIntegrated 
            : this.petersonsValue;
        }

        if (!this.editMode || !this.isSatField) {
          this.updateValue = this.manualValue;
        }
      } else {
        this.manualValue = null;
        if (!this.isTestingPolicyField) {
          this.currentValue = this.valueFromIntegrated !== null 
            ? this.valueFromIntegrated 
            : this.petersonsValue;
        } else {
          this.currentValue = { ...this.currentValue, manual: null };
        }
        if (!this.editMode || !this.isSatField) {
          this.updateValue = null;
        }
      }
    },

    handleManualMathChange(newVal) {
      this.manualMathValue = newVal !== undefined && newVal !== null ? newVal : null;
      if (!this.editMode || !this.isSatField) {
        this.updateMathValue = this.manualMathValue;
      }
    },

    handleManualVerbalChange(newVal) {
      this.manualVerbalValue = newVal !== undefined && newVal !== null ? newVal : null;
      if (!this.editMode || !this.isSatField) {
        this.updateVerbalValue = this.manualVerbalValue;
      }
    },

    // Save Handlers
    handleValueChange(value) {
      this.updateValue = value;
    },

    async handleGenericSave(value) {
      await this.updateInstitutionData(this.uri, {
        [this.field]: {
          value,
          petersonsValue: this.petersonsValue
        }
      });

      this.currentValue = value !== null && value !== '' 
        ? value 
        : this.petersonsValue;
      this.manualValue = value !== null && value !== '' ? value : null;
      this.editMode = false;
    },

    handleSatChange({ math, verbal, combined }) {
      this.updateMathValue = math;
      this.updateVerbalValue = verbal;
      this.updateValue = combined;
    },

    async handleSatSave({ math, verbal, combined }) {
      await this.updateInstitutionData(this.uri, {
        [this.field]: {
          value: combined,
          petersonsValue: this.petersonsValue
        },
        'sat1Math50thP': {
          value: math,
          petersonsValue: this.petersonsMathValue
        },
        'sat1Verb50thP': {
          value: verbal,
          petersonsValue: this.petersonsVerbalValue
        }
      });

      this.currentValue = combined !== null && combined !== '' 
        ? combined 
        : this.petersonsValue;
      this.manualValue = combined !== null && combined !== '' ? combined : null;
      this.manualMathValue = math !== null && math !== '' ? math : null;
      this.manualVerbalValue = verbal !== null && verbal !== '' ? verbal : null;
      
      this.editMode = false;
    },

    async handleTestingPolicyToggle(policyKey) {
      const fieldName = TESTING_POLICY_MAP[policyKey];
      const currentValue = this.testingPolicySwitchVisibiltyValues[fieldName];
      const newValue = !currentValue;

      this.testingPolicySwitchVisibiltyValues[fieldName] = newValue;
      
      await this.updateTestingPolicyVisibility(this.uri, policyKey, newValue);
    },

    // Testing Policy Methods
    async loadTestingPolicySettings() {
      if (!this.uri) return;

      const docRef = doc(dbFireStore, 'manual_institution_data', this.uri);
      const docSnap = await getDoc(docRef);
      
      this.testingPolicySwitchVisibiltyValues = {
        showRequiredTestingPolicy: docSnap.data()?.showRequiredTestingPolicy,
        showConsideredTestingPolicy: docSnap.data()?.showConsideredTestingPolicy,
        showNotUsedTestingPolicy: docSnap.data()?.showNotUsedTestingPolicy
      };
    }
  }
};
</script>

<style scoped>
.stat-container {
  padding: 8px 0;
}

.stat-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.stat-content {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.87);
}

.testing-header {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.testing-body {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
}
</style>
