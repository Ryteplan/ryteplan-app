<template>
  <li class="d-flex flex-column">
    <p style="text-transform: capitalize;">{{ sport.sport_name }}</p>
    <span 
      v-if="divisionCode && divisionCode !== 'X'" 
      style="font-size: 12px; color: rgb(114 114 114);"
    >
      {{ getDivisionText(divisionCode) }}
    </span>
  </li>
</template>

<script>
export default {
  props: {
    sport: {
      type: Object,
      required: true
    },
    divisionCode: {
      type: String,
      required: false,
      default: null
    }
  },
  methods: {
    getDivisionText(code) {
      const divisions = {
        '1': 'NCAA Division 1',
        '2': 'NCAA Division 2',
        '3': 'NCAA Division 3',
        'A': 'NCAA Division 1 FBS',
        'B': 'NCAA Division 1 FCS',
        'C': 'Club',
        'X': ''
      };
      return divisions[code] || code;
    }
  }
}
</script> 