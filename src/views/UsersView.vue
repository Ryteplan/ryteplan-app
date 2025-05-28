<template>
  <v-container>
    <div class="flex-column align-center mb-6">
      <h1 class="text-h4">Users</h1>
      <span class="text-subtitle-1 text-medium-emphasis">{{ users.length }} total</span>
    </div>
    <v-data-table
      id="dataTable"
      :headers="headers"
      :items="users"
      :loading="loading"
      :items-per-page="-1"
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
import { ref, onMounted } from 'vue';
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
      formatDate
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
</style> 