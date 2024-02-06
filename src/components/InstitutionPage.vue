<template>
  <v-container class="px-3 px-lg-0">
    <div style="margin: 0 auto 64px; max-width: 1200px;">
      <v-row class="d-flex justify-space-between mt-0">
        <v-col cols="12" md="6">
          <span class="d-none">{{ institution["inunId"] }}</span>
          <h1 class="text-h6">{{ institution["name"] }}</h1>
          <span class="d-block" style="font-weight: 500;">{{ descriptions.tagline }}</span>
        </v-col>
        <v-col cols="12" md="6" class="d-md-flex align-center justify-end pt-0">
          <v-btn
            @click="showSaveToListDialog = true"
          >
            Add to list
          </v-btn>
        </v-col>
      </v-row>
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
              <span class="stat-content">{{ institution["stateCleaned"] }}</span>
            </div>
          </div>
          <div class="external-links mt-4">
            <ul class="mt-3 header-links d-flex flex-column no-wrap" style="gap: 12px;">
              <li><a :href="institution['urlAddress']" target="_blank">Official site</a></li>
              <li v-if="institution['urlAddressPriceCalc2023'] !== 'null'"><a :href="institution['urlAddressPriceCalc2023']" target="_blank">Net Price Calculator</a></li>          
              <!-- <li><a :href="institution['adEmail']" target="_blank">Admissions</a></li> -->
            </ul>
          </div>
        </div>
        <div class="institution-images-container mt-xs-4 mt-sm-4">
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
        <div class="stat-container">
          <span class="stat-label">Sector</span> 
          <span class="stat-content">{{ institution["mainInstControlDesc"] }}</span>
        </div>

        <div class="stat-container">
          <span class="stat-label">Undergraduate Enrollment</span>
          <span class="stat-content">
            <span class="d-block">{{ ((institution["enTotFtMenN"]) + (institution["enTotPtMenN"]) + institution["enTotFtWmnN"] + institution["enTotPtWmnN"]).toLocaleString() }}</span>
            <div class="d-none">
              =
              <span class="d-block">Men FT - {{ institution["enTotFtMenN"]?.toLocaleString() || '—' }}</span>
              + 
              <span class="d-block">Men PT - {{ institution["enTotPtMenN"]?.toLocaleString() || '—' }}</span>
              + 
              <span class="d-block">Women FT - {{ institution["enTotFtWmnN"]?.toLocaleString() || '—' }}</span>
              + 
              <span class="d-block">Women PT - {{ institution["enTotPtWmnN"]?.toLocaleString() || '—' }}</span>
            </div>
          </span>
        </div>

        <div class="stat-container">
          <span class="stat-label">Graduate Enrollment</span> 
          <span class="stat-content">
            <span class="d-block">{{ ((institution["enGradFtMenN"]) + (institution["enGradPtMen"]) + institution["enGradFtWmnN"] + institution["enGradPtWmnN"]).toLocaleString() }}</span>
            <div class="d-none">
              =
              <span class="d-block">Men FT - {{ institution["enGradFtMenN"]?.toLocaleString() || '—' }}</span>
              + 
              <span class="d-block">Men PT - {{ institution["enGradPtMen"]?.toLocaleString() || '—' }}</span>
              + 
              <span class="d-block">Women FT - {{ institution["enGradFtWmnN"]?.toLocaleString() || '—' }}</span>
              + 
              <span class="d-block">Women PT - {{ institution["enGradPtWmnN"]?.toLocaleString() || '—' }}</span>
            </div>
          </span>
        </div>

        <div class="stat-container"><span class="stat-label">Calendar </span> <span class="stat-content">{{ institution["mainCalendar"] }}</span></div>
        
        <div class="stat-container">
          <span class="stat-label">Admission Difficulty</span>
          <span class="stat-content">{{ toTitleCase(institution["adDiffAll"]?.toLocaleString() || '—') }}</span>
        </div>

        <div class="stat-container">
          <span class="stat-label">Admission Rate</span>
          <span class="stat-content">{{ (institution["admitRate"]?.toLocaleString() * 100).toFixed(0) || '—' }}%</span>
        </div>
        
        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">Applicants</span> <span class="stat-content">{{ institution["apRecd1stN"]?.toLocaleString() || '—' }}</span></div>
          <div class="stat-container"><span class="stat-label">Admits</span> <span class="stat-content">{{ institution["apAdmt1stN"]?.toLocaleString() || '—' }}</span></div>
        </div>
        
        <div class="d-flex flex-column">
            <span class="d-block">Full Time Undergrad</span>
            <div class="multiple-stat-container d-flex flex-row">
              <div class="stat-container"><span class="stat-label">Men</span> <span class="stat-content">{{ institution["enTotFtMenN"]?.toLocaleString() || '—' }}</span></div>
              <div class="stat-container"><span class="stat-label">Women</span> <span class="stat-content">{{ institution["enTotFtWmnN"]?.toLocaleString() || '—' }}</span></div>
          </div>
        </div>

        <div class="stat-container">
          <span class="stat-label">Religious </span> 
          <span v-if="institution['denomDesc'] !== 'null'" class="stat-content">{{ institution["denomDesc"] }}</span> 
          <span v-if="institution['afilDesc'] !== 'null'" class="stat-content">{{ institution["afilDesc"] }}</span>
          <span v-if="institution['denomDesc'] == 'null' && institution['afilDesc'] == 'null'" class="stat-content">—</span>
        </div>

        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">HBCU</span> <span class="stat-content">{{ institution["hbcu"] }}Coming Soon</span></div>
          <div class="stat-container"><span class="stat-label">Tribal</span> <span class="stat-content">{{ institution["tribal"] }}Coming Soon</span></div>
        </div>

        <div class="stat-container"><span class="stat-label">Average GPA </span> <span class="stat-content">{{ institution["frshGpa"]?.toLocaleString() || '—' }}</span></div>

        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">SAT 50th%ile</span> <span class="stat-content">{{ institution["sat1CompMean"] || '—' }}</span></div>
          <div class="stat-container"><span class="stat-label">ACT 50th%ile</span> <span class="stat-content">{{ institution["actComp50thP"]?.toLocaleString() || '—' }}</span></div>
        </div>


        <div class="stat-container"><span class="stat-label">SAT or ACT Required</span> <span class="stat-content">{{ institution["admsReq"]?.toLocaleString() || '—' }}</span></div>

        <div class="stat-container"><span class="stat-label">SAT/ACT Considered</span> <span class="stat-content">{{ institution["satActConsidered"]?.toLocaleString() || '—' }}</span></div>

        <div class="stat-container"><span class="stat-label">SAT/ACT Not Considered</span> <span class="stat-content">{{ institution["admsNotUsed"]?.toLocaleString() || '—' }}</span></div>
      </div>

      <div class="section-container mt-8">
        <h2>Deadline dates</h2>
        <div class="three-by-three-stat-grid mt-4">
          <div class="stat-container">
          <span class="stat-label">Regular Decision</span>
          <span class="stat-content">
            {{ new Date(1970, institution["apDlFrshMon"] - 1, 1).toLocaleString('default', { month: 'long' }) || '—' }}
            {{ institution["apDlFrshDay"]?.toLocaleString() || '—' }}</span>
        </div>
        <div class="stat-container">
          <span class="stat-label">Early Decision</span>
          <span class="stat-content">
            {{ new Date(1970, institution["apDlEdec_1Mon"] - 1, 1).toLocaleString('default', { month: 'long' }) || '—' }}
            {{ institution["apDlEdec_1Day"]?.toLocaleString() || '—' }}
          </span>
        </div>
        <div class="stat-container">
          <span class="stat-label">Early Decision 2</span>
          <span class="stat-content">
            {{ new Date(1970, institution["apDlEdec_2Mon"] - 1, 1).toLocaleString('default', { month: 'long' }) || '—' }}
            {{ institution["apDlEdec_2Day"]?.toLocaleString() || '—' }}
          </span>
        </div>
        <div class="stat-container">
          <span class="stat-label">Early Action</span>
          <span class="stat-content">
            {{ new Date(1970, institution["apDlEactMon"] - 1, 1).toLocaleString('default', { month: 'long' }) || '—' }}
            {{ institution["apDlEactDay"]?.toLocaleString() || '—' }}
          </span>
        </div>
        <div class="stat-container">
          <span class="stat-label">Fall Freshman Priority</span>
            <span class="stat-content">
              {{ new Date(1970, institution["apDlPrioMon"] - 1, 1).toLocaleString('default', { month: 'long' }) || '—' }}
              {{ institution["apDlPrioDay"]?.toLocaleString() || '—' }}
            </span>
          </div>
        </div>
      </div>
      <div class="section-container mt-4">
        <h2>Admission Consideration Factors</h2>        
        <div class="three-by-three-stat-grid mt-4">
          <div class="stat-container">
            <span class="stat-label">extracurricular activities</span>
            <span class="stat-content">{{ institution["activ"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">alumni/ae relation</span>
            <span class="stat-content">{{ institution["alum"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">character/personal qualities</span>
            <span class="stat-content">{{ institution["char"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">application essay</span>
            <span class="stat-content">{{ institution["essay"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">first generation</span>
            <span class="stat-content">{{ institution["first"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">geographical residence</span>
            <span class="stat-content">{{ institution["geog"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">academic GPA</span>
            <span class="stat-content">{{ institution["gpa"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">interview</span>
            <span class="stat-content">{{ institution["iview"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">racial/ethnic status</span>
            <span class="stat-content">{{ institution["minor"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">class rank</span>
            <span class="stat-content">{{ institution["rank"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">recommendation(s)</span>
            <span class="stat-content">{{ institution["recom"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">religious affiliation/commitment</span>
            <span class="stat-content">{{ institution["relig"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">rigor of secondary school record</span>
            <span class="stat-content">{{ institution["rigor"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">state residency</span>
            <span class="stat-content">{{ institution["state"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">talent/ability</span>
            <span class="stat-content">{{ institution["talnt"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">standardized test scores</span>
            <span class="stat-content">{{ institution["tstsc"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">volunteer work</span>
            <span class="stat-content">{{ institution["volun"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">level of applicant's interest</span>
            <span class="stat-content">{{ institution["apint"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">work experience</span>
            <span class="stat-content">{{ institution["work"]?.toLocaleString() || '—' }}</span>
          </div>
        </div>
      </div>

      <div class="section-container descriptions-container mt-8">
        <v-expansion-panels>
          <v-expansion-panel :value="0">
            <v-expansion-panel-title>
              <h3>Academics</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="">{{ descriptions.academics }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Surrounding Area</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="">{{ descriptions.surroundingArea }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Transportation</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="">{{ descriptions.transportation }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Social Life</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="">{{ descriptions.socialLife }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Campus</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="">{{ descriptions.campus }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Top 5 Popular Majors</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="">{{ descriptions.top5PopularMajors }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Strengths and Areas of Growth</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="">{{ descriptions.strengthsAndAreasOfGrowth }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <div class="section-container three-by-three-stat-grid mt-8">

        <div class="stat-container"><span class="stat-label">Tuition In State</span> <span class="stat-content">${{ institution["tuitStateFtD2024"]?.toLocaleString() || '—' }}</span></div>

        <div class="stat-container"><span class="stat-label">Tuition Out of State</span> <span class="stat-content">${{ institution["tuitNresFtD2024"]?.toLocaleString() || '—' }}</span></div>

        <div class="stat-container"><span class="stat-label">Tuition International</span> <span class="stat-content">${{ institution["tuitIntlFtD2024"]?.toLocaleString() || '—' }}</span></div>

        <div class="stat-container"><span class="stat-label">Tuition Overall</span> <span class="stat-content">${{ institution["tuitOverallFtD2024"]?.toLocaleString() || '—' }}</span></div>


        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">Males in Greek </span> <span class="stat-content">{{ institution["fratP"] }}%</span></div>
          <div class="stat-container"><span class="stat-label">Females in Greek </span> <span class="stat-content">{{ institution["soroP"] }}%</span></div>
        </div>

        <div class="stat-container"><span class="stat-label">Undergrad Pell Grants Awarded</span> <span class="stat-content">{{ institution["grsBachInitPellN"]?.toLocaleString() || '—' }}</span></div>
        <div class="stat-container"><span class="stat-label">Merit Scholarships Awarded <br/><span>(excluding athletics)</span> </span> <span class="stat-content">{{ institution["ugFtNnNoneedN"]?.toLocaleString() || '—' }}</span></div>
        <div class="stat-container"><span class="stat-label">Average Need-Based Scholarship</span> <span class="stat-content">${{ institution["ugFtAvgNbGiftD"]?.toLocaleString() || '—' }}</span></div>
        <div class="stat-container"><span class="stat-label">Average Merit Scholarship <br/><span>(excluding athletics)</span> </span> <span class="stat-content">${{ institution["ugFtNnNoneedD"]?.toLocaleString() || '—' }}</span></div>

        <div class="stat-container"><span class="stat-label">Freshmen Living on Campus</span> <span class="stat-content">{{ institution["hous1stUgP"] }}%</span></div>
        <div class="stat-container"><span class="stat-label">Out-of-State Population</span> <span class="stat-content">{{ institution["enNresP"] }}%</span></div>
        <div class="stat-container"><span class="stat-label">Undergrad International Population</span> <span class="stat-content">{{ institution["enNonresAlienN"] }}</span></div>
        <div class="stat-container"><span class="stat-label">Freshman Retention Rate</span> <span class="stat-content">{{ Math.round(institution["retentionFrshP"]) }}%</span></div>
      </div>

      <div class="section-container" style="margin-top: 80px;">
        <h2>Student Ethnicity</h2>
        <!-- <EthnicityChart :institutionData="this.institution"></EthnicityChart> -->
        <div class="ethnic-stats">
          <h3 class="text-center">Number of enrolled students</h3>
          <div class="three-by-three-stat-grid mt-4" style="max-width: 900px; margin: 0 auto;">
            <div class="stat-container">          
              <span class="stat-label">International</span>
              <div>
                <span class="stat-content">{{ institution["enNonresAlienN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enNonresAlienN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Asian</span>
              <div>
                <span class="stat-content">{{ institution["enAsianNonhispanicN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enAsianNonhispanicN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Black</span>
              <div>
                <span class="stat-content">{{ institution["enBlackNonhispanicN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enBlackNonhispanicN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Hispanic</span>
              <div>
                <span class="stat-content">{{ institution["enHispanicEthnicityN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enHispanicEthnicityN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Native Hawaiian or other Pacific Islander</span>
              <div>
                <span class="stat-content">{{ institution["enIslanderNonhispanicN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enIslanderNonhispanicN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Multirace</span>
              <div>
                <span class="stat-content">{{ institution["enMultiraceNonhispanicN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enMultiraceNonhispanicN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">American Indian or Alaska Native</span>
              <div>
                <span class="stat-content">{{ institution["enNativeNonhispanicN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enNativeNonhispanicN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Unknown</span>
              <div>
                <span class="stat-content">{{ institution["enRaceEthnicityUnknownN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enRaceEthnicityUnknownN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">White</span>
              <div>
                <span class="stat-content">{{ institution["enWhiteNonhispanicN"] }}</span>
                <span class="stat-content">—</span>
                <span class="stat-content">{{ ((institution["enWhiteNonhispanicN"] / ethnicityPopulationTotal) * 100).toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <v-expansion-panels class="mt-8">
        <v-expansion-panel :value="0">
          <v-expansion-panel-title>
            <h3>Majors/Fields of Study</h3>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list v-if="majors !== null">
              <div class="three-by-three-stat-grid">
                <v-list-item 
                    v-for="major in majors" 
                    :key="major"
                  >
                  <p>{{ toTitleCase(major) }}</p>
                </v-list-item>
              </div>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-expansion-panels class="mt-8">
        <v-expansion-panel :value="0">
          <v-expansion-panel-title>
            <h3>Sports</h3>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            
            <div class="d-flex flex-column">
              <div class="flex">
                <h3 class="mt-3">Associations</h3>
                <div class="multiple-stat-container mt-2">
                  <div class="stat-container">
                    <span class="stat-label">NCAA*</span> 
                    <span class="stat-content">{{ institution["assnAthlNcaa"] === 'NULL' || institution["assnAthlNcaa"] === 'FALSE' ? '—' : institution["assnAthlNcaa"].toLocaleString() }}</span>
                  </div>

                    <div class="stat-container">
                    <span class="stat-label">NCCAA</span> 
                    <span class="stat-content">{{ institution["assnAthlNccaa"] === 'NULL' || institution["assnAthlNccaa"] === 'FALSE' ? '—' : institution["assnAthlNccaa"].toLocaleString() }}</span>
                  </div>
                    
                  <div class="stat-container">
                    <span class="stat-label">NAIA</span> 
                    <span class="stat-content">{{ institution["assnAthlNaia"] === 'NULL' || institution["assnAthlNaia"] === 'FALSE' ? '—' : institution["assnAthlNccaa"].toLocaleString() }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 d-flex" style="font-size: 12px; gap: 16px;">
                  <span>1 = Division 1</span>
                  <span>2 = Division 2</span>
                  <span>3 = Division 3</span>
                  <span>A = Division 1-A</span>
                  <span>B = Division 1-AA</span>
                  <span>C = Club teams</span>
                  <span>X = Yes</span>
                </div>

            </div>
            <v-data-table 
              v-if="sports !== null"
              :headers="sportsHeaders"
              :items="sports"
              :items-per-page="-1"
            >
              <template #bottom></template>
            </v-data-table>            

          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <SaveToListDialog 
      v-model="showSaveToListDialog" 
      :institutionId="institutionId"
    />
  </v-container>
</template>
 
<script>
import { dbFireStore } from "../firebase";
import { collection, query, where, getDocs } from 'firebase/firestore'
import SaveToListDialog from './SaveToListDialog'

// import EthnicityChart from './EthnicityChart2.vue';

export default {
  setup() {
  },
  beforeMount() {
    this.loadInstitutionData();
  },
  mounted() {
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
      imagesData: [],
      showSaveToListDialog: false,
      descriptionPanels: [],
      majors: [],
      sports: [],
      sportsHeaders: [
        { title: 'Sport', key: 'descr', width: "300px" },
        { title: 'Intramural Men', key: 'maxIntmMen', width: "200px" },
        { title: 'Intramural Women', key: 'maxIntmWmn', width: "200px" },
        { title: 'Intercollegiate Men', key: 'maxIntcMen', width: "200px" },
        { title: 'Intercollegiate Women', key: 'maxIntcWmn', width: "250px" },
      ],
      ethnicityPopulationTotal: 0,
    }
  },
  methods: {
    async loadInstitutionData() {
      const slugFromURL = this.$route.params.slug;
      const institutions = collection(dbFireStore, 'institutions_v6');
      const q = query(institutions, where("uri", "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.institutionId = doc.id;
        this.institution = doc.data();
        this.majors = this.institution.acadProgDesc.split(',');
        this.majors = this.majors.map(major => major.trimStart());
        this.majors.sort((a, b) => a.localeCompare(b));
        this.majors = this.majors.map(major => major.replace(/\//g, ' and '));
        this.majors = this.majors.map(major => this.toTitleCase(major));
      });
      this.getImages();
      this.getDescriptions();
      this.getSports();
      this.getEthnicityPopulationTotal();
    },
    async getDescriptions() {
      const slugFromURL = this.$route.params.slug;
      const descriptions = collection(dbFireStore, 'Descriptions');
      const q = query(descriptions, where("uri", "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.descriptions = doc.data();
      });
    },
    async getSports() {
      const sports = collection(dbFireStore, 'Sports');
      const q = query(sports, where("inunId", "==", this.institution.inunId));
      const docSnap = await getDocs(q);
      let sportsArray = [];
      docSnap.forEach((doc) => {
        sportsArray.push(doc.data());
      });
      sportsArray = sportsArray.map(sport => {
        sport.descr = this.toTitleCase(sport.descr);
        return sport;
      });

      sportsArray.sort((a, b) => a.descr.localeCompare(b.descr));

      this.sports = sportsArray;
    },
    async getImages() {


  
      let dataArray = [];

      // const institutionSearchString = encodeURIComponent(this.institution["name"]) + " campus -logo";
      // const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${institutionSearchString}&num=5`);
      // const data = await response.json();

      const arialCampusSearchString = encodeURIComponent(this.institution["name"]) + " campus -source -text -getty";
      const arialCampusResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${arialCampusSearchString}&num=1`);
      const arialCampusData = await arialCampusResponse.json();
      dataArray.push(arialCampusData);

      const buildingOnCampusSearchString = encodeURIComponent(this.institution["name"]) + " office of bursar building";
      const buildingOnCampusResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${buildingOnCampusSearchString}&num=1`);
      const buildingOnCampusData = await buildingOnCampusResponse.json();
      dataArray.push(buildingOnCampusData);

      const surroundingAreaOrNeighborhoodSearchString = encodeURIComponent(this.institution["name"]) + " student union cafe";
      const surroundingAreaOrNeighborhoodResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${surroundingAreaOrNeighborhoodSearchString}&num=1`);
      const surroundingAreaOrNeighborhoodData = await surroundingAreaOrNeighborhoodResponse.json();
      dataArray.push(surroundingAreaOrNeighborhoodData);

      const classroomInstructionSearchString = encodeURIComponent(this.institution["name"]) + " student classroom or lecture hall photograph";
      const classroomInstructionResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${classroomInstructionSearchString}&num=1`);
      const classroomInstructionData = await classroomInstructionResponse.json();
      dataArray.push(classroomInstructionData);


      const athleticOrLiveGameSearchString = encodeURIComponent(this.institution["name"]) + " sports game";
      const athleticOrLiveGameResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${athleticOrLiveGameSearchString}&num=1`);
      const athleticOrLiveGameData = await athleticOrLiveGameResponse.json();

      dataArray.push(athleticOrLiveGameData);

      this.imagesData = dataArray;

      this.addImagesToLinkArray();
    },
    addImagesToLinkArray() {
      let linkArray = [];

      for (const i in this.imagesData) {
        linkArray.push(this.imagesData[i].items[0].link);
      }

      this.images = linkArray;
    },
    returnPercent(input) {
      const percentage = Math.round(input * 100);
      return percentage;
    },
    toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },
    getEthnicityPopulationTotal() {
      this.ethnicityPopulationTotal = this.institution["enAsianNonhispanicN"] + this.institution["enBlackNonhispanicN"] + this.institution["enHispanicEthnicityN"] + this.institution["enIslanderNonhispanicN"] + this.institution["enMultiraceNonhispanicN"] + this.institution["enNativeNonhispanicN"] + this.institution["enRaceEthnicityUnknownN"] + this.institution["enWhiteNonhispanicN"];
    }
  },
  components: {
    // EthnicityChart,
    SaveToListDialog
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
    margin-top: 24px;
    @media (min-width: 960px) { margin: 0; }
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
    aspect-ratio: 1;
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
    align-content: end;
  }

  .two-by-two-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 24px;
  }
  @media (max-width: 768px) {
    .three-by-three-stat-grid > div:not(:first-of-type) {
      margin-top: 24px;
    }
  }  
  @media (min-width: 768px) {
    .three-by-three-stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      row-gap: 24px;
    }    
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
    > span {
      font-size: 13px;
      color: #373737;
    }
  }

  .stat-content {
    font-size: 18px;
    font-weight: 600;

    &.not-yet-found {
      color: rgb(152, 20, 20);
    }

    &.review-this {
      color: rgb(249, 215, 111);
    }
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

  @media (min-width: 960px) {
    .location-links-images-container {
      display: grid;
      grid-template-columns: 1fr 2fr;
    }  
  }

  .section-container {
    background: white;
    padding: 24px;
    border-radius: 16px;
  }

  .descriptions-container {
    background: transparent;
    padding: 0;
    overflow: hidden;
  }

  .ethnic-stats {
    background: #f1f1f1;
    padding: 24px;
    border-radius: 24px;
    
    .stat-container {
      text-align: center;
    }
  }
</style>