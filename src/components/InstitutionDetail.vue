<template>
  <v-container>
    <div style="margin-top: 24px; max-width: 1120px; margin: 0 auto;">
      <!-- {{ institutionDetail }} -->
      <h1 class="text-center">{{ institutionDetail["institution name"] }}</h1>
      <div class="d-flex justify-space-between mt-4">
        <div class="stat-container"><span class="stat-label">State </span> <span class="stat-content">{{ institutionDetail["State "] }}</span></div>
        <div class="d-flex flex-column align-end">
          <a :href="institutionDetail['Website']" target="_blank">Website</a>
          <a :href="institutionDetail['Admissions Link']" target="_blank">Admissions</a>
        </div>
      </div>
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
        <div class="stat-container"><span class="stat-label">Sector </span> <span class="stat-content">{{ institutionDetail["Sector"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Undergraduate Enrollment </span> <span class="stat-content">{{ institutionDetail["Undergraduate enrollment"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Calendar </span> <span class="stat-content">{{ institutionDetail["Calendar"] }}</span></div>

        <div class="stat-container"><span class="stat-label">% Amit </span> <span class="stat-content">{{ institutionDetail["%admit"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Graduate enrollment</span> <span class="stat-content">{{ institutionDetail["Graduate enrollment"] }}</span></div>
        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">Men</span> <span class="stat-content">{{ returnPercent( institutionDetail["% Men"]) }}%</span></div>
          <div class="stat-container"><span class="stat-label">Women</span> <span class="stat-content">{{ returnPercent(institutionDetail["% Female "]) }}%</span></div>
        </div>

        <div class="stat-container"><span class="stat-label">Admission Test Scores</span> <span class="stat-content">{{ institutionDetail["Admission Test Scores"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Student to faculty ratio</span> <span class="stat-content">{{ institutionDetail["Student-to-faculty ratio"] }}</span></div>
        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">HBCU</span> <span class="stat-content">{{ institutionDetail["HBCU"] }}</span></div>
          <div class="stat-container"><span class="stat-label">Tribal</span> <span class="stat-content">{{ institutionDetail["Tribal"] }}</span></div>
        </div>


        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">SAT Combined</span> <span class="stat-content">{{ institutionDetail["SAT combined 50th%ile"] }}</span></div>
          <div class="stat-container"><span class="stat-label">ACT 50th%ile</span> <span class="stat-content">{{ institutionDetail["ACT 50th%ile"] }}</span></div>
        </div>
        <div class="stat-container"><span class="stat-label">Average GPA </span> <span class="stat-content">{{ institutionDetail["Average GPA"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Religious </span> <span class="stat-content">{{ institutionDetail["Religious affiliation"] }}</span></div>

      </div>
      <div class="stat-container mt-8">
        <span class="stat-label">Mission statement </span> 
        <span class="stat-content">{{ institutionDetail["Mission statement"] }}</span>
        <ul class="mt-4">
          <li>        <a class="mt-2" :href="institutionDetail['Mission statement link']" target="_blank">Visit mission statement</a>
</li>          
          <li>        <a class="mt-2" :href="institutionDetail['Net Price Calculator Link']" target="_blank">Net Price Calculator</a>
</li>          
          <li>        <a class="mt-2" :href="institutionDetail['DSPS Link']" target="_blank">Disability Services</a>
</li>          
        </ul>
      </div>

      <div class="mt-8">
        <span class="stat-label">About</span> 
        <span class="stat-content">{{ institutionDetail["About"] }}</span>
      </div>
      
      <div class="three-by-three-stat-grid mt-8">
        <div class="stat-container"><span class="stat-label">COA in-state students </span> <span class="stat-content">{{ institutionDetail["COA in-state students"] }}</span></div>
        <div class="stat-container"><span class="stat-label">COA out-of-state </span> <span class="stat-content">{{ institutionDetail["COA out-of-state"] }}</span></div>
        <div class="stat-container"><span class="stat-label">% in Greek </span> <span class="stat-content">{{ institutionDetail["% in Greek Life"] }}</span></div>

        <div class="stat-container"><span class="stat-label">%undergrads awarded pell </span> <span class="stat-content">{{ institutionDetail["% undergraduates awarded Pell grants"] }}</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads awarded institutional </span> <span class="stat-content">{{ institutionDetail["%undergraduates awarded institutional grant aid"] }}</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads in-state </span> <span class="stat-content">{{ institutionDetail["%undergraduates - in-state"] }}</span></div>

        <div class="stat-container"><span class="stat-label">% freshmen undergrads living on campus </span> <span class="stat-content">{{ institutionDetail["% Freshmen Undergrads living on campus"] }}</span></div>
        <div class="stat-container"><span class="stat-label">average amount of institutional </span> <span class="stat-content">{{ institutionDetail["average amount of institutional grant aid awarded toundergraduates"] }}</span></div>
        <div class="stat-container"><span class="stat-label">%undergrads - foreign countries </span> <span class="stat-content">{{ institutionDetail["%undergraduates - out-of-state"] }}</span></div>
      </div>

      <div class="one-by-two-grid mt-8">
        <div>
          <span class="font-weight-bold">Ethnic background</span>
          <div class="hello" ref="chartdiv">
          </div>
        </div>
      </div>
      <div class="two-by-two-grid mt-8 w-25">
        <div class="stat-container"><span class="stat-label">NCAA</span> <span class="stat-content">{{ institutionDetail["NCAA"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Retention Rate</span> <span class="stat-content">{{ institutionDetail["retention rate"] }}%</span></div>
        <div class="stat-container"><span class="stat-label">NAIA</span> <span class="stat-content">{{ institutionDetail["HBCU"] }}</span></div>
        <div class="stat-container"><span class="stat-label">4 yr grad</span> <span class="stat-content">{{ institutionDetail["4yr grad rate"] }}%</span></div>
      </div>


      <h3 class="mt-8">Other links:</h3>
      <ul>
        <li><a target="_blank" :href='institutionDetail["Application Link"]'>Application</a></li>
        <li><a target="_blank" :href='institutionDetail["Financial Aid Link"] '>Financial Aid</a></li>
      </ul>
    </div>
  </v-container>
</template>

<script>

import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

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
    },
    returnPercent(input) {
      const percentage = Math.round(input * 100);
      return percentage;
    }
  },
  beforeMount() {
    this.getInstitution();
    this.getImages();
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
