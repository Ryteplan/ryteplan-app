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
            class="d-none"
            v-if="showSelect"
            v-model="selected"
            hide-details
            @click.stop
            @change="$emit('update:selected', selected)"
          />
        </div>
        <v-row>
          <v-col cols="4" md="2">
            <div class="info-item">
              <span class="font-weight-medium text-caption">State</span>
              <span class="text-body-1">{{ formatCellValue(item.stateCleaned) }}</span>
            </div>
          </v-col>
          <v-col cols="4" md="2">
            <div class="info-item">
              <span class="font-weight-medium text-caption">Sector</span>
              <span class="text-body-1">{{ formatCellValue(item.mainInstControlDesc) }}</span>
            </div>
          </v-col>
          <v-col cols="4" md="2">
            <div class="info-item">
              <span class="font-weight-medium text-caption">UG Enrollment</span>
              <span class="text-body-1">{{ formatCellValue(item.enTotUgN) }}</span>
            </div>
          </v-col>
          <v-col cols="4" md="2">
            <div class="info-item">
              <span class="font-weight-medium text-caption">Calendar</span>
              <span class="text-body-1">{{ formatCellValue(item.mainCalendar) }}</span>
            </div>
          </v-col>
          <v-col cols="4" md="2">
            <div class="info-item">
              <span class="font-weight-medium text-caption">Setting</span>
              <span class="text-body-1">{{ formatCellValue(item.cmpsSetting) }}</span>
            </div>
          </v-col>
          <v-col cols="4" md="2">
            <!-- <div class="info-item">
              <span class="font-weight-medium text-caption">Admission Rate</span>
              <span class="text-body-1">{{ formatCellValue(item.admitRate) }}%</span>
            </div> -->
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
  flex-direction: column;
  gap: 1px;
}

.info-item span:first-child {
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
  line-height: 1;
}

.info-item span:last-child {
  font-size: 0.875rem;
  line-height: 1.2;
}

.v-card-text {
  padding: 12px;
}

@media (max-width: 600px) {
  .v-card-text {
    padding: 10px 8px;
  }
  
  .info-item {
    margin-bottom: 6px;
  }
}
</style> 