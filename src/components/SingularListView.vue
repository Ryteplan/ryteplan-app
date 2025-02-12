<template>
  <v-container class="pt-8 px-8">
    <v-row class="d-flex justify-space-between">
      <v-col cols="3">
        <v-btn to="/lists">
          Back
        </v-btn>
      </v-col>
      <v-col cols="4" class="d-flex justify-end align-center">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              class="ml-3"
              v-bind="props"
              @click="onUpdateMenu"
            >
              three dots
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in selectedDropDown"
              @click="item.action"
              :key="index"
            >
              <div class="d-flex justify-end align-center">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <v-icon class="ml-3" :icon="item.icon"></v-icon>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-data-table
          :headers="filteredHeaders"
          :items="institutions"
          @click:row="navigateToInstitution" 
          item-key="name"
          class="elevation-1"
          density="comfortable"
          fixed-header 
          return-object
        >
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog
      v-model="showColumnsDialog"
      width="100%"
      max-width="600px"
      scrollable
      height="80vh"
      class="ma-4"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Edit Columns</span>
          <v-btn icon="mdi-close" variant="text" @click="showColumnsDialog = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="header in tableStore.filteredHeadersDataForColumnsEditor()"
              :key="header.key"
            >
              <v-list-item-title>
                <v-checkbox
                  v-model="header.show"
                  :label="header.title"
                  hide-details
                  density="comfortable"
                  @change="onHeaderChange()"
                ></v-checkbox>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="primary" @click="showColumnsDialog = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  <ShareDialog 
    v-model="showShareDialog" 
  />
</template>

<script>
import { dbFireStore } from "../firebase";
import { getDoc, doc, getDocs, query, collection, where } from 'firebase/firestore'
import ShareDialog from './ShareDialog'
import { useTableStore } from '../stores/tableStore';
import { useUserStore } from '../stores/userStore';
import { jsPDF } from 'jspdf';

export default {
  setup() {
    const tableStore = useTableStore();
    if (tableStore.tableHeaders.length == 0) {
      tableStore.loadTableHeaders();
      tableStore.loadHeaderState();
      tableStore.updateHeaders();
    }

    let userStore = useUserStore();
    userStore.getAdminMode();

    return { tableStore, userStore };
  },
  mounted() {    
    this.loadList();
  },
  data() {
    return {
      createNewListName: "",
      list: {},
      institutions: [],
      showShareDialog: false,
      showColumnsDialog: false,
      selectedDropDown: [
        { 
          title: 'Edit Columns', 
          icon: 'mdi-pencil',
          action: this.editColumnsClicked
        },
        { 
          title: 'Compare', 
          icon: 'mdi-ab-testing',
          action: this.compareClicked
        },
        { 
          title: 'Share',
          icon: 'mdi-account-plus',
          action: this.shareClicked
        },
        {
          title: 'Export to CSV',
          icon: 'mdi-file-download',
          action: this.exportToCSV
        },
        // {
        //   title: 'Export to PDF',
        //   icon: 'mdi-file-download',
        //   action: this.exportToPDF
        // }
      ],
    }
  },
  methods: {
    onHeaderChange() {
      this.tableStore.saveHeaderState();
      this.tableStore.updateHeaders();
      
      // Force table refresh by temporarily clearing and resetting the data
      const tempData = [...this.tableStore.tableData];
      this.tableStore.tableData = [];
      this.$nextTick(() => {
        this.tableStore.tableData = tempData;
      });
    },
    navigateToInstitution(event, item) {
      const institution = JSON.parse(JSON.stringify(item));
      const targetRowKey = institution.item.name;

      if (targetRowKey == "Load more") {
        this.tableStore.loadMoreItems();
      } else {
        localStorage.setItem("lastClickedRow", targetRowKey);

        const slug = JSON.parse(JSON.stringify(item.item.uri));

        let route = this.$router.resolve({
          name: 'institutionPage',
          params: {
            slug: slug,
          }
        });

        // Always open in new tab
        window.open(route.href, '_blank');
      }
    },

    async loadList() {
      try {
        const lists = collection(dbFireStore, 'lists');
        const idFromURL = this.$route.params.id;
        const q = query(lists, where("id", "==", idFromURL));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error('No list found with this ID');
          return;
        }

        const listDoc = querySnapshot.docs[0];
        this.list = listDoc.data();

        if (!this.list?.institutions?.length) {
          console.log('No institutions in this list');
          return;
        }

        this.institutions = [];

        const institutionPromises = this.list.institutions.map(institutionID => 
          getDoc(doc(dbFireStore, 'institutions_integrated', institutionID))
        );      

        const institutionDocs = await Promise.all(institutionPromises);

        this.institutions = institutionDocs
          .filter(doc => doc.exists())
          .map(doc => doc.data());

      } catch (error) {
        console.error('Error loading list:', error);
      }
    },
    onUpdateMenu(open) {
      if (open) {
        setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
      }
    },
    shareClicked() {
      this.showShareDialog = true;
    },
    editColumnsClicked() {
      this.showColumnsDialog = true;
    },
    exportToPDF() {
      const doc = new jsPDF();

      doc.text("Hello world!", 10, 10);
      doc.save("a4.pdf");
    },
    exportToCSV() {
      // Get visible headers from the table store
      const headers = this.filteredHeaders;
      console.log(headers);

      // Create CSV header row
      const headerRow = headers.map(header => {
        // Escape quotes and wrap in quotes to handle commas in titles
        const escapedTitle = header.title.replace(/"/g, '""');
        return `"${escapedTitle}"`;
      }).join(',');
      
      // Create CSV data rows
      const dataRows = this.institutions.map(institution => {
        return headers
          .map(header => {
            const value = institution[header.key];
            
            // Handle different value types
            if (value === null || value === undefined) {
              return '""';
            }
            
            if (typeof value === 'boolean') {
              return value ? '"Yes"' : '"No"';
            }
            
            if (typeof value === 'number') {
              return `"${value}"`;
            }
            
            // Handle strings - escape quotes and wrap in quotes
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
          })
          .join(',');
      });
      
      // Combine headers and data
      const csvContent = [headerRow, ...dataRows].join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      // Create download URL
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Use institution name in filename if available
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `institution_list_${timestamp}.csv`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  },
  computed: {
    filteredHeaders() {      
      return this.tableStore.tableHeaders.filter(header => header.key !== "hidden" && header.key !== "id" && header.show !== false);
    }
  },
  components: {
    ShareDialog
  } 
};
</script>

<style>
 
</style>