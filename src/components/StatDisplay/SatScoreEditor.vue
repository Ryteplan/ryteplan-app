<template>
  <div class="d-flex flex-column" style="gap: 10px;">
    <div>
      <span style="font-size: 12px;">{{ petersonsCombinedLabel }}</span>
      <v-text-field
        label="SAT 50th%ile"
        :model-value="combinedScore"
        disabled
      />
    </div>
    
    <div>
      <span style="font-size: 12px;">{{ petersonsMathLabel }}</span>
      <v-text-field
        label="Math"
        v-model="localMathValue"
        @input="handleInput"
      />
    </div>
    
    <div>
      <span style="font-size: 12px;">{{ petersonsVerbalLabel }}</span>
      <v-text-field
        label="Verbal"
        v-model="localVerbalValue"
        @input="handleInput"
      />
    </div>
    
    <v-btn
      color="primary"
      class="mt-4"
      :disabled="!hasChanges"
      @click="handleSave"
    >
      Save
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SatScoreEditor',
  
  props: {
    mathValue: {
      type: [Number, String],
      default: null
    },
    verbalValue: {
      type: [Number, String],
      default: null
    },
    petersonsMath: {
      type: [Number, String],
      default: null
    },
    petersonsVerbal: {
      type: [Number, String],
      default: null
    },
    petersonsCombined: {
      type: [Number, String],
      default: null
    },
    initialMath: {
      type: [Number, String],
      default: null
    },
    initialVerbal: {
      type: [Number, String],
      default: null
    }
  },

  data() {
    return {
      localMathValue: null,
      localVerbalValue: null
    };
  },

  computed: {
    combinedScore() {
      const math = parseInt(this.localMathValue) || 0;
      const verbal = parseInt(this.localVerbalValue) || 0;
      return (this.localMathValue || this.localVerbalValue) 
        ? (math + verbal).toString() 
        : null;
    },

    hasChanges() {
      const mathChanged = this.normalizeValue(this.localMathValue) !== 
                         this.normalizeValue(this.initialMath);
      const verbalChanged = this.normalizeValue(this.localVerbalValue) !== 
                           this.normalizeValue(this.initialVerbal);
      return mathChanged || verbalChanged;
    },

    petersonsMathLabel() {
      return this.petersonsMath ? `Petersons: ${this.petersonsMath}` : '';
    },

    petersonsVerbalLabel() {
      return this.petersonsVerbal ? `Petersons: ${this.petersonsVerbal}` : '';
    },

    petersonsCombinedLabel() {
      return this.petersonsCombined ? `Petersons: ${this.petersonsCombined}` : '';
    }
  },

  watch: {
    mathValue: {
      immediate: true,
      handler(newVal) {
        this.localMathValue = newVal;
      }
    },
    verbalValue: {
      immediate: true,
      handler(newVal) {
        this.localVerbalValue = newVal;
      }
    }
  },

  methods: {
    handleInput() {
      this.$emit('change', {
        math: this.localMathValue,
        verbal: this.localVerbalValue,
        combined: this.combinedScore
      });
    },

    handleSave() {
      this.$emit('save', {
        math: this.localMathValue,
        verbal: this.localVerbalValue,
        combined: this.combinedScore
      });
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
