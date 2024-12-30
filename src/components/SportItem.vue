<template>
  <li class="d-flex flex-column">
    <p style="text-transform: capitalize;">{{ sport.DESCR }}</p>
    <span style="font-size: 12px; color: rgb(114 114 114); " v-if="divisionCode !== null && divisionCode !== 'X'">{{ getDivisionText(divisionCode) }}</span>
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
      required: false
    }
  },
  methods: {
    getDivisionText(code) {
      const divisions = {
        '1': 'NCAA Division 1',
        '2': 'NCAA Division 2',
        '3': 'NCAA Division 3',
        'A': 'NCAA Division 1-A',
        'B': 'NCAA Division 1-AA',
        'C': 'Club',
        'X': ''
      };
      return divisions[code] || code;
    }
  }
}
</script> 