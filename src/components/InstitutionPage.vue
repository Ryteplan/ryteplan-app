<template>
  <v-container class="px-3 px-lg-0">
    <div style="margin: 0 auto 64px; max-width: 1200px;">
      <v-row class="d-flex justify-space-between mt-0">
        <v-col cols="12" md="6">
          <span class="d-none">{{ institution["inunId"] }}</span>
          <h1 class="text-h6">{{ institution["name"] }}</h1>
          <!-- <span class="d-block" style="font-weight: 500;">{{ descriptions.tagline }}</span> -->
        </v-col>
        <v-col cols="12" md="6" class="d-md-flex align-center justify-end pt-0">
          <v-btn
            @click="showSaveToListDialog = true"
          >
            Add to list
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="userStore.adminMode">
        <v-col cols="3" class="pa-0">
          <v-switch 
            label="Hidden from Search"
            color="primary"
            v-model="manualInstitionData['hidden']"
            @change="toggleFieldTrueFalse('hidden')"
          >
          </v-switch>         
        </v-col>
        <v-col cols="3" class="pa-0">
          <v-switch 
            label="Edit image URLs"
            v-model="editImages"
            @change="toggleEditImages"
            color="primary"
            hide-details
            dense
          >
          </v-switch>
        </v-col>
      </v-row>
      <div v-if="editImages">
        <v-text-field v-model="imageURLsFromDB.image1" label="image1" density="compact" variant="solo" single-line hide-details></v-text-field>
        <v-text-field class="mt-4" v-model="imageURLsFromDB.image2" label="image2" density="compact" variant="solo" single-line hide-details></v-text-field>
        <v-text-field class="mt-4" v-model="imageURLsFromDB.image3" label="image3" density="compact" variant="solo" single-line hide-details></v-text-field>
        <v-text-field class="mt-4" v-model="imageURLsFromDB.image4" label="image4" density="compact" variant="solo" single-line hide-details></v-text-field>
        <v-text-field class="mt-4" v-model="imageURLsFromDB.image5" label="image5" density="compact" variant="solo" single-line hide-details></v-text-field>
        <v-btn class="mt-4" :disabled="isEditImagesSaveButtonDisabled" @click="saveImages">
          <span v-if="isEditImagesSaveButtonDisabled">
              <v-progress-circular
                :size="20"
                color="primary"
                indeterminate
              ></v-progress-circular>
          </span>
          <span v-if="!isEditImagesSaveButtonDisabled">
            Save images
          </span>
        </v-btn>
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
        <div v-if="Object.keys(imageURLsFromDB).length > 0">
          <div class="institution-images-container mt-xs-4 mt-sm-4">
            <div class="img-bg">
              <img class="institution-image" :src="imageURLsFromDB.image1" />
            </div>
            <div class="institution-images-grid">
              <div class="img-bg">
                <img class="institution-image" :src="imageURLsFromDB.image2" />
              </div>
              <div class="img-bg">
                <img class="institution-image" :src="imageURLsFromDB.image3" />
              </div>
              <div class="img-bg">
                <img class="institution-image" :src="imageURLsFromDB.image4" />
              </div>
              <div class="img-bg">
                <img class="institution-image" :src="imageURLsFromDB.image5" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="imagesFromGoogleSearch.length > 0">
          <div class="institution-images-container mt-xs-4 mt-sm-4">
            <div class="img-bg">
              <img :src="image " v-for="(image, index) in imagesFromGoogleSearch.slice(0, 1)" class="institution-image" :key="index" />
            </div>
            <div class="institution-images-grid">
                <template v-for="(image, index) in imagesFromGoogleSearch.slice(1, 5)" :key="index">
                  <div class="img-bg">
                    <img class="institution-image" :src="image" />
                  </div>
                </template>
            </div>
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
            <span class="d-block">{{ institution["undergradEnrollTotal"]?.toLocaleString() || '—' }}</span>
            <span class="d-none">{{ ((institution["enTotFtMenN"]) + (institution["enTotPtMenN"]) + institution["enTotFtWmnN"] + institution["enTotPtWmnN"]).toLocaleString() }}</span>
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
            <span class="d-block">{{ institution["enTotGradN"]?.toLocaleString() || '—' }}</span>
            <span class="d-none">{{ ((institution["enGradFtMenN"]) + (institution["enGradPtMen"]) + institution["enGradFtWmnN"] + institution["enGradPtWmnN"]).toLocaleString() }}</span>
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
        <div class="stat-container">
          <span class="stat-label">Religious </span> 
          <span v-if="institution['denomDesc'] !== 'null'" class="stat-content">{{ institution["denomDesc"] }}</span> 
          <span v-if="institution['afilDesc'] !== 'null'" class="stat-content">{{ institution["afilDesc"] }}</span>
          <span v-if="institution['denomDesc'] == 'null' && institution['afilDesc'] == 'null'" class="stat-content">—</span>
        </div>

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
            <span class="d-block stat-label">Full Time Undergrad</span>
            <div class="multiple-stat-container d-flex flex-row">
              <div class="stat-container"><span class="stat-label">Men</span> <span class="stat-content">{{ institution["enTotFtMenN"]?.toLocaleString() || '—' }}</span></div>
              <div class="stat-container"><span class="stat-label">Women</span> <span class="stat-content">{{ institution["enTotFtWmnN"]?.toLocaleString() || '—' }}</span></div>
          </div>
        </div>
        <div class="stat-container"><span class="stat-label">Calendar </span> <span class="stat-content">{{ institution["mainCalendar"] }}</span></div>
        <div class="multiple-stat-container">
          <div class="stat-container">
            <span class="stat-label">HBCU</span> 
            <span v-if="!userStore.adminMode" class="stat-content">              
              {{ manualInstitionData["hbcu"] ? '✔️' : '—' }}
            </span>
            <v-switch
                v-if="userStore.adminMode"
                label=""
                v-model="manualInstitionData['hbcu']"
                @change="toggleFieldTrueFalse('hbcu')"
                color="primary"
                hide-details
                dense
              >
              </v-switch>
          </div>
          <div class="stat-container">
            <span class="stat-label">Tribal</span> 
            <span v-if="!userStore.adminMode" class="stat-content">
              {{ manualInstitionData["tribal"] ? '✔️' : '—' }}              
            </span>
            <v-switch
              v-if="userStore.adminMode"
              label=""
              v-model="manualInstitionData['tribal']"
              @change="toggleFieldTrueFalse('tribal')"
              color="primary"
              hide-details
              dense
            >
            </v-switch>
          </div>
        </div>
        <div class="stat-container"><span class="stat-label">Average GPA </span> <span class="stat-content">{{ institution["frshGpa"]?.toLocaleString() || '—' }}</span></div>
        <div class="multiple-stat-container">
          <div class="stat-container"><span class="stat-label">SAT 50th%ile</span> <span class="stat-content">{{ institution["sat1CompMean"] || '—' }}</span></div>
          <div class="stat-container"><span class="stat-label">ACT 50th%ile</span> <span class="stat-content">{{ institution["actComp50thP"]?.toLocaleString() || '—' }}</span></div>
        </div>
        <div class="stat-container">
          <span class="stat-label">SAT or ACT Required</span> 
          <span class="stat-content">{{ (institution["admsReq"] && institution["admsReq"] !== 'null') ? institution["admsReq"].toLocaleString() : '—' }}</span>        
        </div>
        <div class="stat-container">
          <span class="stat-label">SAT/ACT Considered</span> 
          <span class="stat-content">{{ (institution["satActConsidered"] && institution["satActConsidered"] !== 'null') ? institution["satActConsidered"].toLocaleString() : '—' }}</span>
        </div>
        <div class="stat-container">
          <span class="stat-label">SAT/ACT Not Considered</span> 
          <span class="stat-content">{{ (institution["admsNotUsed"] && institution["admsNotUsed"] !== 'null') ? institution["admsNotUsed"].toLocaleString() : '—' }}</span>
        </div>

        <div class="stat-container"><span class="stat-label">Freshmen Living on Campus</span> <span class="stat-content">{{ institution["hous1stUgP"] }}%</span></div>
        <div class="stat-container"><span class="stat-label">Out-of-State Population</span> <span class="stat-content">{{ institution["enNresP"] }}%</span></div>
        <div class="stat-container">
          <span class="stat-label">Undergrad International Population</span> 
          <span class="stat-content">{{ institution["enNonresAlienN"] !== null ? ((institution["enNonresAlienN"] / ((institution["enTotFtMenN"]) + (institution["enTotPtMenN"]) + institution["enTotFtWmnN"] + institution["enTotPtWmnN"])) * 100).toFixed(2) + '%' : '—' }} </span>
          <!-- ({{ institution["enNonresAlienN"] }}) -->
        </div>
        <div class="stat-container"><span class="stat-label">Freshman Retention Rate</span> <span class="stat-content">{{ Math.round(institution["retentionFrshP"]) }}%</span></div>

        <div class="multiple-stat-container">
          <div class="stat-container">
            <span class="stat-label">Males in Greek </span> 
            <span class="stat-content">{{ institution["fratP"] ? institution["fratP"] + '%' : '—' }}</span>
          </div>
          <div class="stat-container"><span class="stat-label">Females in Greek </span> <span class="stat-content">{{ institution["soroP"] ? institution["soroP"] + '%' : '—' }}</span></div>
        </div>


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
            <span class="stat-label">alumni/AE relation</span>
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
      <v-expansion-panels class="mt-8">
        <v-expansion-panel :value="0">
          <v-expansion-panel-title>
            <h3>Cost & Aid</h3>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list v-if="majors !== null">
              <div class="four-column-grid mt-4">
                <div class="stat-container"><span class="stat-label">Tuition In State</span> <span class="stat-content">${{ institution["tuitStateFtD2024"]?.toLocaleString() || '—' }}</span></div>
                <div class="stat-container"><span class="stat-label">Tuition Out of State</span> <span class="stat-content">${{ institution["tuitNresFtD2024"]?.toLocaleString() || '—' }}</span></div>
                <div class="stat-container"><span class="stat-label">Tuition International</span> <span class="stat-content">${{ institution["tuitIntlFtD2024"]?.toLocaleString() || '—' }}</span></div>
                <div class="stat-container"><span class="stat-label">Tuition Overall</span> <span class="stat-content">${{ institution["tuitOverallFtD2024"]?.toLocaleString() || '—' }}</span></div>
              </div>
              <div class="three-by-three-stat-grid mt-8">
                <div class="stat-container"><span class="stat-label">Undergrad Pell Grants Awarded</span> <span class="stat-content">{{ institution["grsBachInitPellN"]?.toLocaleString() || '—' }}</span></div>
                <div class="stat-container"><span class="stat-label">Average Need-Based Scholarship</span> <span class="stat-content">${{ institution["ugFtAvgNbGiftD"]?.toLocaleString() || '—' }}</span></div>
              </div>
              <div class="three-by-three-stat-grid mt-8">
                <div class="stat-container"><span class="stat-label">Merit Scholarships Awarded <br/><span>(excluding athletics)</span> </span> <span class="stat-content">{{ institution["ugFtNnNoneedN"]?.toLocaleString() || '—' }}</span></div>
                <div class="stat-container"><span class="stat-label">Average Merit Scholarship <br/><span>(excluding athletics)</span> </span> <span class="stat-content">${{ institution["ugFtNnNoneedD"]?.toLocaleString() || '—' }}</span></div>
              </div>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="section-container mt-8">
        <h2>Student Ethnicity</h2>
        <!-- <EthnicityChart :institutionData="this.institution"></EthnicityChart> -->
        <div class="ethnic-stats">
          <div class="three-by-three-stat-grid mt-4" style="max-width: 900px; margin: 0 auto;">
            <div class="stat-container">          
              <span class="stat-label">International</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enNonresAlienN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enNonresAlienN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Asian</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enAsianNonhispanicN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enAsianNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Black</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enBlackNonhispanicN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enBlackNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>                
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Hispanic</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enHispanicEthnicityN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enHispanicEthnicityN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Native Hawaiian or other Pacific Islander</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enIslanderNonhispanicN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enIslanderNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Multirace</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enMultiraceNonhispanicN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enMultiraceNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>                
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">American Indian or Alaska Native</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enNativeNonhispanicN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enNativeNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Unknown</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enRaceEthnicityUnknownN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enRaceEthnicityUnknownN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">White</span>
              <div>
                <v-progress-linear
                  :model-value="((institution['enWhiteNonhispanicN'] / ethnicityPopulationTotal) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}% ({{ institution["enWhiteNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
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
import { collection, documentId, query, where, getDocs, setDoc, doc } from 'firebase/firestore'
import SaveToListDialog from './SaveToListDialog'
import { getAuth,onAuthStateChanged } from "firebase/auth";
import { useUserStore } from '../stores/userStore';
// import EthnicityChart from './EthnicityChart.vue';

export default {
  setup() {
    let userStore = useUserStore();
    userStore.getAdminMode();
    return {
      userStore,      
    };    
  },
  beforeMount() {
    this.loadInstitutionData();
    this.loadManualInstitutionData();
  },
  mounted() {
    let auth;
    auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    })
  },
  beforeUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  },
  data() {
    return {
      isLoggedIn: false,
      isEditImagesSaveButtonDisabled: false,
      editImages: false,
      test: 25,
      institution: {},
      manualInstitionData: {},
      descriptions: {},
      institutionId: "",
      imagesData: {},
      showSaveToListDialog: false,
      descriptionPanels: [],
      imagesFromGoogleSearch: [],
      imageURLsFromDB: {},
      majors: [],
      sports: [],
      sportsHeaders: [
        { title: 'Sport', key: 'descr', width: "250px" },
        { title: 'Intramural Men', key: 'intmMen', width: "180px" },
        { title: 'Intramural Women', key: 'intmWmn', width: "180px" },
        { title: 'Intercollegiate Men', key: 'intcMen', width: "200px" },
        { title: 'Intercollegiate Women', key: 'intcWmn', width: "230px" },
      ],
      ethnicityPopulationTotal: 0,
    }
  },
  methods: {
    toggleFieldTrueFalse(field) {
      setDoc(doc(dbFireStore, 'manual_institution_data', this.institution["uri"]), {
        [field]: this.manualInstitionData[field]
      }, { merge: true });
    },
    // saveManualFieldState() {
    //   this.userStore.setAdminMode();
    // },
    async loadManualInstitutionData() {
      const slugFromURL = this.$route.params.slug;
      const manual_institution_data = collection(dbFireStore, 'manual_institution_data');
      const q = query(manual_institution_data, where(documentId(), "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.manualInstitionData = doc.data()
      });
    },
    async saveImages() {
      this.isEditImagesSaveButtonDisabled = true;
      setDoc(doc(dbFireStore, 'institution_images', this.institution["uri"]), {
        "image1": this.imageURLsFromDB.image1,
        "image2": this.imageURLsFromDB.image2,
        "image3": this.imageURLsFromDB.image3,
        "image4": this.imageURLsFromDB.image4,
        "image5": this.imageURLsFromDB.image5,
      })
      setTimeout(() => {
        this.isEditImagesSaveButtonDisabled = false;
      }, 1000);
    },
    async loadInstitutionData() {
      const slugFromURL = this.$route.params.slug;
      const institutions = collection(dbFireStore, 'institutions_v7');
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
      const sports = collection(dbFireStore, 'sports_v3');
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

      const slugFromURL = this.$route.params.slug;
      const imageURLsFromDB = collection(dbFireStore, 'institution_images');
      const q = query(imageURLsFromDB, where(documentId(), "==", slugFromURL));

      const docSnap = await getDocs(q);

      docSnap.forEach((doc) => {
        this.imagesData = doc.data();
      });
      
      if (Object.keys(this.imagesData).length > 0) { 
        this.imageURLsFromDB = this.imagesData;
      } else {
        const arialCampusSearchString = encodeURIComponent(this.institution["name"]) + " campus -source -text -getty";
        const arialCampusResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${arialCampusSearchString}&num=1`);
        const image1 = await arialCampusResponse.json();
        dataArray.push(image1);

        const buildingOnCampusSearchString = encodeURIComponent(this.institution["name"]) + " office of bursar building";
        const buildingOnCampusResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${buildingOnCampusSearchString}&num=1`);
        const image2 = await buildingOnCampusResponse.json();
        dataArray.push(image2);

        const surroundingAreaOrNeighborhoodSearchString = encodeURIComponent(this.institution["name"]) + " student union cafe";
        const surroundingAreaOrNeighborhoodResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${surroundingAreaOrNeighborhoodSearchString}&num=1`);
        const image3 = await surroundingAreaOrNeighborhoodResponse.json();
        dataArray.push(image3);

        const classroomInstructionSearchString = encodeURIComponent(this.institution["name"]) + " student classroom or lecture hall photograph";
        const classroomInstructionResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${classroomInstructionSearchString}&num=1`);
        const image4 = await classroomInstructionResponse.json();
        dataArray.push(image4);

        const athleticOrLiveGameSearchString = encodeURIComponent(this.institution["name"]) + " sports game";
        const athleticOrLiveGameResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyArmaIMqQveUnRimtLUb8nFZNNvzqVjFfk&cx=17808ea58f81d4de4&searchType=IMAGE&imgSize=large&q=${athleticOrLiveGameSearchString}&num=1`);
        const image5 = await athleticOrLiveGameResponse.json();
        dataArray.push(image5);

        this.imagesData = dataArray;
        
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setDoc(doc(dbFireStore, 'institution_images', this.institution["uri"]), {
              "image1": image1.items[0].link,
              "image2": image2.items[0].link,
              "image3": image3.items[0].link,
              "image4": image4.items[0].link,
              "image5": image5.items[0].link,
            })
          } else {
            // User is signed out
            // Handle the situation as you wish
          }
        });
        this.addImagesFromSearchToLinkArray();
      }
    },
    addImagesFromSearchToLinkArray() {
      let linkArray = [];

      for (const i in this.imagesData) {
        linkArray.push(this.imagesData[i].items[0].link);
      }

      this.imagesFromGoogleSearch = linkArray;
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
      this.ethnicityPopulationTotal = 
      this.institution["enAsianNonhispanicN"] + 
      this.institution["enBlackNonhispanicN"] + 
      this.institution["enHispanicEthnicityN"] + 
      this.institution["enIslanderNonhispanicN"] + 
      this.institution["enMultiraceNonhispanicN"] + 
      this.institution["enNativeNonhispanicN"] + 
      this.institution["enRaceEthnicityUnknownN"] + 
      this.institution["enWhiteNonhispanicN"];
    },
    toggleEditImages(){
      this.editMode = !this.editMode;
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
      column-gap: 24px
    }

    .four-column-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr; 
      row-gap: 24px;
      column-gap: 16px
    }        
  }

  .multiple-stat-container {
    display: flex;
    gap: 5%;

    .stat-container:not(:first-child) {
      margin-left: 12px;
    }
  }

  .stat-container {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    color: #2a2a2a;
    font-size: 14px;
    font-weight: 600;

    > span {
      font-size: 14px;
      font-weight: 400;
      color: #373737;
    }
  }

  .stat-content {
    font-size: 18px;
    font-weight: 400;

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
    padding: 24px 0;
    
  }
</style>