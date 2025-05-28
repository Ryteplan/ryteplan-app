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
            color="primary"
            variant="text"
            @click="clearFilters"
            :disabled="!isFiltering"
            density="compact"
          >
            Clear Filters
          </v-btn>
        </div>

        <div class="mt-2">
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
        </div>
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
      <template #[`item.role`]="{ item }">
        {{ formatRole(item.role) }}
      </template>
      <template #[`item.euResident`]="{ item }">
        {{ item.euResident ? 'Yes' : 'No' }}
      </template>
      <template #[`item.collegeContactConsent`]="{ item }">
        {{ item.collegeContactConsent ? 'Yes' : 'No' }}
      </template>
      <template #[`item.createdAt`]="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { dbFireStore } from "../firebase";
import { format } from 'date-fns';

export default {
  name: 'UsersView',
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const users = ref([]);
    const loading = ref(true);
    const search = ref('');

    // Filter states
    const filters = ref({
      role: null,
      graduationYear: null,
      euResident: null,
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

      return result;
    });

    const clearFilters = () => {
      filters.value = {
        role: null,
        graduationYear: null,
        euResident: null,
      };
    };

    const headers = [
    { title: 'Email', key: 'email', align: 'start' },
    { title: 'First Name', key: 'firstName', align: 'start' },
      { title: 'Last Name', key: 'lastName', align: 'start' },
      { title: 'Role', key: 'role', align: 'start' },
      { title: 'Birthday', key: 'birthday', align: 'start' },
      { title: 'High School', key: 'highSchool', align: 'start' },
      { title: 'Business Name', key: 'businessName', align: 'start' },
      { title: 'Graduation Year', key: 'graduationYear', align: 'start' },
      { title: 'Zip Code', key: 'zipCode', align: 'start' },
      { title: 'EU Resident', key: 'euResident', align: 'center' },
      { title: 'College Contact Consent', key: 'collegeContactConsent', align: 'center' },
      { title: 'Created At', key: 'createdAt', align: 'start' },
    ];

    const formatRole = (role) => {
      const roles = {
        student: 'Student',
        guardian: 'Parent/Guardian',
        educator: 'Educator',
        counselor: 'Counselor',
        other: 'Other'
      };
      return roles[role] || role;
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      try {
        const date = timestamp.toDate();
        return format(date, 'MMM d, yyyy');
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(dbFireStore, 'users'), orderBy('lastName'));
        const querySnapshot = await getDocs(usersQuery);
        console.log('Number of users found:', querySnapshot.size);
        
        const userData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('User data:', data);
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log('Processed user data:', userData);
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
}

.v-data-table-header__content {
  color: #292f2c;
  font-weight: 500;
  font-size: 15px;
  text-wrap: nowrap;
}

.v-table.v-table--fixed-header>.v-table__wrapper>table>thead>tr>th {
  background: #eaeaea;
}

.v-data-table__tr:hover td {
  background: #efefef !important;
}

tr.v-data-table__selected {
  background: #f5f5f5;
}

tr th:first-of-type,
tr td:first-of-type {
  position: sticky !important;
  z-index: 1;
  left: 0;
  background: #eaeaea;
  width: 48px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.v-table--fixed-header>.v-table__wrapper>table:first-of-type>thead>tr:first-of-type>th:first-of-type {
  z-index: 10;
}

table > thead > tr:nth-child(1) > th.v-data-table__td.v-data-table-column--fixed.v-data-table-column--last-fixed.v-data-table-column--align-.v-data-table__th--fixed.v-data-table__th {
  z-index: 6 !important;
}

tr th:nth-child(2),
tr td:nth-child(2) {
  position: sticky !important;
  left: 48px !important;
  background: #eaeaea;
  padding-bottom: 8px !important;
  padding-top: 8px !important;
}

tr td {
  line-height: 1.3em;
  color: #232323;
}

.v-table>.v-table__wrapper>table>tbody>tr>td {
  padding-top: 8px;
  padding-bottom: 8px;
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

// Fix background color for frozen columns when scrolling
tr td:first-of-type,
tr td:nth-child(2) {
  background: white !important;
}

tr:hover td:first-of-type,
tr:hover td:nth-child(2) {
  background: #efefef !important;
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
  margin-left: 8px;
}
</style> 