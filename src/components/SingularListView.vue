<template>
  <v-container class="pt-4">
    <v-row v-if="this.$route.params.showBackButton">
      {{ this.$route.params.id }}
      <v-col>
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          @click="$emit('back')"
        >
          Back to Search Results
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="d-flex justify-space-between">      
      <v-col cols="9" class="d-flex align-end">
        <h1 class="text-h6">{{ list.name }}</h1>
        <span style="color: #888888; margin-left: 10px; margin-bottom: 5px; font-size: 14px;">
          ({{ institutions.length }}/30)
        </span>
      </v-col>
      <v-col cols="3" class="d-flex justify-end align-center">
        <v-btn
          v-if="userStore.isLoggedIn"
          class="mr-3"
          size="x-small"
          elevation="1"
          @click="showColumnsDialog = true"
          title="Edit Columns"
        >
          Edit Columns
        </v-btn>
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              class="mr-3"
              v-bind="props"
              @click="onUpdateMenu"
              size="x-small"              
            >
              Options
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
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              size="small"
              v-if="selectedInstitutions.length > 0"
              v-bind="props"
              :disabled="selectedInstitutions.length === 0"
            >
              {{ selectedInstitutions.length }} selected 
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              @click="deleteSelectedInstitutions"
              :disabled="selectedInstitutions.length === 0"
            >
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="error">mdi-delete</v-icon>
                <v-list-item-title>Remove from List</v-list-item-title>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col cols="12">
        <v-data-table
          id="listTable"
          :headers="filteredHeaders"
          :items="institutions"
          @click:row="navigateToInstitution" 
          @click:header="(column) => tableStore.customSort(column)"
          item-key="uri"
          class="elevation-1"
          density="comfortable"
          fixed-header 
          return-object
          :items-per-page="-1"
          show-select
          v-model="selectedInstitutions"
        >
          <template #bottom></template>
          <template #[`item.testingPolicy`]="{ item }">
            {{ item.testingPolicy || '—' }}
          </template>          
          <template v-for="header in filteredHeaders" :key="header.key" #[`item.${header.key}`]="{ item }">
            {{ formatCellValue(item[header.key]) }}
          </template>
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
            <!-- Section header for visible columns -->
            <v-list-subheader class="font-weight-bold text-primary">
              Visible Columns
            </v-list-subheader>
            
            <!-- Visible columns -->
            <v-list-item
              v-for="(header) in visibleColumns"
              :key="header.key"
            >
              <v-list-item-title class="d-flex align-center">
                <v-checkbox
                  :model-value="header.show"
                  :label="header.title"
                  hide-details
                  density="comfortable"
                  @click="toggleColumn(header)"
                ></v-checkbox>
                <v-spacer></v-spacer>
                <div class="d-flex">
                  <v-btn
                    density="comfortable"
                    icon="mdi-arrow-up"
                    size="small"
                    variant="text"
                    @click="moveColumnUp(header.key)"
                    :disabled="isFirstVisibleHeader(header.key)"
                  ></v-btn>
                  <v-btn
                    density="comfortable"
                    icon="mdi-arrow-down"
                    size="small"
                    variant="text"
                    @click="moveColumnDown(header.key)"
                    :disabled="isLastVisibleHeader(header.key)"
                  ></v-btn>
                </div>
              </v-list-item-title>
            </v-list-item>
            
            <!-- Section header for hidden columns -->
            <v-list-subheader class="font-weight-bold text-grey mt-4" v-if="hiddenColumns.length > 0">
              Hidden Columns
            </v-list-subheader>
            
            <!-- Hidden columns -->
            <v-list-item
              v-for="(header) in hiddenColumns"
              :key="header.key"
            >
              <v-list-item-title class="d-flex align-center">
                <v-checkbox
                  :model-value="header.show"
                  :label="header.title"
                  hide-details
                  density="comfortable"
                  @click="toggleColumn(header)"
                ></v-checkbox>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn 
            color="error" 
            variant="text" 
            class="mr-auto"
            @click="resetColumnsToDefault"
          >
            Reset to Default
          </v-btn>
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
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import ShareDialog from './ShareDialog'
import { useTableStore } from '../stores/tableStore';
import { useUserStore } from '../stores/userStore';
import { jsPDF } from 'jspdf';


export default {
 setup() {
    const tableStore = useTableStore();
    if (tableStore.tableHeaders.length == 0) {
      tableStore.loadTableHeaders();
      tableStore.loadHeaderState('singularList');
    }
    
    // Set the active headers for this view
    tableStore.setActiveHeaders('singularList');
    tableStore.updateHeaders('singularList');

    let userStore = useUserStore();
    userStore.getAdminMode();

    return { tableStore, userStore };
  },
  mounted() {    
    this.loadList();
  },
  data() {
    return {
      showBackButton: this.$route.params.showBackButton,
      createNewListName: "",
      list: {},
      institutions: [],
      showShareDialog: false,
      showColumnsDialog: false,
      selectedInstitutions: [],
      selectedDropDown: [
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
      // Update headers visibility in the store
      this.tableStore.updateHeaders('singularList');
      
      // Save header state to localStorage for this view
      this.tableStore.saveHeaderState('singularList');
      
      // Set the active headers to ensure the view is using the updated headers
      this.tableStore.setActiveHeaders('singularList');
      
      // Force a simple refresh
      this.$forceUpdate();
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

        if (event.ctrlKey || event.metaKey) {
          window.open(route.href, '_blank');
        } else {
          window.open(route.href, '_blank');
        }
      }
    },
    async loadList() {
      try {
        const idFromURL = this.$route.params.id;

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
          .map(doc => doc.data())
          .sort((a, b) => a.name.localeCompare(b.name));

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
      const margin = 15;
      
      const logo = new Image();
      logo.src = require('@/assets/ryteplan-logo-green-black.png');
      
      logo.onload = () => {
        // Add logo to PDF
        doc.addImage(logo, 'PNG', margin, 10, 46, 11);
        
        // Add title (reduced from 16 to 14)
        doc.setFontSize(14);
        doc.text(`${this.list.name}`, margin, 30);
        
        // Add timestamp (reduced from 10 to 8)
        doc.setFontSize(8);
        doc.text(`Generated: ${timestamp}`, margin, 40);
        
        // Starting positions
        let yPosition = 50;
        const pageWidth = doc.internal.pageSize.width;
        
        // Get the filtered headers that are currently displayed in the table
        const visibleHeaders = this.filteredHeaders;
        
        // For each institution, create a card
        this.institutions.forEach((institution, index) => {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          // Add separator line before each institution (except the first one)
          if (index > 0) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.line(margin, yPosition - 6, pageWidth - margin, yPosition - 6);
          }
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(institution.name, margin, yPosition + 5);
          
          // Reset font for fields (reduced from 10 to 8)
          doc.setFont(undefined, 'normal');
          doc.setFontSize(8);
          
          let currentY = yPosition + 15;
          let currentX = margin;
          const lineHeight = 6; // Reduced from 8 to 6 to match smaller font
          const fieldSpacing = 8; // Reduced from 10 to 8
          
          visibleHeaders.forEach((header) => {
            if (header.key === 'name') return;
            
            let value = institution[header.key];
            // Apply formatting first
            let displayValue = this.formatCellValue(value);
            
            // Skip further processing if it's already formatted to '—'
            if (displayValue === '—') {
              // No specific handling needed here, just use '—'
            } else if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            } else if (typeof value === 'number') {
              if (header.key.includes('rate') || header.key.includes('percentage')) {
                displayValue = `${(value * 100).toFixed(1)}%`;
              } else if (header.key.includes('tuition') || header.key.includes('cost')) {
                displayValue = `$${value.toLocaleString()}`;
              } else if (header.key === 'sat1Combined50th' || header.key === 'actComp50thP') {
                displayValue = String(value);
              } else {
                displayValue = value.toLocaleString();
              }
            } else {
              // Value is likely already a string, but ensure it is
              displayValue = String(value);
            }

            const fieldText = `${header.title}: ${displayValue}`;
            const textWidth = doc.getTextWidth(fieldText);
            
            if (currentX + textWidth > pageWidth - margin) {
              currentX = margin;
              currentY += lineHeight;
            }
            
            doc.text(fieldText, currentX, currentY);
            currentX += textWidth + fieldSpacing;
          });
          
          // Handle admission factors
          const admissionFactors = visibleHeaders.find(h => h.key === 'admissionFactors');
          if (admissionFactors) {
            currentX = margin;
            currentY += lineHeight * 1.5;
            
            const factors = admissionFactors.children.map(child => {
              const factorValue = institution[child.key];
              return `${child.title}: ${factorValue || 'N/A'}`;
            });
            
            doc.text('Admission Factors:', currentX, currentY);
            currentY += lineHeight;
            
            factors.forEach(factor => {
              const textWidth = doc.getTextWidth(factor);
              
              if (currentX + textWidth > pageWidth - margin) {
                currentX = margin;
                currentY += lineHeight;
              }
              
              doc.text(factor, currentX, currentY);
              currentX += textWidth + fieldSpacing;
            });
          }
          
          yPosition = currentY + 15;
        });
        
        // Save the PDF
        doc.save(`Ryteplan Institution List - ${this.list.name} - ${timestamp}.pdf`);
      };
    },
    exportToCSV() {
      // Get visible headers from the table store
      const headers = this.filteredHeaders;
      
      // Create CSV header row
      const headerRow = headers
        .map(header => {
          if (header.children) {
            const mainColumn = `"${header.title}"`;
            const childColumns = header.children.map(child => `"${child.title}"`);
            return [mainColumn, ...childColumns].join(',');
          }
          return `"${header.title}"`;
        })
        .join(',');
      
      // Create CSV data rows using the same templates as v-data-table
      const dataRows = this.institutions.map(institution => {
        return headers
          .map(header => {
            if (header.children) {
              const childValues = header.children.map(child => {
                const rawValue = institution[child.key];
                let formattedValue = this.formatCellValue(rawValue);
                let finalCsvValue = formattedValue;

                // Apply specific formatting only if the value isn't already '—'
                if (formattedValue !== '—') {
                  if (typeof rawValue === 'number') {
                      if (child.key.includes('rate') || child.key.includes('percentage')) { finalCsvValue = `${(rawValue * 100).toFixed(1)}%`; }
                      else if (child.key.includes('tuition') || child.key.includes('cost')) { finalCsvValue = `$${rawValue.toLocaleString()}`; }
                      else { finalCsvValue = rawValue.toLocaleString(); } // Default number format
                  } else if (typeof rawValue === 'boolean') {
                      finalCsvValue = rawValue ? 'Yes' : 'No';
                  }
                  // Strings needing no special format fall through
                }
                // Escape and return
                return `"${String(finalCsvValue).replace(/"/g, '""')}"`;
              });
              return '""' + ',' + childValues.join(','); // Empty main column placeholder
            } else {
              // Logic for regular headers
              const rawValue = institution[header.key];
              let formattedValue = this.formatCellValue(rawValue); // Step 1: Basic format
              let finalCsvValue = formattedValue; // Start with the formatted value

              // Apply specific formatting only if the value isn't already '—'
              if (formattedValue !== '—') {
                if (typeof rawValue === 'number') {
                    if (header.key.includes('rate') || header.key.includes('percentage')) { finalCsvValue = `${(rawValue * 100).toFixed(1)}%`; }
                    else if (header.key.includes('tuition') || header.key.includes('cost')) { finalCsvValue = `$${rawValue.toLocaleString()}`; }
                    else { finalCsvValue = rawValue.toLocaleString(); } // Default number format
                } else if (typeof rawValue === 'boolean') {
                    finalCsvValue = rawValue ? 'Yes' : 'No';
                }
                // Strings needing no special format fall through
              }
              
              // Escape quotes for CSV
              return `"${String(finalCsvValue).replace(/"/g, '""')}"`;
            }
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
    async deleteSelectedInstitutions() {
      if (!confirm(`Are you sure you want to remove ${this.selectedInstitutions.length} institution(s) from this list?`)) {
        return;
      }

      try {
        const idFromURL = this.$route.params.id;
        const listRef = doc(dbFireStore, 'lists', idFromURL);
        
        // Get current list data
        const listDoc = await getDoc(listRef);
        const listData = listDoc.data();
        
        // Filter out the selected institutions
        const selectedUris = this.selectedInstitutions.map(inst => inst.uri);
        const updatedInstitutions = listData.institutions.filter(
          id => !selectedUris.includes(id)
        );
        
        // Update Firestore
        await updateDoc(listRef, {
          institutions: updatedInstitutions
        });
        
        // Update local state
        this.institutions = this.institutions.filter(
          inst => !selectedUris.includes(inst.uri)
        );
        
        // Clear selection
        this.selectedInstitutions = [];
        
      } catch (error) {
        console.error('Error removing institutions from list:', error);
        alert('Failed to remove institutions from list');
      }
    },
    formatTestingValue(value, showPolicy) {
      if (showPolicy === true || !value) return '—';
      
      if (typeof value === 'string') {
        if (value.includes('SAT or ACT')) {
          value = 'SAT or ACT';
        }
        if (value.includes('Other standardized tests')) {
          value = value.replace(/Other standardized tests/g, '');
        }
        if (value.includes('SAT Subject Tests')) {
          value = value.replace(/SAT Subject Tests/g, '');
        }
        if (value === '') {
          return '—';
        }
      }
      return value;
    },
    formatCellValue(value) {
      if (value === -1 || value === '-1' || value === '0' || value === 0 || value === null || value === undefined || value === '-') {
        return '—';
      } else if (typeof value === 'string' && value.trim() === '') {
        return '—';
      } else {
        return value;
      }
    },
    moveColumnUp(key) {
      if (this.tableStore.moveColumnUp(key, 'singularList')) {
        this.refreshTable();
      }
    },
    moveColumnDown(key) {
      if (this.tableStore.moveColumnDown(key, 'singularList')) {
        this.refreshTable();
      }
    },
    refreshTable() {
      // Force a refresh of the component
      this.$forceUpdate();
    },
    isFirstVisibleHeader(key) {
      return !this.tableStore.canMoveColumnUp(key, 'singularList');
    },
    isLastVisibleHeader(key) {
      return !this.tableStore.canMoveColumnDown(key, 'singularList');
    },
    resetColumnsToDefault() {
      if (confirm("This will reset all column settings to their default values. Continue?")) {
        // Default columns that should be visible
        const defaultVisibleColumns = [
          "name", 
          "stateCleaned", 
          "mainInstControlDesc", 
          "mainCalendar", 
          "enTotUgN", 
          "cmpsSetting"
        ];
        
        // Get fresh headers
        const headers = this.tableStore.getHeadersForView('singularList');
        
        // Update visibility based on defaults
        headers.forEach(header => {
          if (defaultVisibleColumns.includes(header.key)) {
            header.show = true;
          } else if (header.key !== "id" && header.key !== "hidden" && !header.hideFromColumnsEditor) {
            header.show = false;
          }
        });
        
        // Save changes and update store
        this.tableStore.viewHeaders['singularList'] = JSON.parse(JSON.stringify(headers));
        this.tableStore.saveHeaderState('singularList');
        this.tableStore.updateHeaders('singularList');
        this.tableStore.setActiveHeaders('singularList');
        
        // Force component update
        this.$forceUpdate();
        
        // Refresh the institutions table
        const temp = [...this.institutions];
        this.institutions = [];
        
        // Use nextTick to ensure store updates are processed
        this.$nextTick(() => {
          this.institutions = temp;
          // Force a component update to refresh the dialog
          this.$forceUpdate();
        });
      }
    },
    toggleColumn(header) {
      // Create a deep copy of the header to avoid reference issues
      const headerCopy = JSON.parse(JSON.stringify(header));
      headerCopy.show = !headerCopy.show;
      
      // Get all headers
      const headers = this.tableStore.getHeadersForView('singularList');
      
      // Find and update the matching header
      const index = headers.findIndex(h => h.key === headerCopy.key);
      if (index !== -1) {
        headers[index] = headerCopy;
      }
      
      // Update the store with the modified headers
      this.tableStore.viewHeaders['singularList'] = headers;
      
      // Update headers visibility in the store
      this.tableStore.updateHeaders('singularList');
      
      // Save header state to localStorage for this view
      this.tableStore.saveHeaderState('singularList');
      
      // Set the active headers to ensure the view is using the updated headers
      this.tableStore.setActiveHeaders('singularList');
      
      // Force a simple refresh
      this.$forceUpdate();
      
      // Also force refresh institutions table
      const temp = [...this.institutions];
      this.institutions = [];
      this.$nextTick(() => {
        this.institutions = temp;
      });
    }
  },
  computed: {
    filteredHeaders() {      
      return this.tableStore.getFilteredHeadersForDisplay('singularList');
    },
    reorderableHeaders() {
      return this.tableStore.getReorderableHeaders('singularList');
    },
    visibleColumns() {
      return this.reorderableHeaders.filter(header => header.show === true);
    },
    hiddenColumns() {
      return this.reorderableHeaders.filter(header => header.show === false);
    },
  },
  components: {
    ShareDialog
  } 
};
</script>

<style>
  #listTable th:has(.v-checkbox-btn) {
    z-index: 7 !important;
  }

  .v-data-table__td--select-row {
    background-color: #f7f7f7;  
  }
</style>