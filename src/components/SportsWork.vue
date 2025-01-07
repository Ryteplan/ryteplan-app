<template>
  <v-container class="pt-4">
    <div class="image-work">      
      <h1>Edit Sports & Athletics for {{ institutionName }}</h1>
    </div>
    <div v-if="sports.length" class="mt-8">
      <v-card 
        v-for="sport in sports" 
        :key="sport.sport_name"
        class="mb-4 pa-4"
        :class="{ 'hidden-sport': sport.hidden }"
      >
        <div class="d-flex justify-space-between align-center">
          <h3>{{ sport.sport_name }}</h3>
          <v-btn
            :color="sport.hidden ? 'success' : 'error'"
            variant="text"
            @click="toggleSportVisibility(sport.sport_name)"
          >
            {{ sport.hidden ? 'Show Sport' : 'Hide Sport' }}
          </v-btn>
        </div>

        <div class="mt-4">
          <div class="division-section">
            <h4>Intercollegiate</h4>
            <div class="division-row">
              <div class="division-item">
                <span class="division-label">Men</span>
                <v-select
                  v-model="sport[`${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`]['INTC_MEN']"
                  :items="divisionOptions"
                  @update:modelValue="updateDivision(sport, 'INTC_MEN', $event)"
                  density="compact"
                  variant="outlined"
                />
              </div>
              <div class="division-item">
                <span class="division-label">Women</span>
                <v-select
                  v-model="sport[`${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`]['INTC_WMN']"
                  :items="divisionOptions"
                  @update:modelValue="updateDivision(sport, 'INTC_WMN', $event)"
                  density="compact"
                  variant="outlined"
                />
              </div>
            </div>
          </div>

          <div class="division-section mt-4">
            <h4>Intramural</h4>
            <div class="division-row">
              <div class="division-item">
                <span class="division-label">Men</span>
                <v-select
                  v-model="sport[`${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`]['INTM_MEN']"
                  :items="divisionOptions"
                  @update:modelValue="updateDivision(sport, 'INTM_MEN', $event)"
                  density="compact"
                  variant="outlined"
                />
              </div>
              <div class="division-item">
                <span class="division-label">Women</span>
                <v-select
                  v-model="sport[`${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`]['INTM_WMN']"
                  :items="divisionOptions"
                  @update:modelValue="updateDivision(sport, 'INTM_WMN', $event)"
                  density="compact"
                  variant="outlined"
                />
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script>
/* eslint-disable no-unused-vars */
import { dbFireStore } from "../firebase";
import { collection, query, getDocs, where, doc, getDoc, setDoc } from 'firebase/firestore';

export default {
  name: 'SportsWork',
  data() {
    return {
      institutionSlug: this.$route.params.slug,
      institutionName: '',
      sports: [],
      divisionOptions: ['', '1', '2', '3', 'A', 'B', 'C', 'X']
    }
  },
  mounted() {
    this.getSports();
  },
  methods: {
    async getSports() {
      const docRef = doc(dbFireStore, 'institutions_integrated', this.institutionSlug);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.institutionName = data.name;
        if (data.sports) {
          this.sports = data.sports;
        }
      }
    },
    async removeSport(sportName) {
      if (confirm(`Are you sure you want to hide ${sportName}?`)) {
        const updatedSports = this.sports.map(s => {
          if (s.sport_name === sportName) {
            return { ...s, hidden: true };
          }
          return s;
        });
        await this.saveSportsToFirestore(updatedSports);
        this.sports = updatedSports;
      }
    },
    async updateDivision(sport, divisionKey, newValue) {
      const divisionObj = sport[`${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`];
      divisionObj[divisionKey] = newValue;
      await this.saveSportsToFirestore(this.sports);
    },
    async saveSportsToFirestore(sportsData) {
      try {
        // Save to institutions_integrated
        await setDoc(doc(dbFireStore, 'institutions_integrated', this.institutionSlug), {
          sports: sportsData
        }, { merge: true });

        // Save to manual_institution_data
        await setDoc(doc(dbFireStore, 'manual_institution_data', this.institutionSlug), {
          sports: sportsData
        }, { merge: true });

      } catch (error) {
        console.error('Error saving sports data:', error);
      }
    },
    async toggleSportVisibility(sportName) {
      const message = this.sports.find(s => s.sport_name === sportName)?.hidden
        ? `Are you sure you want to show ${sportName}?`
        : `Are you sure you want to hide ${sportName}?`;

      if (confirm(message)) {
        const updatedSports = this.sports.map(s => {
          if (s.sport_name === sportName) {
            return { ...s, hidden: !s.hidden };
          }
          return s;
        });
        await this.saveSportsToFirestore(updatedSports);
        this.sports = updatedSports;
      }
    }
  }
}
</script>

<style>
.division-section {
  padding: 16px;
  border-radius: 8px;
}

.division-section h4 {
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.87);
}

.division-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.division-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.division-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.hidden-sport {
  opacity: 0.7;
  background-color: #f5f5f5;
}
</style>
