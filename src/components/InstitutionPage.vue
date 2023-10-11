<template>
  <v-container style="padding:0 80px;">
    <div style="max-width: 1120px; margin: 36px auto 64px;">
      <h1 class="text-center">{{ institution["institutionName"] }}</h1>
      <div class="d-flex justify-space-between mt-4">
        <div class="stat-container">
          <span class="stat-label">State</span>
          <span class="stat-content">{{ institution["state"] }}</span>
        </div>
        <div class="d-flex flex-column align-end">
          <v-btn
            @click="showSaveToListDialog = true"
          >
            Add to list
          </v-btn>
        </div>
      </div>  
      <ul class="d-flex">
        <li><a :href="institution['admissionsLink']" target="_blank">Admissions</a></li>
        <li><a class="mt-2" :href="institution['missionStatementLink']" target="_blank">Visit mission statement</a></li>          
        <li><a class="mt-2" :href="institution['netPriceCalculatorLink']" target="_blank">Net Price Calculator</a></li>          
        <li><a class="mt-2" :href="institution['dspsLink']" target="_blank">Disability Services</a></li>          
      </ul>
      <div class="institution-images-container mt-12">
        <div class="img-bg">
          <img :src="image " v-for="(image, index) in images.slice(0, 1)" class="institution-image" :key="index" />
        </div>
        <div class="institution-images-grid">
            <template v-for="(image, index) in images.slice(1, 5)" :key="index">
              <div class="img-bg">
                <img class="institution-image" :src="image" />
              </div>
            </template>
        </div>
      </div>      
      <div class="three-by-three-stat-grid mt-8">
        <div class="stat-container"><span class="stat-label">Sector</span> <span class="stat-content">{{ institution["sector"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Undergraduate Enrollment </span> <span class="stat-content">{{ institution["undergraduateEnrollment"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Calendar </span> <span class="stat-content">{{ institution["calendar"] }}</span></div>
        <div class="stat-container"><span class="stat-label">% Admit </span> <span class="stat-content">{{ institution["admit"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Graduate enrollment</span> <span class="stat-content">{{ institution["graduateEnrollment"] }}</span></div>
        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">Men</span> <span class="stat-content">{{ institution["men"] }}</span></div>
          <div class="stat-container"><span class="stat-label">Women</span> <span class="stat-content">{{ institution["female"] }}</span></div>
        </div>

        <div class="stat-container"><span class="stat-label">Admission Test Scores</span> <span class="stat-content">{{ institution["admissionTestScores"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Student to faculty ratio</span> <span class="stat-content">{{ institution["studentToFacultyRatio"] }}</span></div>
        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">HBCU</span> <span class="stat-content">{{ institution["hbcu"] }}</span></div>
          <div class="stat-container"><span class="stat-label">Tribal</span> <span class="stat-content">{{ institution["tribal"] }}</span></div>
        </div>


        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">SAT Combined</span> <span class="stat-content">{{ institution["satCombined50thIle"] }}</span></div>
          <div class="stat-container"><span class="stat-label">ACT 50th%ile</span> <span class="stat-content">{{ institution["act50thIle"] }}</span></div>
        </div>
        <div class="stat-container"><span class="stat-label">Average GPA </span> <span class="stat-content">{{ institution["averageGPA"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Religious </span> <span class="stat-content">{{ institution["religiousAffiliation"] }}</span></div>

      </div>
      <div class="three-by-three-stat-grid mt-8">
        <div class="stat-container"><span class="stat-label">COA in-state students </span> <span class="stat-content">{{ institution["coaInStateStudents"] }}</span></div>
        <div class="stat-container"><span class="stat-label">COA out-of-state </span> <span class="stat-content">{{ institution["coaOutOfState"] }}</span></div>
        <div class="stat-container"><span class="stat-label">% in Greek </span> <span class="stat-content">{{ institution["inGreekLife"] }}</span></div>

        <div class="stat-container"><span class="stat-label">%undergrads awarded pell </span> <span class="stat-content">{{ institution["undergraduatesAwardedPellGrants"] }}</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads awarded institutional </span> <span class="stat-content">{{ institution["undergraduatesAwardedInstitutionalGrantAid"] }}</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads in-state </span> <span class="stat-content">{{ institution["undergraduatesInState"] }}%</span></div>

        <div class="stat-container"><span class="stat-label">% freshmen undergrads living on campus </span> <span class="stat-content">{{ institution["freshmenUndergradsLivingOnCampus"] }}</span></div>
        <div class="stat-container"><span class="stat-label">averageAmountOfInstitutionalGrantAidAwardedToundergraduates</span> <span class="stat-content">{{ institution["averageAmountOfInstitutionalGrantAidAwardedToundergraduates"] }}</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads - foreign countries </span> <span class="stat-content">{{ institution["undergraduatesOutOfState"] }}</span></div>
      </div>

      <div class="one-by-two-grid mt-8">
        <div>
          <span class="font-weight-bold">Ethnic background</span>
          <div class="hello" ref="chartdiv"></div>
        </div>
      </div>
      <div class="two-by-two-grid mt-8 w-25">
        <div class="stat-container"><span class="stat-label">NCAA</span> <span class="stat-content">{{ institution["ncaa"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Retention Rate</span> <span class="stat-content">{{ institution["retentionRate"] }}%</span></div>
        <div class="stat-container"><span class="stat-label">NAIA</span> <span class="stat-content">{{ institution["hbcu"] }}</span></div>
        <div class="stat-container"><span class="stat-label">4 yr grad</span> <span class="stat-content">{{ institution["4YrGradRate"] }}%</span></div>
      </div>
    </div>
    <SaveToListDialog 
      v-model="showSaveToListDialog" 
    />
  </v-container>
</template>
 
<script>
import { dbFireStore } from "../firebase";
import { collection, query, where, getDocs } from 'firebase/firestore'
import SaveToListDialog from './SaveToListDialog'

import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';


export default {
  setup() {
  },
  beforeMount() {
    this.loadInstitutionData();
  },
  mounted() {
    let root = am5.Root.new(this.$refs.chartdiv);
    root._logo.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    var chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        endAngle: 270
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    var series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        endAngle: 270
      })
    );

    series.states.create("hidden", {
      endAngle: -90
    });

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series.data.setAll([{
      category: "American Indian or Alaska Native",
      value: 501.9
    }, {
      category: "Asian",
      value: 301.9
    }, {
      category: "Black or African American",
      value: 201.1
    }, {
      category: "Hispanic/Latino",
      value: 165.8
    }, {
      category: "Native Hawaiian or Other Pacific Islander",
      value: 139.9
    }, {
      category: "Two or more races",
      value: 128.3
    }, {
      category: "Unknown",
      value: 99
    }]);

    series.appear(1000, 100);

  },
  beforeUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  },
  data() {
    return {
      institution: {},
      images: [],
      showSaveToListDialog: false,
    }
  },
  methods: {
    async loadInstitutionData() {
      const slugFromURL = this.$route.params.slug;
      const institutions = collection(dbFireStore, 'institutions');
      const q = query(institutions, where("slug", "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.institution = doc.data();
      });
      this.getImages();
    },
    async getImages() {
      const institutionSearchString = encodeURIComponent(this.institution["institutionName"]) + " campus -logo";
      console.log(institutionSearchString);
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${institutionSearchString}&num=5`);
      const data = await response.json();
      let linkArray = [];
      for (const i in data.items) {
        linkArray.push(data.items[i].link);
      }
      this.images = linkArray;
    },
    returnPercent(input) {
      const percentage = Math.round(input * 100);
      return percentage;
    },
  },
  components: {
    SaveToListDialog
  }
};

</script>

<style>
  .hello {
    width: 100%;
    height: 400px;
    margin: 0 auto;
  }

  ul {
    list-style: none;
  }

  p span {
    font-weight: bold;
  }
  
  .institution-images-container {
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

  .img-bg {
    aspect-ratio: 1 / 1;
    background: #ededed;
    line-height: 0;
  }

  .institution-image {
    animation: fadeIn ease-in 600ms;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  @keyframes fadeIn {
      0% {opacity:0;}
      100% {opacity:1;}
  }

  .one-by-two-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    row-gap: 24px;
  }

  .two-by-two-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 24px;
  }

  .three-by-three-stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    row-gap: 24px;
  }

  .multiple-stat-container {
    display: flex;

    .stat-container:not(:first-child) {
      margin-left: 12px;
    }
  }

  .stat-container {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 15px;
    font-weight: 400;
    color: #2a2a2a;
  }

  .stat-content {
    font-size: 18px;
    font-weight: 600;
  }

</style>