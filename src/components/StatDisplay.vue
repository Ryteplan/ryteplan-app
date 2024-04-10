<template>
    <div class="stat-container" style="position: relative">
      <div class="d-flex justify-between">
        <div>
        <span class="stat-label">{{ label }}</span>
        <span class="stat-content d-flex">
          <span class="d-flex">
            <span v-html="processValue(currentValue, valueType)"></span>
            <span v-if="displayPercentage">%</span>
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
          >
          </v-text-field>
          <v-text-field
            label="Value from Petersons"
            v-model="this.petersonsValue"
            disabled
          >
          </v-text-field>
          <v-btn
            v-if="saveButtonVisibility"
            value="save"
            @click="this.updateDB"
          >Save</v-btn>
        </div>
      </div>
    </div>
  </template>

<script>
import { dbFireStore } from "../firebase";
import { setDoc, doc, deleteField } from 'firebase/firestore'
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

  },
  data() {
    return {
      editMode: false,
      currentValue: null,
      updateValue: null,
      petersonsValue: null,
      manualValue: null,
      displayPercentage: false,
    }
  },
  methods: {
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
        this.currentValue = this.updateValue;
      } else {
        this.currentValue = this.petersonsValue;
      }
    },
    saveButtonVisibility(){
      console.log(this.currentValue, this.updateValue);
      console.log(this.currentValue !== this.updateValue || this.updateValue === null)
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
        case 'date':
          if (value) {
            return value;
          } else {
            return '—';
          }
        case 'percentage':
          this.displayPercentage = true;
          return ((value?.toLocaleString() * 100).toFixed(0) || '—' );
        case 'percentageWholeNumbers':
          this.displayPercentage = true;
          return (numberValue?.toLocaleString() || '—');
        case 'testingPolicy': {
          let result = "";
          for (let key in value) {
            if (value[key] !== '—') {
              result += `<div class="testing-container"> <span class="testing-header">${key}</span> <span class="testing-body">${value[key]}</span></div>`;
            }
          }
          if (result) {
            return result;
          } else {
            return '—';
          }
        }
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
  },
  computed: {
    showEditButton() {
      if (this.valueType !== "testingPolicy") {
        return this.userStore.adminMode
      } else {
        return false;
      }
    }
  }
}
</script>
  
<style scoped>

</style>