<template>
  <v-container style="padding:0 80px;">
    <div style="max-width: 1120px; margin: 36px auto 64px;">
      <div class="d-flex justify-space-between mt-4">
        <div>
          <h1 class="">{{ institution["name"] }}</h1>
        </div>
        <div class="d-flex flex-column align-end">
          <v-btn
            @click="showSaveToListDialog = true"
          >
            Add to list
          </v-btn>
        </div>
      </div>
      <div class="section-container location-links-images-container mt-2">
        <div class="d-flex flex-column">
          <div class="location-container d-flex flex-column" style="gap: 12px">
            <div class="stat-container">
              <span class="stat-label">Country</span>
              <span class="stat-content">{{ institution["countryCode"] }}</span>
            </div>
            <div class="stat-container">
              <span class="stat-label">City</span>
              <span class="stat-content">{{ institution["city"] }}</span>
            </div>
            <div class="stat-container">
              <span class="stat-label">State</span>
              <span class="stat-content">{{ institution["stateCode"] }}</span>
            </div>
          </div>
          
          <div class="external-links mt-4">
            <ul class="mt-3 header-links d-flex flex-column no-wrap" style="gap: 12px;">
              <li><a :href="institution['urlAddress']" target="_blank">Official site</a></li>
              <li><a class="mt-2" :href="institution['netPriceCalculatorLink']" target="_blank">Net Price Calculator</a></li>          
              <li><a :href="institution['admissionsLink']" target="_blank">Admissions</a></li>
              <li><a class="mt-2" :href="institution['missionStatementLink']" target="_blank">Visit mission statement</a></li>          
              <li><a class="mt-2" :href="institution['dspsLink']" target="_blank">Disability Services</a></li>          
            </ul>
          </div>
        </div>
        <div class="institution-images-container">
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
      </div>
      <div class="section-container three-by-three-stat-grid mt-8">
        <div class="stat-container"><span class="stat-label">Sector</span> <span class="stat-content">{{ institution["mainInstControl"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Undergraduate Enrollment </span> <span class="stat-content">{{ institution["grsBachInitN"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Calendar </span> <span class="stat-content">{{ institution["mainCalendar"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Freshman Applicants | Admits </span> <span class="stat-content">{{ institution["apRecd1stN"] }} | {{ institution["apAdmt1stN"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Graduate enrollment</span> <span class="stat-content">{{ institution["enTotGradN"] }}</span></div>

        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">Men</span> <span class="stat-content">{{ institution["enFrshFtMenN"] }}</span></div>
          <div class="stat-container"><span class="stat-label">Women</span> <span class="stat-content">{{ institution["enFrshFtWmnN"] }}</span></div>
        </div>

        <div class="stat-container"><span class="stat-label">Testing Policy</span> <span class="stat-content">{{ institution["adTestPolicyT"] }}</span></div>
        <div class="stat-container"><span class="stat-label"># of classes with 100+ students</span> <span class="stat-content">{{ institution["classSec7"] }}</span></div>

        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">HBCU</span> <span class="stat-content">{{ institution["hbcu"] }}Coming Soon</span></div>
          <div class="stat-container"><span class="stat-label">Tribal</span> <span class="stat-content">{{ institution["tribal"] }}Coming Soon</span></div>
        </div>


        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">SAT Combined</span> <span class="stat-content">{{ institution["satCombined50thIle"] }}Coming Soon</span></div>
          <div class="stat-container"><span class="stat-label">ACT 50th%ile</span> <span class="stat-content">{{ institution["act50thIle"] }}Coming Soon</span></div>
        </div>

        <div class="stat-container"><span class="stat-label">Average GPA </span> <span class="stat-content">{{ institution["frshGpa"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Religious </span> <span class="stat-content">{{ institution["denomCode"] }}</span></div>
      </div>

      <div class="section-container descriptions-container mt-8">
        <div class="">
          <h3>Academics</h3>
          <p class="mt-1">{{ descriptions.academics }}</p>
        </div>
        <div class="mt-8">
          <h3>About the City</h3>
          <p class="mt-1">{{ descriptions.aboutTheCity }}</p>
        </div>
        <div class="mt-8">
          <h3>About the Culture</h3>
          <p class="mt-1">{{ descriptions.aboutTheCulture }}</p>
        </div>
      </div>

      <div class="section-container three-by-three-stat-grid mt-8">
        <div class="stat-container"><span class="stat-label">Tuition Resident</span> <span class="stat-content">{{ institution["tuitState1stFtD2024"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Tuition Non-Resident</span> <span class="stat-content">{{ institution["tuitNres1stFtD2024"] }}</span></div>
        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">Male % in Greek </span> <span class="stat-content">{{ institution["fratP"] }}</span></div>
          <div class="stat-container"><span class="stat-label">Female % in Greek </span> <span class="stat-content">{{ institution["soroP"] }}</span></div>
        </div>

        <div class="stat-container"><span class="stat-label">%undergrads awarded pell </span> <span class="stat-content">{{ institution["undergraduatesAwardedPellGrants"] }}</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads awarded institutional </span> <span class="stat-content">{{ institution["undergraduatesAwardedInstitutionalGrantAid"] }} coming soon</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads non-resident </span> <span class="stat-content">{{ institution["enNresP"] }}%</span></div>

        <div class="stat-container"><span class="stat-label">% freshmen undergrads living on campus </span> <span class="stat-content">{{ institution["hous1stUgP"] }}</span></div>

        <div class="stat-container"><span class="stat-label">average amount of institutional</span> <span class="stat-content">{{ institution["averageAmountOfInstitutionalGrantAidAwardedToundergraduates"] }}coming soon</span></div>

        <div class="stat-container"><span class="stat-label">%undergrads - foreign countries </span> <span class="stat-content">{{ institution["undergraduatesOutOfState"] }} coming soon</span></div>

        <div class="stat-container"><span class="stat-label">4-Year Graduation Rate  </span> <span class="stat-content">{{ institution["grs4YrN"] }}</span></div>
        <div class="stat-container"><span class="stat-label">6-Year Graduation Rate  </span> <span class="stat-content">{{ institution["grsBachTotP"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Retention Rate </span> <span class="stat-content">{{ institution["retentionFrshP"] }}</span></div>


      </div>

      <div class="section-container one-by-two-grid" style="margin-top: 80px;">
        <div class="stat-container">
          <h3>Putting ethnic data here for now</h3>
          <span class="stat-label">en1stAsianNonhispanicN</span> 
          <span class="stat-content">{{ institution["en1stAsianNonhispanicN"] }}</span>
          <span class="stat-label">en1stBlackNonhispanicN</span> 
          <span class="stat-content">{{ institution["en1stBlackNonhispanicN"] }}</span>
          <span class="stat-label">en1stHispanicEthnicityN</span> 
          <span class="stat-content">{{ institution["en1stHispanicEthnicityN"] }}</span>
          <span class="stat-label">en1stIslanderNonhispanicN</span> 
          <span class="stat-content">{{ institution["en1stIslanderNonhispanicN"] }}</span>
          <span class="stat-label">en1stMultiraceNonhispanicN</span> 
          <span class="stat-content">{{ institution["en1stMultiraceNonhispanicN"] }}</span>
          <span class="stat-label">en1stAsianNonhispanicN</span> 
          <span class="stat-content">{{ institution["en1stAsianNonhispanicN"] }}</span>
          <span class="stat-label">en1stNativeNonhispanicN</span> 
          <span class="stat-content">{{ institution["en1stNativeNonhispanicN"] }}</span>
          <span class="stat-label">en1stNonresAlien1stN</span> 
          <span class="stat-content">{{ institution["en1stNonresAlien1stN"] }}</span>
          <span class="stat-label">en1stRaceEthnicityUnknwnN</span> 
          <span class="stat-content">{{ institution["en1stRaceEthnicityUnknwnN"] }}</span>
          <span class="stat-label">en1stWhiteNonhispanicN</span> 
          <span class="stat-content">{{ institution["en1stWhiteNonhispanicN"] }}</span>
        </div>
        
        <div>
          <span class="font-weight-bold">Ethnic background</span>
          <div class="hello" ref="chartdiv"></div>
        </div>
      </div>
      <div class="section-container two-by-two-grid mt-8 w-25">
        <h1>Testing stuff is to go here</h1>
      </div>
    </div>
    <SaveToListDialog 
      v-model="showSaveToListDialog" 
      :institutionId="institutionId"
    />
  </v-container>
</template>
 
<script>
import { dbFireStore } from "../firebase";
import { documentId, collection, query, where, getDocs } from 'firebase/firestore'
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
      descriptions: {},
      institutionId: "",
      images: [],
      showSaveToListDialog: false,
    }
  },
  methods: {
    async loadInstitutionData() {
      const slugFromURL = this.$route.params.slug;
      const institutions = collection(dbFireStore, 'institutions');
      const q = query(institutions, where("uri", "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.institutionId = doc.id;
        this.institution = doc.data();
        console.log(doc.data());  
      });
      this.getImages();
      this.getDescriptions();
    },
    async getDescriptions() {
      const descriptions = collection(dbFireStore, 'Descriptions');
      const q = query(descriptions, where(documentId(), "==", this.institutionId));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.descriptions = doc.data();
      });
    },
    async getImages() {
      const institutionSearchString = encodeURIComponent(this.institution["name"]) + " campus -logo";
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
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 8px;
  }

  .institution-images-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 8px;
    row-gap: 8px;
  }

  .img-bg {
    background: #ededed;
    line-height: 0;
    width: 100%;
    height: 100%;
  }

  .institution-image {
    animation: fadeIn ease-in 600ms;
    object-fit: cover;
    object-position: center;
    width: 100%;
    height: 100%;
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

  .header-links a {
    padding: 8px;
    background: rgb(230, 230, 230);
    margin-right: 8px;
    border-radius: 8px;
    color: black;
    font-size: 13px;
    text-decoration: none;
  }

  .location-links-images-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }

  .section-container {
    background: white;
    padding: 24px;
    border-radius: 16px;
  }

</style>