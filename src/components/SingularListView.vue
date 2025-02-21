<template>
  <v-container class="pt-8">
    <v-row class="d-flex justify-space-between">
      <v-col cols="3">
        <v-btn to="/lists">
          Back
        </v-btn>
      </v-col>
      <v-col cols="3" class="d-flex justify-center align-center">
        <h1>{{ list.name }}</h1>
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
          id="listTable"
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
import { getDoc, doc, deleteDoc } from 'firebase/firestore'
import ShareDialog from './ShareDialog'
import { useTableStore } from '../stores/tableStore';
import { useUserStore } from '../stores/userStore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'  // Add this import


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
        {
          title: 'Export to PDF',
          icon: 'mdi-file-download',
          action: this.exportToPDF
        },
        {
          title: 'Delete List',
          icon: 'mdi-delete',
          action: this.deleteList
        }
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
      // Handle case where item might be undefined
      if (!item || !item.item) return;

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

        // Open in new tab for right click or if holding Ctrl/Cmd key
        if (event.ctrlKey || event.metaKey) {
          window.open(route.href, '_blank');
        } else {
          // Navigate in current tab for normal left click
          this.$router.push(route);
        }
      }
    },
    async loadList() {
      try {
        const idFromURL = this.$route.params.id;
        console.log(idFromURL);

        const querySnapshot = await getDoc(doc(dbFireStore, 'lists', idFromURL));

        if (!querySnapshot.exists()) {
          console.error('No list found with this ID');
          return;
        }

        this.list = querySnapshot.data();

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
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Add logo from assets
      const logo = new Image();
      logo.src = require('@/assets/ryteplan-logo-green-black.png');
      
      logo.onload = () => {
        // Add logo to PDF
        doc.addImage(logo, 'PNG', 15, 10, 46, 11);
        
        // Add title
        doc.setFontSize(16);
        doc.text(`${this.list.name}`, 15, 30);
        
        // Add timestamp
        doc.setFontSize(10);
        doc.text(`Generated: ${timestamp}`, 15, 40);
        
        // Add table with some styling
        autoTable(doc, { 
          html: '#listTable table',
          startY: 50,
          styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [243, 243, 243],
            lineWidth: 0.1,
            fillColor: [250, 250, 250],
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255],
          },
          headStyles: {
            fillColor: [243, 243, 243], // Ryteplan green color (#6899A4)
            textColor: 0,
            fontSize: 10,
            fontStyle: 'medium'
          },
        });

        // Save the PDF
        doc.save(`Ryteplan Institution List - ${this.list.name} - ${timestamp}.pdf`);
      };
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
      const filename = `Ryteplan Institution List - ${this.list.name}  - ${timestamp}.csv`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    async deleteList() {
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this list?')) {
        return;
      }

      try {
        const idFromURL = this.$route.params.id;
        await deleteDoc(doc(dbFireStore, 'lists', idFromURL));
        
        // Navigate back to lists page
        this.$router.push('/lists');
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list');
      }
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