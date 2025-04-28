<template>
  <v-container class="pt-4">
    <div class="data-integration d-flex flex-column">
      <!-- 
        <p>Output the merge candidate institution data</p>
        <div v-for="(item, index) in mergeCandidateInstitutionData" :key="index">
          <h2>{{ index }}</h2>
          {{ item }}
          <p>{{ item.name }}</p>
          <p>{{ item.tuition }}</p>
        </div>
      -->

      <v-btn
        @click="duplicateCollection"
        color="primary"
      >
        Backup Data
      </v-btn>

      <v-btn
        class="mt-8"
        @click="doDataIntegration"
        color="primary"
      >
          Integrate Data
      </v-btn>

      <v-btn
        class="d-none"
        @click="fixUniversitiesWithWrongState"
        color="primary"
      >
        Fix universities with wrong state
      </v-btn>

      <v-btn
        class="d-none"
      @click="fixSportsWithEmptyGenderFields"
        color="primary"
      >
        Fix sports with empty gender fields
      </v-btn>

      <v-btn
        class="d-none"
        @click="fixSportsWithParenthesesFields"
        color="primary"
      >
        Fix sports with parentheses fields
      </v-btn>

      <v-btn
        class="d-none"
        @click="updateHiddenFieldInSports"
        color="primary"
      >
        Convert the hidden field in sports to include the sport name
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
      integratedData: [],
      mergeCandidates: [],
      mergeCandidateInstitutionData: {}
    }
  },
  async beforeMount() {
    // const mergeCandidatesQuery = query(collection(dbFireStore, "jab_merge_candidates"));
    // const mergeCandidatesSnapshots = await getDocs(mergeCandidatesQuery);

    // mergeCandidatesSnapshots.docs.forEach(doc => {
    //   this.mergeCandidates.push(doc.data().mergeCandidateCollectionId);
    // });

    // // Process each collection sequentially
    // for (const collectionId of this.mergeCandidates) {
    //   const institutionDataQuery = query(collection(dbFireStore, collectionId));
    //   const institutionDataSnapshots = await getDocs(institutionDataQuery);

    //   // Initialize array for this collection
    //   this.mergeCandidateInstitutionData[collectionId] = [];

    //   // Add all documents from this collection
    //   institutionDataSnapshots.docs.forEach(doc => {
    //     this.mergeCandidateInstitutionData[collectionId].push(doc.data());
    //   });
    // }
    // json parse
    // console.log(this.mergeCandidateInstitutionData);
  },
  methods: {
    async fixUniversitiesWithWrongState(){
      const dataQuery = query(collection(dbFireStore, "institutions_integrated"));
      const snapshots = await getDocs(dataQuery);

      snapshots.docs.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
        if (data.countryCode === "CAN") {          
          console.log(data.stateCleaned);
          await setDoc(
            doc(dbFireStore, "institutions_integrated", docSnapshot.id),
            {
              stateCleaned: "—"
            },
            { merge: true }
          );
        }
      });
    },
    async fixSportsWithEmptyGenderFields() {
      const collections = [
        "manual_institution_data",
        "institutions_integrated"
      ];

      for (const collectionName of collections) {
        const dataQuery = query(collection(dbFireStore, collectionName));
        const snapshots = await getDocs(dataQuery);
        
        for (const docSnapshot of snapshots.docs) {
          const docData = docSnapshot.data();
          const id = docSnapshot.id;
          const sports = docData.sports;

          if (sports && Array.isArray(sports) ) {
            console.log("id", id);
            console.log("collection", collectionName);
            const updatedSports = sports.map(sport => {
              if (sport.sport_name === "Acrobatics and Tumbling") {
                console.log("sport", sport);
              } 
              const divisionFieldName = `${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`;
              let divisionObjectFieldValue = sport[divisionFieldName];
              if (divisionObjectFieldValue) {
                // Convert empty strings to em dashes for each division type
                const updatedDivisions = {};
                for (const [key, value] of Object.entries(divisionObjectFieldValue)) {
                  updatedDivisions[key] = (value === "" || value === "—") ? "None selected" : value;
                }
                divisionObjectFieldValue = updatedDivisions;
              }
              return {
                ...sport,
                [divisionFieldName]: divisionObjectFieldValue
              };
            });
            console.log(updatedSports);

            try {
              await setDoc(
                doc(dbFireStore, collectionName, id),
                { sports: updatedSports },
                { merge: true }
              );
              console.log(`Successfully updated the ${collectionName} sports for ${id}`);
            } catch (error) {
              console.error(`Error updating the ${collectionName} sports for ${id}:`, error);
            }
          }        
        }
      }
    },
    async fixSportsWithParenthesesFields() {
      // Get all documents from manual_institution_data
      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      const manualSnapshots = await getDocs(manualDataQuery);
      
      for (const docSnapshot of manualSnapshots.docs) {
        const docData = docSnapshot.data();
        const id = docSnapshot.id;
        const sports = docData.sports;

        if (sports && Array.isArray(sports)) {
          console.log("id", id);
          const updatedSports = sports.map(sport => {

            if (sport.sport_name?.includes('(')) {
              console.log("original sport", sport);
              const originalHiddenFieldName = `${sport.sport_name}_hidden`;              
              const originalHiddenFieldValue = sport[originalHiddenFieldName];

              const originalDivisionFieldName = `${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`;
              const originalDivisionFieldValue = sport[originalDivisionFieldName];

              const newSportName = sport.sport_name.replace(/\((.*?)\)/, '$1').trim();

              const hiddenFieldNameToInsert = `${newSportName}_hidden`.toLowerCase().replace(/ /g, '_');
              const divisionFieldNameToInsert = `${newSportName}_divisions`.toLowerCase().replace(/ /g, '_');

              const sportWithRenamedStuff = {
                sport_name: newSportName,
                [divisionFieldNameToInsert]: originalDivisionFieldValue
              };

              if (originalHiddenFieldValue) {
                sportWithRenamedStuff[hiddenFieldNameToInsert] = originalHiddenFieldValue;
              }

              console.log("sportWithRenamedStuff", sportWithRenamedStuff);
              
              return {
                ...sportWithRenamedStuff,
              };
          }
            return sport;
          });
        
          console.log(updatedSports);

          try {
            await setDoc(
              doc(dbFireStore, "manual_institution_data", id),
              { sports: updatedSports },
              { merge: true }
            );
            console.log(`Successfully updated the manual_institution_data sports for ${id}`);
          } catch (error) {
            console.error(`Error updating the manual_institution_data sports for ${id}:`, error);
          }
        }        
      }

      const integratedDataQuery = query(collection(dbFireStore, "institutions_integrated"));
      const integratedSnapshots = await getDocs(integratedDataQuery);
      
      for (const docSnapshot of integratedSnapshots.docs) {
        const docData = docSnapshot.data();
        const id = docSnapshot.id;
        const sports = docData.sports;

        if (sports && Array.isArray(sports)) {
          console.log("id", id);
          const updatedSports = sports.map(sport => {

            if (sport.sport_name?.includes('(')) {
              console.log("original sport", sport);
              const originalHiddenFieldName = `${sport.sport_name}_hidden`;              
              const originalHiddenFieldValue = sport[originalHiddenFieldName];

              const originalDivisionFieldName = `${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`;
              const originalDivisionFieldValue = sport[originalDivisionFieldName];

              const newSportName = sport.sport_name.replace(/\((.*?)\)/, '$1').trim();

              const hiddenFieldNameToInsert = `${newSportName}_hidden`.toLowerCase().replace(/ /g, '_');
              const divisionFieldNameToInsert = `${newSportName}_divisions`.toLowerCase().replace(/ /g, '_');

              const sportWithRenamedStuff = {
                sport_name: newSportName,
                [divisionFieldNameToInsert]: originalDivisionFieldValue
              };

              if (originalHiddenFieldValue) {
                sportWithRenamedStuff[hiddenFieldNameToInsert] = originalHiddenFieldValue;
              }

              console.log("sportWithRenamedStuff", sportWithRenamedStuff);
              
              return {
                ...sportWithRenamedStuff,
              };
          }
            return sport;
          });
        
          console.log(updatedSports);

          try {
            await setDoc(
              doc(dbFireStore, "institutions_integrated", id),
              { sports: updatedSports },
              { merge: true }
            );
            console.log(`Successfully updated the manual_institution_data sports for ${id}`);
          } catch (error) {
            console.error(`Error updating the manual_institution_data sports for ${id}:`, error);
          }
        }        
      }

    },
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
    async updateHiddenFieldInSports() {
      // update manual_institution_data
      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"), limit());    
      const manualSnapshots = await getDocs(manualDataQuery);

      for (const docSnapshot of manualSnapshots.docs) {
        const docData = docSnapshot.data();
        const id = docSnapshot.id;
        const sports = docData.sports;

        if (sports && Array.isArray(sports)) {
          const updatedSports = sports.map(sport => {
            // Access the hidden field directly using the sport name
            const originalHiddenFieldName = `sport_${sport.sport_name}_hidden`;
            if (sport[originalHiddenFieldName] === true || sport[originalHiddenFieldName] === false) {
              const originalFieldNameValue = sport[originalHiddenFieldName];
              const { [originalHiddenFieldName]: removed, ...sportWithNewHiddenField } = sport;  
              console.log("removed", removed);
              const fieldNameToInsert = `${sport.sport_name}_hidden`.toLowerCase().replace(/ /g, '_');
              const fieldValueToInsert = originalFieldNameValue;
              
              sportWithNewHiddenField[fieldNameToInsert] = fieldValueToInsert;

              return {
                ...sportWithNewHiddenField,
              };
            }
            return sport;
          });

          try {
            await setDoc(
              doc(dbFireStore, "manual_institution_data", id),
              { sports: updatedSports },
              { merge: true }
            );
            console.log(`Successfully updated the manual_institution_data sports for ${id}`);
          } catch (error) {
            console.error(`Error updating the manual_institution_data sports for ${id}:`, error);
          }
        }        
      }

      const integratedDataQuery = query(collection(dbFireStore, "institutions_integrated"), limit());    
      const integratedSnapshots = await getDocs(integratedDataQuery);

      for (const docSnapshot of integratedSnapshots.docs) {
        const docData = docSnapshot.data();
        const id = docSnapshot.id;
        const sports = docData.sports;

        if (sports && Array.isArray(sports)) {
          const updatedSports = sports.map(sport => {
            // Access the hidden field directly using the sport name
            const originalHiddenFieldName = `sport_${sport.sport_name}_hidden`;
            if (sport[originalHiddenFieldName] === true || sport[originalHiddenFieldName] === false) {
              const originalFieldNameValue = sport[originalHiddenFieldName];
              console.log(`Processing ${sport.sport_name}'s hidden field on ${id}`) ;
              const { [originalHiddenFieldName]: removed, ...sportWithNewHiddenField } = sport;  
              console.log("removed", removed);
              const fieldNameToInsert = `${sport.sport_name}_hidden`.toLowerCase().replace(/ /g, '_');
              const fieldValueToInsert = originalFieldNameValue;
              
              sportWithNewHiddenField[fieldNameToInsert] = fieldValueToInsert;

              return {
                ...sportWithNewHiddenField,
              };
            }
            return sport;
          });

          try {
            await setDoc(
              doc(dbFireStore, "institutions_integrated", id),
              { sports: updatedSports },
              { merge: true }
            );
            console.log(`Successfully updated the institutions_integrated sports for ${id}`);
          } catch (error) {
            console.error(`Error updating the institutions_integrated sports for ${id}:`, error);
          }
        }        
      }
      
      console.log('Finished processing all documents');
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
        setDoc(doc(dbFireStore, 'institutions_integrated_v20250313_backup_1', institution["uri"]), {
          ...institution
        }, { merge: true })
        console.log('done adding: ' + institution.name + ' to institutions_integrated_v20250313_backup_1');

        // set a timeout for 500 milliseconds
        await new Promise(resolve => setTimeout(resolve, 500));
      })
    },
    async doDataIntegration() {
      console.log('doing data integration')
      
      const petersonsDataQuery = query(collection(dbFireStore, "institutions_petersons_processed_20250313V2"));      
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
        // set a timeout for 500 milliseconds
        await new Promise(resolve => setTimeout(resolve, 500));
      })
    }
  }
}
</script>

