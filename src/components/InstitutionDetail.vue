<template>
  <v-container>
    <div style="margin-top: 24px; max-width: 1120px; margin: 0 auto;">
      <h1>{{ institutionDetail["institution name"] }}</h1>
      <div style="margin-top: 24px;">
        <p><span>State: </span> {{ institutionDetail["State "] }}</p>
        <p><span>Sector: </span> {{ institutionDetail["Sector"] }}</p>
        <p><span>Urban-centric locale: </span> {{ institutionDetail[" Urban-centric locale"] }}</p>
      </div>
      <div class="institution-images-container">
        <img :src="image " v-for="(image, index) in images.slice(0, 1)" class="institution-image" :key="index" />
        <div class="institution-images-grid">
          <template v-for="(image, index) in images.slice(1, 5)" :key="index">
            <img class="institution-image" :src="image" />
          </template>
        </div>
      </div>
      <div style="margin-top: 24px;">
        <p style="margin-top: 12px;"><span>Mission statement: </span>{{ institutionDetail["Mission statement"] }}</p>
        <p style="margin-top: 12px;"><span>About: </span>{{ institutionDetail["About"] }}</p>
      </div>
      <h1 style="color: Red; margin-top: 96px;">Paid Account</h1>
      <v-row class="mt-6">
        <v-col cols="6">
          <section style="margin: 24px 0;">
            <h2>Test Related Content</h2>
            <p><span>%enrolled submitted test score: </span>{{ institutionDetail["%enrolled submitted test score"] }}</p>
            <v-row style="margin-top: 24px;">
              <v-col cols="6">
                <h3>SAT</h3>
                <p><span>%submitting SAT scores: </span>{{ institutionDetail["%submitting SAT scores"] }}</p>
                <p><span>SAT EBRW 25th percentile score: </span>{{ institutionDetail["SAT EBRW 25th percentile score"] }}</p>
                <p><span>SAT EBRW 75th percentile score: </span>{{ institutionDetail["SAT EBRW 75th percentile score"] }}</p>
                <p><span>SAT 50th%ile: </span>{{ institutionDetail["SAT 50th%ile"] }}</p>
                <p><span>SAT Math 25th percentile score: </span>{{ institutionDetail["SAT Math 25th percentile score"] }}</p>
                <p><span>SAT Math 75th percentile score: </span>{{ institutionDetail["SAT Math 75th percentile score"] }}</p>
              </v-col>
              <v-col cols="6">
                <h3>ACT</h3>
                <p><span>% submitting ACT scores: </span>{{ institutionDetail["% submitting ACT scores"] }}</p>
                <p><span>ACT Composite 25th percentile score: </span>{{ institutionDetail["ACT Composite 25th percentile score"] }}</p>
                <p><span>ACT Composite 75th percentile score: </span>{{ institutionDetail["ACT Composite 75th percentile score"] }}</p>
                <p><span>ACT 50th%ile: </span>{{ institutionDetail["ACT 50th%ile"] }}</p>
              </v-col>
            </v-row>
          </section>

          <p><span>Hospital: </span> {{ institutionDetail["Has hospital"] }}</p>
          <p><span>HBCU: </span> {{ institutionDetail["HBCU"] }}</p>
          <p><span>Tribal: </span> {{ institutionDetail["Tribal"] }}</p>
          <p><span>Size and Setting: </span> {{ institutionDetail["Size and Setting"] }}</p>
          <p><span>Religious affiliation: </span> {{ institutionDetail["Religious affiliation"] }}</p>
          <p><span>NCAA: </span> {{ institutionDetail["NCAA"] }}</p>
          <p><span>NAIA: </span> {{ institutionDetail["NAIA"] }}</p>
          <p><span>%reg DSPS: </span>{{ institutionDetail["%reg DSPS"] }}</p>
          <p><span>%admit: </span>{{ institutionDetail["%admit"] }}</p>
          <p><span>COA in-state students : </span>{{ institutionDetail["COA in-state students "] }}</p>
          <p><span>COA out-of-state : </span>{{ institutionDetail["COA out-of-state "] }}</p>
          <p><span>Size range: </span>{{ institutionDetail["Size range"] }}</p>
          <p><span>Undergrad enrollment: </span>{{ institutionDetail["Undergrad enrollment"] }}</p>
          <p><span>%exclusively in distance education courses: </span>{{ institutionDetail["%exclusively in distance education courses"] }}</p>
          <p><span>%American Indian or Alaska Native: </span>{{ institutionDetail["%American Indian or Alaska Native"] }}</p>
          <p><span>% undergrad Asian: </span>{{ institutionDetail["% undergrad Asian"] }}</p>
          <p><span>%Black or African American: </span>{{ institutionDetail["%Black or African American"] }}</p>
          <p><span>% Hispanic/Latino: </span>{{ institutionDetail["% Hispanic/Latino"] }}</p>
          <p><span>%Native Hawaiian or Other Pacific Islander: </span>{{ institutionDetail["%Native Hawaiian or Other Pacific Islander"] }}</p>
          <p><span>% White: </span>{{ institutionDetail["% White"] }}</p>
          <p><span>% two or more races: </span>{{ institutionDetail["% two or more races"] }}</p>
          <p><span>% Race/ethnicity unknown: </span>{{ institutionDetail["% Race/ethnicity unknown"] }}</p>
          <p><span>%Nonresident Alien: </span>{{ institutionDetail["%Nonresident Alien"] }}</p>
          <p><span>%Asian/Native Hawaiian/Pacific Islander: </span>{{ institutionDetail["%Asian/Native Hawaiian/Pacific Islander"] }}</p>
          <p><span>%women: </span>{{ institutionDetail["%women"] }}</p>
          <p><span>retention rate: </span>{{ institutionDetail["retention rate"] }}</p>
          <p><span>Student-to-faculty ratio: </span>{{ institutionDetail["Student-to-faculty ratio"] }}</p>
          <p><span>%undergraduates - in-state: </span>{{ institutionDetail["%undergraduates - in-state"] }}</p>
          <p><span>%undergraduates - out-of-state: </span>{{ institutionDetail["%undergraduates - out-of-state"] }}</p>
          <p><span>%undergraduates - foreign countries: </span>{{ institutionDetail["%undergraduates - foreign countries"] }}</p>
          <p><span>4yr grad rate: </span>{{ institutionDetail["4yr grad rate"] }}</p>
          <p><span>5 yr grad rate: </span>{{ institutionDetail["5 yr grad rate"] }}</p>
          <p><span>6 yr grad rate: </span>{{ institutionDetail["6 yr grad rate"] }}</p>
          <p><span>%undergraduates awarded federal grant aid: </span>{{ institutionDetail["%undergraduates awarded federal grant aid"] }}</p>
          <p><span>Average amount of federal grant aid awarded to full-time first-time undergraduates: </span>{{ institutionDetail["Average amount of federal grant aid awarded to full-time first-time undergraduates"] }}</p>
          <p><span>% undergraduates awarded Pell grants: </span>{{ institutionDetail["% undergraduates awarded Pell grants"] }}</p>
          <p><span>%undergraduates awarded institutional grant aid: </span>{{ institutionDetail["%undergraduates awarded institutional grant aid"] }}</p>
          <p><span>Average amount of institutional grant aid awarded to full-time first-time undergraduates: </span>{{ institutionDetail["Average amount of institutional grant aid awarded to full-time first-time undergraduates"] }}</p>
          <p><span>Recommendations: </span>{{ institutionDetail["Recommendations"] }}</p>
          <p><span>Admission test scores: </span>{{ institutionDetail["Admission test scores"] }}</p>
          <p><span>TOEFL : </span>{{ institutionDetail["TOEFL "] }}</p>
          <p><span>Applicants total: </span>{{ institutionDetail["Applicants total"] }}</p>
          <p><span>Admissions total: </span>{{ institutionDetail["Admissions total"] }}</p>
          <p><span>Enrolled  men: </span>{{ institutionDetail["Enrolled  men"] }}</p>
          <p><span>Enrolled  women: </span>{{ institutionDetail["Enrolled  women"] }}</p>
          <p><span>Percent admitted : </span>{{ institutionDetail["Percent admitted "] }}</p>
          <p><span>Interview: </span>{{ institutionDetail["Interview"] }}</p>
          <p><span>Demonstrated Interest: </span>{{ institutionDetail["Demonstrated Interest"] }}</p>
          <p><span>% in Greek Life: </span>{{ institutionDetail["% in Greek Life"] }}</p>
          <p><span>% Undergrads living on campus: </span>{{ institutionDetail["% Undergrads living on campus"] }}</p>
        </v-col>
        <v-col cols="2">
          <h3>Links: </h3>
          <ul>
            <li><a target="_blank" :href='institutionDetail["Admissions Link"]'>Admissions</a></li>
            <li><a target="_blank" :href='institutionDetail["Application Link"]'>Application</a></li>
            <li><a target="_blank" :href='institutionDetail["Financial Aid Link"] '>Financial Aid</a></li>
            <li><a target="_blank" :href='institutionDetail["Net Price Calculator Link"] '>Net Price Calculator</a></li>
            <li><a target="_blank" :href='institutionDetail["DSPS Link"] '>Disability Services</a></li>
            <li><a target="_blank" :href='institutionDetail["Mission statement link"] '>Mission statement</a></li>
          </ul>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

export default {
  name: "institutionDetail",
  data() {
    return {
      institutionDetail: {},
      links: {},
      images: []
    };
  },
  computed: {
  },  
  methods: {
    getInstitution() {
      this.institutionDetail = JSON.parse(localStorage.getItem("institutionDetail"));
    },
    async getImages() {
      const institutionSearchString = encodeURIComponent(this.institutionDetail["institution name"]) + " campus -logo";
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${institutionSearchString}&num=5`);
      const data = await response.json();
      let linkArray = [];
      for (const i in data.items) {
        linkArray.push(data.items[i].link);
      }
      this.images = linkArray;
    }
  },
  beforeMount() {
    this.getInstitution();
    this.getImages();
  },
  mounted() {
  }
};
</script>

<style>
  ul {
    list-style: none;
  }

  p span {
    font-weight: bold;
  }
  
  .institution-images-container {
    margin: 24px 0;
    display: grid;
    aspect-ratio: 2 / 1;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;
  }

  .institution-images-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 8px;
    row-gap: 8px;
  }

  .institution-image {
    aspect-ratio: 1 / 1;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

</style>
