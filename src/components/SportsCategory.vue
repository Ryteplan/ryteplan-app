<template>
    <div>
    <h3>{{ categoryName === 'Mens Varsity' ? "Men's Varsity" : categoryName === 'Women Varsity' ? "Women's Varsity" : categoryName }}</h3>
      <ul>
        <li class="sport-listing" v-for="(sport, sportName) in sports" :key="sportName">
          <h4>{{ sportName }}</h4>
          <div class="division" v-if="category !== 'Club' && category !== 'Intramural'">
            <span>{{ sport.Division }}</span>
            <span class="subdivision" v-if="sport.Subdivision.trim() !== ''">{{ sport.Subdivision }}</span>
          </div>
          <div v-else>
            <span> - <span class="gender">{{ sport.Gender }}</span></span>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SportsCategory',
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
    }
  }
  </script>