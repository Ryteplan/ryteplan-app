<template>
  <v-container>
    <div class="flex-column align-center mb-4">
      <h1 class="text-h5">Users</h1>
      <span class="text-subtitle-2 text-medium-emphasis">{{ filteredUsers.length }} filtered / {{ users.length }} total</span>
    </div>
    
    <v-card class="mb-4">
      <v-card-text class="pa-2">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search users"
            single-line
            hide-details
            variant="outlined"
            density="compact"
            class="flex-grow-1"
          ></v-text-field>
          
          <v-btn
            variant="outlined"
            :color="isFiltering ? 'primary' : undefined"
            @click="showFilters = !showFilters"
            density="compact"
          >
            <v-icon start size="small">mdi-filter</v-icon>
            Filters
            <v-badge
              v-if="activeFilterCount"
              :content="activeFilterCount"
              color="primary"
              inline
            ></v-badge>
          </v-btn>

          <v-btn
            color="primary"
            variant="text"
            @click="clearFilters"
            :disabled="!isFiltering"
            density="compact"
          >
            Clear
          </v-btn>
        </div>

        <v-expand-transition>
          <div v-if="showFilters" class="mt-2">
            <v-row dense>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="filters.role"
                  :items="roleOptions"
                  label="Role"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                ></v-select>
              </v-col>
              
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="filters.graduationYear"
                  :items="graduationYearOptions"
                  label="Graduation Year"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="filters.euResident"
                  :items="[
                    { title: 'EU Resident', value: true },
                    { title: 'Non-EU Resident', value: false }
                  ]"
                  label="EU Residency"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                ></v-select>
              </v-col>
            </v-row>

            <v-row dense class="mt-2">
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis mb-1">Signup Date Range</div>
                <div class="d-flex gap-2">
                  <v-menu
                    v-model="startDateMenu"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-bind="props"
                        v-model="filters.startDate"
                        label="Start Date"
                        placeholder="From"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        readonly
                        class="flex-grow-1"
                        @click:clear="clearStartDate"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="filters.startDate"
                      @update:model-value="startDateMenu = false"
                    ></v-date-picker>
                  </v-menu>

                  <v-menu
                    v-model="endDateMenu"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-bind="props"
                        v-model="filters.endDate"
                        label="End Date"
                        placeholder="To"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        readonly
                        class="flex-grow-1"
                        @click:clear="clearEndDate"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="filters.endDate"
                      @update:model-value="endDateMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <v-data-table
      id="dataTable"
      :headers="headers"
      :items="filteredUsers"
      :loading="loading"
      :items-per-page="-1"
      :search="search"
      class="elevation-1"
      density="comfortable"
      fixed-header
    >
      <template #bottom></template>
      <template #[`item.name`]="{ item }">
        {{ formatName(item) }}
      </template>
      <template #[`item.role`]="{ item }">
        {{ formatRole(item.role) }}
      </template>
      <template #[`item.euResident`]="{ item }">
        {{ item.euResident ? 'Yes' : 'No' }}
      </template>
      <template #[`item.collegeContactConsent`]="{ item }">
        {{ item.collegeContactConsent ? 'Yes' : 'No' }}
      </template>
      <template #[`item.created`]="{ item }">
        {{ formatDate(item.created) }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import { dbFireStore } from "../firebase";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export default {
  name: 'UsersView',
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const users = ref([]);
    const loading = ref(true);
    const search = ref('');
    const startDateMenu = ref(false);
    const endDateMenu = ref(false);
    const showFilters = ref(false);

    // Filter states
    const filters = ref({
      role: null,
      graduationYear: null,
      euResident: null,
      startDate: null,
      endDate: null,
    });

    const roleOptions = [
      { title: 'Student', value: 'student' },
      { title: 'Parent/Guardian', value: 'guardian' },
      { title: 'Educator', value: 'educator' },
      { title: 'Counselor', value: 'iec' },
      { title: 'Other', value: 'other' },
    ];

    // Generate graduation year options (current year - 2 to current year + 6)
    const currentYear = new Date().getFullYear();
    const graduationYearOptions = Array.from(
      { length: 9 },
      (_, i) => currentYear - 2 + i
    );

    const isFiltering = computed(() => {
      return Object.values(filters.value).some(value => value !== null);
    });

    const activeFilterCount = computed(() => {
      return Object.values(filters.value).filter(value => value !== null).length;
    });

    const filteredUsers = computed(() => {
      let result = [...users.value];

      if (filters.value.role) {
        result = result.filter(user => user.role === filters.value.role);
      }

      if (filters.value.graduationYear) {
        result = result.filter(user => user.graduationYear === filters.value.graduationYear);
      }

      if (filters.value.euResident !== null) {
        result = result.filter(user => user.euResident === filters.value.euResident);
      }

      if (filters.value.startDate || filters.value.endDate) {
        result = result.filter(user => {
          const createdAt = user.created?.toDate();
          if (!createdAt) return false;

          if (filters.value.startDate && filters.value.endDate) {
            return isWithinInterval(createdAt, {
              start: startOfDay(parseISO(filters.value.startDate)),
              end: endOfDay(parseISO(filters.value.endDate))
            });
          } else if (filters.value.startDate) {
            return createdAt >= startOfDay(parseISO(filters.value.startDate));
          } else if (filters.value.endDate) {
            return createdAt <= endOfDay(parseISO(filters.value.endDate));
          }
          return true;
        });
      }

      return result;
    });

    const clearStartDate = () => {
      filters.value.startDate = null;
    };

    const clearEndDate = () => {
      filters.value.endDate = null;
    };

    const clearFilters = () => {
      filters.value = {
        role: null,
        graduationYear: null,
        euResident: null,
        startDate: null,
        endDate: null,
      };
    };

    const headers = [
      { title: 'Email', key: 'email', align: 'start' },
      { title: 'Sign up date', key: 'created', align: 'start' },
      { title: 'Name', key: 'name', align: 'start' },
      { title: 'Role', key: 'role', align: 'start' },
      { title: 'Business', key: 'businessName', align: 'start' },
      { title: 'High School', key: 'highSchool', align: 'start' },
      { title: 'Graduation Year', key: 'graduationYear', align: 'start' },
      { title: 'EU Resident', key: 'euResident', align: 'center' },
      { title: 'College Contact Consent', key: 'collegeContactConsent', align: 'center' },
      { title: 'Birthday', key: 'birthday', align: 'start' },
      { title: 'Zip Code', key: 'zipCode', align: 'start' },
    ];

    const formatRole = (role) => {
      const roles = {
        student: 'Student',
        guardian: 'Parent/Guardian',
        educator: 'Educator',
        iec: 'Counselor',
        other: 'Other'
      };
      return roles[role] || role;
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      try {
        // If it's already a Timestamp, just use toDate()
        if (timestamp instanceof Timestamp) {
          return format(timestamp.toDate(), 'MMMM d, yyyy');
        }
        return '';
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

    const formatName = (item) => {
      const firstName = item.firstName || '';
      const lastName = item.lastName || '';
      return [firstName, lastName].filter(Boolean).join(' ');
    };

    const fetchUsers = async () => {
      try {
        const usersQuery = query(
          collection(dbFireStore, 'users')
        );
        const querySnapshot = await getDocs(usersQuery);
        
        const userData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Normalize the creation date field
          const created = data.created || data.createdAt;
          return {
            id: doc.id,
            ...data,
            created: created
          };
        });

        // Now sort on the client side using the normalized 'created' field
        userData.sort((a, b) => {
          const dateA = a.created;
          const dateB = b.created;

          if (dateA && dateB) {
            return dateB.toDate() - dateA.toDate();
          }
          if (dateA) return -1;
          if (dateB) return 1;
          return 0;
        });

        users.value = userData;
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      // Check if user is admin
      if (!userStore.isAdmin) {
        router.push('/');
        return;
      }
      await fetchUsers();
    });

    return {
      headers,
      users,
      loading,
      formatRole,
      formatDate,
      search,
      filters,
      roleOptions,
      graduationYearOptions,
      filteredUsers,
      isFiltering,
      activeFilterCount,
      clearFilters,
      startDateMenu,
      endDateMenu,
      clearStartDate,
      clearEndDate,
      showFilters,
      formatName,
    };
  }
}
</script>

<style lang="scss">
#dataTable {
  border-radius: 8px;
  overflow: hidden;

  th:hover {
    cursor: pointer;
    background: #d8d8d8;
  }

  // Frozen first column styles
  tr th:first-of-type,
  tr td:first-of-type {
    position: sticky !important;
    left: 0;
    background: #eaeaea;
    border-right: 1px solid rgba(0, 0, 0, 0.12);
  }

  // Ensure header has higher z-index than body cells
  thead tr th:first-of-type {
    z-index: 3;
    background: #eaeaea;
  }

  tbody tr td:first-of-type {
    z-index: 1;
    background: white;
  }

  // Allow content to determine width
  th {
    white-space: nowrap;
    min-width: fit-content;
  }

  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // Ensure proper layering for all header cells
  thead tr th {
    z-index: 2;
    background: #eaeaea;
  }

  // Ensure body cells are below headers
  tbody tr td {
    background: white;
  }

  // Handle hover states
  tbody tr:hover td {
    background: #efefef !important;
  }

  tbody tr:hover td:first-of-type {
    background: #efefef !important;
  }
}

.v-data-table-header__content {
  color: #292f2c;
  font-weight: 500;
  font-size: 15px;
  white-space: nowrap;
}

.v-table.v-table--fixed-header>.v-table__wrapper>table>thead>tr>th {
  background: #eaeaea;
}

// Remove redundant styles
.v-data-table__tr:hover td {
  background: #efefef !important;
}

tr.v-data-table__selected {
  background: #f5f5f5;
}

// Add scroll styles
.v-data-table__wrapper {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

// Add styles for search field
.v-card {
  border-radius: 8px;
}

.v-text-field {
  .v-field__input {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
  }
}

.gap-4 {
  gap: 16px;
}

.v-badge__badge {
  margin-left: 4px;
  margin-right: -8px;
}
</style> 