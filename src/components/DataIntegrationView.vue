<template>
  <v-container class="pt-4">
    <div class="data-integration">
      <v-btn
        class="d-none"
        @click="duplicateCollection"
        color="primary"
      >
        Backup Data
      </v-btn>

      <v-btn
        @click="doDataIntegration"
        color="primary"
      >
          Integrate Data
      </v-btn>


      <v-btn
        class="d-none"
        @click="addSportsFromPetersonsToIntegratedData"
        color="primary"
      >
        Add sports data to integrated data
      </v-btn>


      <v-btn
        class="d-none"
        @click="updateWithMajors"
        color="primary"
      >
          Update data with majors
      </v-btn>

      <v-btn
        class="d-none"
        @click="addAliasesToIntegratedData"
        color="primary"
      >
        Add aliases to integrated data
      </v-btn>

      <div class="d-none data-updated-container">
        <v-card v-for="item in petersonsData" :key="item.uri">
          <v-card-title>
            <h2>{{ item.name }}</h2>
          </v-card-title>
          <v-card-text>
            <p>{{ item.city }}, {{ item.stateCleaned }}</p>
            <p>{{ item.mainFunctionType }}</p>
          </v-card-text>
        </v-card>
      </div>

      <div class="d-none">
        <h1>Fix Manual Stuff</h1>
        <v-btn
          @click="fixManualStuff"
          color="primary"
        >
            Fix manual stuff
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
import { dbFireStore } from "../firebase";

// eslint-disable-next-line no-unused-vars
import { collection, query, getDocs, setDoc, doc, where, documentId, deleteField, deleteDoc, limit } from 'firebase/firestore'

export default {
  name: 'DataIntegration',
  data() {
    return {
      petersonsData: [],
      manualData: [],
      integratedData: []
    }
  },
  methods: {
    async addAliasesToIntegratedData() {
      // Get all documents from aliases collection
      const aliasesQuery = query(collection(dbFireStore, "aliases"));
      const aliasesSnapshots = await getDocs(aliasesQuery);
      
      // Process each aliases document
      for (const aliasDoc of aliasesSnapshots.docs) {
        const aliasData = aliasDoc.data();
        const documentId = aliasDoc.id;
        
        // Skip if no aliases field exists
        if (!aliasData.aliases) {
          console.warn(`No aliases found for document ID: ${documentId}`);
          continue;
        }

        try {
          // Update the matching institution with aliases data
          // Update the integrated_institutions collection with aliases data
          await setDoc(
            doc(dbFireStore, 'institutions_integrated', documentId),
            { aliases: aliasData.aliases },
            { merge: true }
          );
          await setDoc(
            doc(dbFireStore, 'manual_institution_data', documentId),
            { aliases: aliasData.aliases },
            { merge: true }
          );
          
          console.log(`Updated aliases for institution ID: ${documentId}`);
        } catch (error) {
          console.error(`Error updating aliases for ${documentId}:`, error);
        }
      }
      
      console.log('Finished updating aliases for all institutions');    
    },
    async addSportsFromPetersonsToIntegratedData() {
      // Get all documents from institutions_integrated
      const integratedDataQuery = query(collection(dbFireStore, "institutions_integrated"));
      const integratedDataSnapshots = await getDocs(integratedDataQuery);
      
      // Process each institution
      for (const institutionDoc of integratedDataSnapshots.docs) {
        const institution = institutionDoc.data();
        const inunId = institution.inunId?.toString();
        
        if (!inunId) {
          console.warn(`Skipping institution ${institution.name}: No inunId found`);
          continue;
        }

        // Get sports data for this institution
        const sportsQuery = query(
          collection(dbFireStore, 'sports_v_13_b'), 
          where(documentId(), "==", inunId)
        );
        const sportsSnap = await getDocs(sportsQuery);
        
        if (sportsSnap.empty) {
          console.warn(`No sports data found for institution ${institution.name} (ID: ${inunId})`);
          continue;
        }

        // Update the institution with sports data
        const sportsData = sportsSnap.docs[0].data().sports;
        await setDoc(
          doc(dbFireStore, 'institutions_integrated', institution.uri),
          { sports: sportsData },
          { merge: true }
        );
        
        console.log(`Updated sports data for: ${institution.name}`);
      }
      
      console.log('Finished updating sports data for all institutions');
    },
    async fixManualStuff() {
      console.log("fixManualStuff");
      
      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      const manualSnapshots = await getDocs(manualDataQuery);

      manualSnapshots.docs.forEach(institution => {
        const data = { ...institution.data(), id: institution.id };

        // if data does not have any other key/value pairs other than a key with the name id, delete it
        if (Object.keys(data).length === 1 && Object.hasOwn(data, 'id')) {
          deleteDoc(doc(dbFireStore, "manual_institution_data", institution.id));
          return;
        }
        this.manualData.push(data);
      });

      // this.manualData.map(d => {
      //   for (let key in d) {
      //     if (key === "undergradEnrollTotal") {
      //       setDoc(doc(dbFireStore, 'manual_institution_data', d.id), {
      //         [key]: deleteField()
      //       }, { merge: true });
      //     }
      //   }
      // });
    },
    async updateWithMajors() {
      const integratedDataQuery = query(collection(dbFireStore, "institutions_integrated"));      
      const integratedDataSnapshots = await getDocs(integratedDataQuery);

      integratedDataSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.integratedData.push(data);
      });
      
      this.integratedData.forEach(async (institution) => {
        const inunId = institution.inunId.toString();
        console.log(inunId);
        const majorsTable = collection(dbFireStore, 'test_for_arrays');
        const q = query(majorsTable, where(documentId(), "==",inunId));
        const docSnap = await getDocs(q);
        docSnap.forEach((doc) => {
          institution.cipCode = doc.data().cipCode
        });
        console.log(institution);
        setDoc(doc(dbFireStore, 'institutions_integrated', institution.uri), {
          ...institution
        }, { merge: true })
        console.log('done adding major codes to: ' + institution.name + ' to institutions_integrated');
      })
    },
    async duplicateCollection() {
      console.log('duplicating collection')
      const integratedDataQuery = query(collection(dbFireStore, "institutions_integrated"));      
      const integratedDataSnapshots = await getDocs(integratedDataQuery);

      integratedDataSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.integratedData.push(data);
      });

      this.integratedData.forEach(async (institution) => {
        setDoc(doc(dbFireStore, 'institutions_integrated_v13_backup_1', institution["uri"]), {
          ...institution
        }, { merge: true })
        console.log('done adding: ' + institution.name + ' to institutions_integrated_v13_backup_1');
      })
    },
    async doDataIntegration() {
      console.log('doing data integration')
      
      const petersonsDataQuery = query(collection(dbFireStore, "institutions_v14"));      
      const petersonsSnapshots = await getDocs(petersonsDataQuery);

      petersonsSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.petersonsData.push(data);
      });

      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      const manualSnapshots = await getDocs(manualDataQuery);

      manualSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.manualData.push(data);
      });

      // do manual replacements integration
      this.manualData.forEach(data => {
        const index = this.petersonsData.findIndex(item => item.uri === data.id);
        if (index > -1) {
          this.petersonsData[index] = { ...this.petersonsData[index], ...data };
        }
      });

      // // If the field's value is 0, replace it with an em dash
      // this.petersonsData.map(d => {
      //   for (let key in d) {
      //     if (d[key] === 0) {
      //       d[key] = '—';
      //     }
      //   }
      // });

      // // Remove 2YEAR and Private Proprietary

      this.petersonsData = this.petersonsData.filter(d => {
        return d.mainFunctionType !== "2YEAR" && d.mainFunctionType !== "Private Proprietary";
      });

      // iterate over all items in petersonsData and if the item does not have a hidden field add it and make it false
      this.petersonsData.forEach(item => {
        if (!item.hidden) {
          item.hidden = false;
        }
      });

      // add all the things to the institutions_integrated collection
      this.petersonsData.forEach(async (institution) => {
        setDoc(doc(dbFireStore, 'institutions_integrated', institution["uri"]), {
          ...institution
        }, { merge: true })

        console.log('done adding: ' + institution.name);
      })
    }
  }
}
</script>

