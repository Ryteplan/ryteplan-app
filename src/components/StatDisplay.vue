<template>
    <div class="stat-container" style="position: relative">
      <div class="d-flex justify-between">
        <div>
        <span class="stat-label">{{ label }}</span>
        <span class="stat-content d-flex">
          <span class="d-block">{{ currentValue?.toLocaleString() || '—' }}</span>
        </span>
      </div>
      <v-btn
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
          v-if="!editMode"
        >
          <v-text-field
            label="Manual Value"
            v-model="this.updateValue"
            clearable
          >
          </v-text-field>
          <v-text-field
            label="Value from Petersons"
            v-model="this.valueFromPetersons"
            disabled
            >
          </v-text-field>
          <v-btn
            value="save"
            @click="this.updateDB"
          >Save</v-btn>
        </div>
      </div>
    </div>
  </template>

<script>
  import { dbFireStore } from "../firebase";
  import { collection, documentId, query, where, getDocs, setDoc, doc } from 'firebase/firestore'

export default {
  setup() {

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
    }
  },
  methods: {
    updateDB() {
      setDoc(doc(dbFireStore, 'manual_institution_data', this.uri), {
        [this.field]: this.updateValue
      }, { merge: true });
    }
  },
  props: {
    label: {
      type: String,
    },  
    valueFromPetersons: {
      type: [Number, String],
    },
    valueFromManual: {
      type: [Number, String],
    },
    uri: {
      type: String,
    },
    field: {
      type: String,
    }
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
      }
    },
  },
}
</script>
  
<style scoped>
/* Add your CSS styles here */
</style>