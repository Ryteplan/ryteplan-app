<template>
  <v-card 
    class="institution-card mb-4" 
    elevation="2"
    @click="handleClick"
    style="cursor: pointer;"
  >
    <div class="d-flex">
      <v-card-text class="flex-grow-1">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-h6">{{ item.name }}</span>
          <v-checkbox
            v-if="showSelect"
            v-model="selected"
            hide-details
            @click.stop
            @change="$emit('update:selected', selected)"
          />
        </div>
        <v-row>
          <v-col cols="12" sm="4">
            <div class="info-item">
              <span class="font-weight-medium">State:</span>
              <span>{{ formatCellValue(item.stateCleaned) }}</span>
            </div>
            <div class="info-item">
              <span class="font-weight-medium">Sector:</span>
              <span>{{ formatCellValue(item.mainInstControlDesc) }}</span>
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="info-item">
              <span class="font-weight-medium">UG Enrollment:</span>
              <span>{{ formatCellValue(item.enTotUgN) }}</span>
            </div>
            <div class="info-item">
              <span class="font-weight-medium">Calendar:</span>
              <span>{{ formatCellValue(item.mainCalendar) }}</span>
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="info-item">
              <span class="font-weight-medium">Setting:</span>
              <span>{{ formatCellValue(item.cmpsSetting) }}</span>
            </div>
            <div class="info-item">
              <span class="font-weight-medium">Admission Rate:</span>
              <span>{{ formatCellValue(item.admitRate) }}%</span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'InstitutionCard',
  props: {
    item: {
      type: Object,
      required: true
    },
    showSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selected: false
    }
  },
  methods: {
    handleClick(event) {
      this.$emit('click', { event, item: this.item });
    },
    formatCellValue(value) {
      if (value === -1 || value === '-1' || value === '0' || value === 0 || value === null || value === undefined || value === '-') {
        return '—';
      } else if (typeof value === 'string' && value.trim() === '') {
        return '—';
      } else {
        return value;
      }
    }
  }
}
</script>

<style scoped>
.institution-card {
  transition: transform 0.2s;
}

.institution-card:hover {
  transform: translateY(-2px);
  background-color: #efefef;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
}

.info-item span:first-child {
  color: rgba(0, 0, 0, 0.6);
  min-width: 100px;
}

.v-card-text {
  padding-right: 16px;
}
</style> 