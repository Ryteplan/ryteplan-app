<template>
  <div>
    <div class="hello" ref="chartdiv"></div>
  </div>
</template>
  
<script>
  import * as am5 from '@amcharts/amcharts5';
  import * as am5percent from "@amcharts/amcharts5/percent";
  import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

  export default {
    name: 'EthnicityChart',
    props: {
      institutionData: {
        type: Object,
        required: true
      }      
    },
    methods: {
      async makeEthnicityChart() {

      let root = am5.Root.new(this.$refs.chartdiv);
      root._logo.dispose();
      root.setThemes([am5themes_Animated.new(root)]);

      var chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          startAngle: 180,
          endAngle: 360,
          layout: root.verticalLayout,
          innerRadius: am5.percent(50)
        })
      );

      // Create series
      // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
      var series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: "value",
          categoryField: "category",
          startAngle: 180,
          endAngle: 360,
          alignLabels: true
        })
      );

      series.states.create("hidden", {
        endAngle: -90
      });

      // Set data
      // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
      series.data.setAll([
        {
          category: "International",
          value: this.institutionData.en1stNonresAlien1stN
        }, 
        {
          category: "Asian",
          value: this.institutionData.en1stAsianNonhispanicN
        }, 
        {
          category: "Black",
          value: this.institutionData.en1stBlackNonhispanicN
        }, 
        {
          category: "Hispanic",
          value: this.institutionData.en1stHispanicEthnicityN
        }, 
        {
          category: "Native Hawaiian \n or Other Pacific Islander",
          value: this.institutionData.en1stIslanderNonhispanicN
        }, 
        {
          category: "Multirace",
          value: this.institutionData.en1stMultiraceNonhispanicN
        }, 
        {
          category: "American Indian \n or Alaska Native",
          value: this.institutionData.en1stNativeNonhispanicN
        }, 
        {
          category: "Unknown",
          value: this.institutionData.en1stRaceEthnicityUnknwnN
        }, 
        {
          category: "White",
          value: this.institutionData.en1stWhiteNonhispanicN
        }, 
      ]);

      series.appear(1000, 100);
      },
    },
    mounted() {
      this.makeEthnicityChart();
    }
  }
</script>

<style scoped>
  .hello {
    width: 100%;
    height: 400px;
    margin: 0 auto;
  }
</style>