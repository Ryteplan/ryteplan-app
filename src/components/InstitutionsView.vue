  <template>
    <v-container class="pt-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular
          :size="60"
          :width="6"
          color="primary"
          indeterminate
        ></v-progress-circular>
        <p class="text-h6 mt-4">Loading institution data...</p>
        <p class="text-body-2">Please wait while we fetch the latest information</p>
      </div>

      <!-- Main Content -->
      <div v-else class="institutions">
        <p>document count of petersonsData: {{ petersonsDataLength }}</p>
        <p>document count of institutionData: {{ institutionDataLength }}</p>
      </div>
    </v-container>
  </template>

<script>
import { dbFireStore } from "../firebase";
import { collection, query, getDocs } from 'firebase/firestore';
import { COLLECTIONS } from '@/data/collections';

export default {
  name: 'InstitutionsView',
  async beforeMount() {
    await this.getData();
  },
  data() {
    return {
      loading: true,
      petersonsData: {},
      institutionData: {},
      petersonsDataLength: 0,
      institutionDataLength: 0,
      newInstitutionsLength: 0,
      newInstitutions: {}
    }
  },
  methods: {
    async getData() {
      try {
        const petersonsDataQuery = query(collection(dbFireStore, COLLECTIONS.INSTITUTIONS_PETERSONS_PROCESSED));
        const petersonsDataSnapshots = await getDocs(petersonsDataQuery);
        this.petersonsDataLength = petersonsDataSnapshots.size;

        // Remove 2YEAR and Private Proprietary
        this.petersonsData = petersonsDataSnapshots.docs.map(doc => {
          const data = { ...doc.data(), id: doc.id };
          return data;
        }).filter(d => {
          return d.mainFunctionType !== "2YEAR" && d.mainFunctionType !== "Private Proprietary";
        });

        this.petersonsDataLength = this.petersonsData.length;

        console.log('petersonsDataLength', this.petersonsDataLength);

        const institutionDataQuery = query(collection(dbFireStore, COLLECTIONS.INSTITUTIONS_INTEGRATED));
        const institutionDataSnapshots = await getDocs(institutionDataQuery);
        this.institutionDataLength = institutionDataSnapshots.size;

        // Remove 2YEAR and Private Proprietary
        this.institutionData = institutionDataSnapshots.docs.map(doc => {
          const data = { ...doc.data(), id: doc.id };
          return data;
        }).filter(d => {
          return d.mainFunctionType !== "2YEAR" && d.mainFunctionType !== "Private Proprietary";
        }).filter(d => {
          return d.hidden !== true;
        });

        console.log('institutionDataLength', this.institutionDataLength);

        // this.newInstitutions = this.petersonsData.filter((petersonsData) => !this.institutionData.some((institutionData) => institutionData.inunId === petersonsData.inunId));
        // this.newInstitutionsLength = this.newInstitutions.length;

        // console.log('newInstitutionsLength', this.newInstitutionsLength);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.institutions {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
