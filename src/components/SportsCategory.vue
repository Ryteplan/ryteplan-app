<template>
	<div>
		<h3>{{ categoryName === 'Mens Varsity' ? "Men's Varsity" : categoryName === 'Women Varsity' ? "Women's Varsity" : categoryName }}</h3>
		<ul>
			<li class="sport-listing flex-column" v-for="(sport, sportName) in sports" :key="sportName">
				<div class="d-flex ga-4">
					<h4>{{ sportName }}</h4>
					<div class="division" v-if="category !== 'Club' && category !== 'Intramural'">
							<span>{{ sport.Division }}</span>
							<span class="subdivision" v-if="sport.Subdivision.trim() !== ''">{{ sport.Subdivision }}</span>
					</div>
					<div v-else>
							<span> - <span class="gender">{{ sport.Gender }}</span></span>
					</div>
				</div>
				<div class="d-flex ga-4 mb-8">
					<v-btn @click="editSport(sportName)">Edit</v-btn>
					<v-btn @click="deleteSport(sportName)">Delete</v-btn>
				</div>
			</li>
		</ul>
	</div>
</template>
  
<script>
	import { useUserStore } from '../stores/userStore';
  export default {
    name: 'SportsCategory',
		setup() {
			let userStore = useUserStore();
			userStore.getAdminMode();

			return {
				userStore,      
			};    
		},
		props: {
      categoryName: {
        type: String,
        required: true
      },
      sports: {
        type: Object,
        required: true
      },
      category: {
        type: String,
        required: true
      }
    },
		methods: {
			deleteSport(sportName) {
				console.log(sportName);
			}
		}
  }
</script>