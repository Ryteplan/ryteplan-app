<template>
  <div>
    <v-text-field
      label="Manual Value"
      v-model="localValue"
      @input="handleInput"
      clearable
    />
    
    <v-btn
      v-if="hasChanges"
      color="primary"
      @click="handleSave"
    >
      Save
    </v-btn>
    
    <v-text-field
      v-if="showPetersonsValue"
      label="Latest value from Petersons"
      :model-value="petersonsValue"
      disabled
      class="mt-4"
    />
  </div>
</template>

<script>
export default {
  name: 'GenericValueEditor',

  props: {
    value: {
      type: [Number, String],
      default: null
    },
    petersonsValue: {
      type: [Number, String],
      default: null
    },
    initialValue: {
      type: [Number, String],
      default: null
    },
    showPetersonsValue: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      localValue: null
    };
  },

  computed: {
    hasChanges() {
      return this.normalizeValue(this.localValue) !== 
             this.normalizeValue(this.initialValue);
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.localValue = newVal;
      }
    }
  },

  methods: {
    handleInput() {
      this.$emit('change', this.localValue);
    },

    handleSave() {
      this.$emit('save', this.localValue);
    },

    normalizeValue(value) {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (typeof value === 'number') {
        return value.toString().trim();
      }
      return '';
    }
  }
};
</script>
