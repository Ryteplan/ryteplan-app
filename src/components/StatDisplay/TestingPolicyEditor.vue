<template>
  <div>
    <div 
      v-for="(value, key) in populatedPolicies" 
      :key="key"
    >
      <v-switch 
        :label="key"
        color="primary"
        hide-details
        dense
        :model-value="getSwitchValue(key)"
        @change="handleToggle(key)"
      />
    </div>
  </div>
</template>

<script>
const POLICY_FIELD_MAP = {
  'Required': 'showRequiredTestingPolicy',
  'Considered': 'showConsideredTestingPolicy',
  'Not used': 'showNotUsedTestingPolicy'
};

export default {
  name: 'TestingPolicyEditor',

  props: {
    policies: {
      type: Object,
      default: () => ({})
    },
    visibilitySettings: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    populatedPolicies() {
      if (!this.policies) return {};
      
      return Object.keys(this.policies).reduce((obj, key) => {
        const value = this.policies[key];
        const isValid = key !== 'manual' && 
                       value !== '—' && 
                       value !== '';
        if (isValid) {
          obj[key] = value;
        }
        return obj;
      }, {});
    }
  },

  methods: {
    getSwitchValue(policyKey) {
      const fieldName = POLICY_FIELD_MAP[policyKey];
      return !this.visibilitySettings[fieldName];
    },

    handleToggle(policyKey) {
      this.$emit('toggle', policyKey);
    }
  }
};
</script>
