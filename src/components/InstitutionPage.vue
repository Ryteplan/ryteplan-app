<template>
  <v-container class="pt-0 px-0 position-relative">
    <v-select
      v-model="selectedSection"
      :items="navigationItems"
      density="compact"
      size="x-small"
      variant="outlined"
      @update:model-value="scrollToSection"
      class="section-navigation d-md-none"
      :class="{ 'is-fixed': isNavFixed }"
      hide-details
    ></v-select>
    <v-btn
      size="small"
      @click="showSaveToListDialog = true"
      class="add-to-list-mobile d-md-none"
    >
      Add to list
    </v-btn>
    <div class="cover-image d-md-none" style= "z-index: -1;">
      <img 
        v-if="imagesv2.length > 0"
        :src="imagesv2[0].url || imagesv2[0].URL"
        alt="Cover Image" 
      />
    </div>
    <div class="mx-2">
      <v-container class="d-none d-md-block">
        <v-row class="justify-space-between">
          <v-col cols="12" sm="12" md="6" lg="6" class="order-last order-md-first">
            <div v-if="userStore.adminMode">
              <span>{{ institution["uri"] }}</span>
              <span class="mx-2">—</span>
              <span>{{ institution["inunId"] }}</span>
            </div>
          </v-col>
          <v-col cols="12" sm="12" md="6" lg="6" class="d-flex align-center justify-end">
            <v-btn
              size="x-small"
              @click="showSaveToListDialog = true"
              class="md-mr-6"
            >
              Add to list
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-row class="flex-row mx-0 mt-0 mb-1 align-center" style="gap: 24px;" v-if="userStore.adminMode">
        <v-btn
          v-if="userStore.adminMode"
          size="small"
          :to="`/petersons-update/${institution['uri']}`"
        >
          Petersons Update
        </v-btn> 
        <v-btn
          v-if="userStore.adminMode"
          size="small"
          :to="`/image-work/${institution['uri']}`"
        >
          Edit Images
        </v-btn>
        <v-switch
          v-if="userStore.adminMode"
          label="HBCU"
          v-model="institution['hbcu']"
          @change="toggleFieldTrueFalse('hbcu')"
          color="primary"
          hide-details
          dense
        >
        </v-switch>

        <v-switch
          v-if="userStore.adminMode"
          label="Tribal"
          v-model="institution['tribal']"
          @change="toggleFieldTrueFalse('tribal')"
          color="primary"
          hide-details
          dense
        >
        </v-switch>

        <v-switch 
          label="Hidden from Search"
          color="primary"
          hide-details
          dense
          v-model="manualInstitionData['hidden']"
          @change="toggleFieldTrueFalse('hidden')"
        >
        </v-switch>         
      </v-row>
      <div class="section-container mb-8" style="max-width: 600px;" v-if="userStore.adminMode">
        <h4>Aliases</h4>
        <div v-if="institution?.aliases?.length > 0" class="aliases-container mt-4 mb-4">
          <div v-for="(alias, index) in institution.aliases" :key="index" class="d-flex align-center mb-2">
            <v-text-field
              v-model="institution.aliases[index]"
              density="compact"
              hide-details
              class="mr-2"
              placeholder="Enter alias"
              @input="markAliasAsEdited(index)"
            ></v-text-field>
            <v-btn
              v-if="editedAliasIndexes.includes(index)"
              density="compact"
              color="primary"
              variant="text"
              class="mr-2"
              @click="saveEditedAlias(index)"
            >
              Save
            </v-btn>
            <v-btn
              density="compact"
              icon="mdi-delete"
              variant="text"
              @click="institution.aliases.splice(index, 1)"
            ></v-btn>
          </div>
        </div>
        <div>
          <div class="d-flex align-center">
            <v-text-field
              v-model="newAlias"
              density="compact"
              hide-details
              class="mr-2"
              placeholder="Enter new alias"
              style="width: 400px"
            ></v-text-field>
            <v-btn
              v-if="newAlias.trim()"
              density="compact"
              color="primary"
              variant="text"
              @click="addAlias"
            >
              Save
            </v-btn>
          </div>
        </div>
      </div>
      <div class="mb-12" v-if="editImages">
        <div class="mt-4 pa-4" style="background: #eee;">
          <span class="font-size-s font-weight-bold">Image 1</span>
          <div class="mt-2">
            <span class="font-weight-bold">URL</span>
            <v-text-field v-model="imageURLsFromDB.image1" class="mt-2" label="image1" density="compact" variant="solo" single-line hide-details></v-text-field>
          </div>
          <div class="mt-4">
            <span class="font-weight-bold">Image Credit</span>
            <TiptapInputA v-model="imageCredits.image1" class="mt-4"/>
          </div>
        </div>
        <div class="mt-4 pa-4" style="background: #eee;">
          <span class="font-weight-bold">Image 2</span>
          <div class="mt-2">
            <span class="font-weight-bold">URL</span>
            <v-text-field v-model="imageURLsFromDB.image2" class="mt-2" label="image1" density="compact" variant="solo" single-line hide-details></v-text-field>
          </div>
          <div class="mt-4">
            <span class="font-weight-bold">Image Credit</span>
            <TiptapInputA v-model="imageCredits.image2" class="mt-4"/>
          </div>
        </div>
        <div class="mt-4 pa-4" style="background: #eee;">
          <span class="font-weight-bold">Image 3</span>
          <div class="mt-2">
            <span class="font-weight-bold">URL</span>
            <v-text-field v-model="imageURLsFromDB.image3" class="mt-2" label="image1" density="compact" variant="solo" single-line hide-details></v-text-field>
          </div>
          <div class="mt-4">
            <span class="font-weight-bold">Image Credit</span>
            <TiptapInputA v-model="imageCredits.image3" class="mt-4"/>
          </div>
        </div>
        <div class="mt-4 pa-4" style="background: #eee;">
          <span class="font-weight-bold">Image 4</span>
          <div class="mt-2">
            <span class="font-weight-bold">URL</span>
            <v-text-field v-model="imageURLsFromDB.image4" class="mt-2" label="image1" density="compact" variant="solo" single-line hide-details></v-text-field>
          </div>
          <div class="mt-4">
            <span class="font-weight-bold">Image Credit</span>
            <TiptapInputA v-model="imageCredits.image4" class="mt-4"/>
          </div>
        </div>
        <div class="mt-4 pa-4" style="background: #eee;">
          <span class="font-weight-bold">Image 5</span>
          <div class="mt-2">
            <span class="font-weight-bold">URL</span>
            <v-text-field v-model="imageURLsFromDB.image5" class="mt-2" label="image1" density="compact" variant="solo" single-line hide-details></v-text-field>
          </div>
          <div class="mt-4">
            <span class="font-weight-bold">Image Credit</span>
            <TiptapInputA v-model="imageCredits.image5" class="mt-4"/>
          </div>
        </div>
        <v-btn class="mt-4" :disabled="isEditImagesSaveButtonDisabled" color="primary" @click="saveImages">
          <span v-if="isEditImagesSaveButtonDisabled">
            <v-progress-circular
              :size="20"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </span>
          <span v-if="!isEditImagesSaveButtonDisabled">
            Save
          </span>
        </v-btn>
      </div>
      <div class="intro-block" id="intro">
        <div class="action-row my-4 d-md-none">
      </div>
      <div class="section-container location-links-images-container" style="gap: 20px;">
        <div class="d-flex flex-column">
          <div class="location-container d-flex flex-column" style="gap: 4px">
            <div class="d-flex flex-row" style="gap: 4px; font-size: 13px;">
              <span class="pill">{{ institution["mainInstControlDesc"] }}</span>
              <span v-if="institution['denomDesc'] !== '-'" class="pill">{{ institution["denomDesc"] }}</span>
              <span v-if="institution['afilDesc'] !== '—'" class="pill">{{ institution["afilDesc"] }}</span>
              <span v-if="institution['hbcu']" class="pill">HBCU</span>
              <span v-if="institution['tribal']" class="pill">Tribal</span>
            </div>
            <h1 class="text-h6">{{ institution["name"] }}</h1>
            <div class="d-flex flex-row" style="gap: 4px;">
              <div class="d-flex flex-row" style="gap: 4px;">
                <span class="">{{ institution["city"] }},</span>
                <span class="">{{ institution["stateCleaned"] }}</span>
              </div>
              <div class="d-flex flex-row" style="gap: 4px;">
                <span class="">·</span>
                <span class="">{{ institution["countryCode"] }}</span>
              </div>
            </div>
          </div>
          <div class="external-links mt-2">
            <ul class="mt-0 header-links d-flex flex-row no-wrap" style="gap: 12px;">
              <li><a :href="institution['urlAddress']" target="_blank">Official site<v-icon size="small" class="ml-1">mdi-open-in-new</v-icon></a></li>
              <li v-if="institution['urlAddressPriceCalc2023'] !== '-' "><a :href="institution['urlAddressPriceCalc2023']" target="_blank">Net Price Calculator<v-icon size="small" class="ml-1">mdi-open-in-new</v-icon></a></li>          
              <!-- <li><a :href="institution['adEmail']" target="_blank">Admissions</a></li> -->
            </ul>
          </div>
          <div class="mt-2">
            <p style="font-size: 13px;">Last updated: <i>{{ formatTimestamp(institution.lastUpdated) }}</i></p>
          </div>
        </div>
        <StorageImagesCollection :images="imagesv2" class="" />
      </div>
      </div>
      <h3 class="ml-4 mt-8 mb-n-5">Overview</h3>
      <div class="section-container three-by-three-stat-grid mt-8" id="overview">
        <StatDisplay
          label="Undergraduate (UG) Enrollment"
          :uri="institution['uri']"
          field="enTotUgN"
          :valueFromIntegrated="institution['enTotUgN']" 
          :valueFromPetersons="petersonsInstitution['enTotUgN']" 
          :valueFromManual="manualInstitionData['enTotUgN']"
        />
        <StatDisplay
          label="Graduate Enrollment"
          :uri="institution['uri']"
          field="enTotGradN"
          :valueFromIntegrated="institution['enTotGradN']" 
          :valueFromPetersons="petersonsInstitution['enTotGradN']" 
          :valueFromManual="manualInstitionData['enTotGradN']"
        />
        <div class="stat-container d-none">
          <div class="d-none">
            <span class="stat-label">Admission Difficulty</span>
            <span class="stat-content">{{ toTitleCase(institution["adDiffAll"]?.toLocaleString() || '—') }}</span>
          </div>
        </div>
        <StatDisplay
          label="Admission Rate"
          :uri="institution['uri']"
          field="admitRate"
          :valueFromIntegrated="institution['admitRate']" 
          :valueFromPetersons="petersonsInstitution['admitRate']" 
          :valueFromManual="manualInstitionData['admitRate']"
          valueType="percentage"
        />
        <div class="multiple-stat-container">
          <StatDisplay
            label="UG Applicants"
            :uri="institution['uri']"
            field="apRecd1stN"
            :valueFromIntegrated="institution['apRecd1stN']" 
            :valueFromPetersons="petersonsInstitution['apRecd1stN']" 
            :valueFromManual="manualInstitionData['apRecd1stN']"
          />
          <StatDisplay
            label="UG Admits"
            :uri="institution['uri']"
            field="apAdmt1stN"
            :valueFromIntegrated="institution['apAdmt1stN']" 
            :valueFromPetersons="petersonsInstitution['apAdmt1stN']" 
            :valueFromManual="manualInstitionData['apAdmt1stN']"
          />
        </div>
        <div class="d-flex flex-column">
            <span class="d-block stat-label">Full Time Undergraduate</span>
            <div class="multiple-stat-container d-flex flex-row">
              <StatDisplay
                label="Men"
                :uri="institution['uri']"
                field="enUgFtMenN"
                :valueFromIntegrated="institution['enUgFtMenN']" 
                :valueFromPetersons="petersonsInstitution['enUgFtMenN']" 
                :valueFromManual="manualInstitionData['enUgFtMenN']"
              />
              <StatDisplay
                label="Women"
                :uri="institution['uri']"
                field="enUgFtWmnN"
                :valueFromIntegrated="institution['enUgFtWmnN']" 
                :valueFromPetersons="petersonsInstitution['enUgFtWmnN']" 
                :valueFromManual="manualInstitionData['enUgFtWmnN']"
              />
          </div>
        </div>
        <div class="stat-container">
          <span class="stat-label">Calendar</span>
          <span class="stat-content">{{ institution["mainCalendar"] }}</span>
        </div>
        <StatDisplay
          label="Average GPA"
          :uri="institution['uri']"
          field="frshGpa"
          :valueFromIntegrated="institution['frshGpa']" 
          :valueFromPetersons="petersonsInstitution['frshGpa']" 
          :valueFromManual="manualInstitionData['frshGpa']"
        />
        <div class="multiple-stat-container">
          <StatDisplay
            label="SAT 50th%ile"
            :uri="institution['uri']"
            field="sat1Combined50th"
            :valueFromIntegrated="institution['sat1Combined50th']" 
            :valueFromPetersons="petersonsInstitution['sat1Combined50th']" 
            :valueFromManual="manualInstitionData['sat1Combined50th']"
            :valueFromPetersonsMath="petersonsInstitution['sat1Math50thP']"
            :valueFromPetersonsVerbal="petersonsInstitution['sat1Verb50thP']"
            :valueFromManualMath="manualInstitionData['sat1Math50thP']"
            :valueFromManualVerbal="manualInstitionData['sat1Verb50thP']"
            valueType="numberNoComma"
          />
          <StatDisplay
            label="ACT 50th%ile"
            :uri="institution['uri']"
            field="actComp50thP"
            :valueFromIntegrated="institution['actComp50thP']" 
            :valueFromPetersons="petersonsInstitution['actComp50thP']" 
            :valueFromManual="manualInstitionData['actComp50thP']"
          />
        </div>        
        <StatDisplay
          label="Testing Policy"
          :uri="institution['uri']"
          field="testingPolicy"
          valueType="string"
          :valueFromManual="manualInstitionData['testingPolicy']"
        />
        <StatDisplay
          label="Freshmen Living on Campus"
          :uri="institution['uri']"
          field="hous1stUgP"
          :valueFromIntegrated="institution['hous1stUgP']" 
          :valueFromPetersons="petersonsInstitution['hous1stUgP']" 
          :valueFromManual="manualInstitionData['hous1stUgP']"
          valueType="percentageWholeNumbers"
        />
        <StatDisplay
          label="Out-of-State Population"
          :uri="institution['uri']"
          field="enNresP"
          :valueFromIntegrated="institution['enNresP']" 
          :valueFromPetersons="petersonsInstitution['enNresP']" 
          :valueFromManual="manualInstitionData['enNresP']"
          valueType="percentageWholeNumbers"
        />
        <div class="stat-container">
          <span class="stat-label">Undergrad International Population</span> 
          <span class="stat-content">
            {{ (institution["enNonresAlienN"] === -1 || institution["enNonresAlienN"] === null || institution["enTotFtMenN"] === -1 || institution["enTotPtMenN"] === -1 || institution["enTotFtWmnN"] === -1 || institution["enTotPtWmnN"] === -1 || ((institution["enTotFtMenN"]) + (institution["enTotPtMenN"]) + institution["enTotFtWmnN"] + institution["enTotPtWmnN"]) === 0) ? '—' : Math.round((institution["enNonresAlienN"] / ((institution["enTotFtMenN"]) + (institution["enTotPtMenN"]) + institution["enTotFtWmnN"] + institution["enTotPtWmnN"])) * 100) + '%' }}
          </span>
          <!-- ({{ institution["enNonresAlienN"] }}) -->
        </div>
        <StatDisplay
          label="Freshman Retention Rate"
          :uri="institution['uri']"
          field="retentionFrshP"
          :valueFromIntegrated="institution['retentionFrshP']" 
          :valueFromPetersons="petersonsInstitution['retentionFrshP']" 
          :valueFromManual="manualInstitionData['retentionFrshP']"
          valueType="percentageWholeNumbers"
        />
        <div class="multiple-stat-container">
          <StatDisplay
            label="Males in Greek"
            :uri="institution['uri']"
            field="fratP"
            :valueFromIntegrated="institution['fratP']" 
            :valueFromPetersons="petersonsInstitution['fratP']" 
            :valueFromManual="manualInstitionData['fratP']"
            valueType="percentageWholeNumbers"
          />
          <StatDisplay
            label="Females in Greek"
            :uri="institution['uri']"
            field="soroP"
            :valueFromIntegrated="institution['soroP']" 
            :valueFromPetersons="petersonsInstitution['soroP']" 
            :valueFromManual="manualInstitionData['soroP']"
            valueType="percentageWholeNumbers"
          />
        </div>
      </div>
      <div 
        class="section-container mt-8"
        v-if="userStore.adminMode"
      >
        <h2>Deadline dates</h2>
        <div class="three-by-three-stat-grid mt-4">
          <StatDisplay
            label="Regular Decision"
            :uri="institution['uri']"
            field="regDecDead"
            :valueFromIntegrated="institution['regDecDead']" 
            :valueFromPetersons="petersonsInstitution['regDecDead']" 
            :valueFromManual="manualInstitionData['regDecDead']"
            valueType="date"
          />
          <StatDisplay
            label="Early Decision 1"
            :uri="institution['uri']"
            field="earlyDecision1Dead"
            :valueFromIntegrated="institution['earlyDecision1Dead']" 
            :valueFromPetersons="petersonsInstitution['earlyDecision1Dead']" 
            :valueFromManual="manualInstitionData['earlyDecision1Dead']"
            valueType="date"
          />
          <StatDisplay
            label="Early Decision 2"
            :uri="institution['uri']"
            field="earlyDecision2Dead"
            :valueFromIntegrated="institution['earlyDecision2Dead']" 
            :valueFromPetersons="petersonsInstitution['earlyDecision2Dead']" 
            :valueFromManual="manualInstitionData['earlyDecision2Dead']"
            valueType="date"
          />
          <StatDisplay
            label="Early Action"
            :uri="institution['uri']"
            field="earlyActionDeadline"
            :valueFromIntegrated="institution['earlyActionDeadline']" 
            :valueFromPetersons="petersonsInstitution['earlyActionDeadline']" 
            :valueFromManual="manualInstitionData['earlyActionDeadline']"
            valueType="date"
          />
          <StatDisplay
            label="Fall Freshman Priority"
            :uri="institution['uri']"
            field="fallFreshPrio"
            :valueFromIntegrated="institution['fallFreshPrio']" 
            :valueFromPetersons="petersonsInstitution['fallFreshPrio']" 
            :valueFromManual="manualInstitionData['fallFreshPrio']"
            valueType="date"
          />
        </div>
      </div>
      <div class="section-container mt-4 d-none">
        <h2>Admission Consideration Factors</h2>        
        <div class="three-by-three-stat-grid mt-4">
          <div class="stat-container">
            <span class="stat-label">Academic GPA</span>
            <span class="stat-content">{{ institution["gpa"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Alumni/AE relation</span>
            <span class="stat-content">{{ institution["alum"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Application essay</span>
            <span class="stat-content">{{ institution["essay"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Character/Personal qualities</span>
            <span class="stat-content">{{ institution["char"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Class rank</span>
            <span class="stat-content">{{ institution["rank"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Extracurricular activities</span>
            <span class="stat-content">{{ institution["activ"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">First generation</span>
            <span class="stat-content">{{ institution["first"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Geographical residence</span>
            <span class="stat-content">{{ institution["geog"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Interview</span>
            <span class="stat-content">{{ institution["iview"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Level of applicant's interest</span>
            <span class="stat-content">{{ institution["apint"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Racial/Ethnic Status</span>
            <span class="stat-content">{{ institution["minor"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Recommendation(s)</span>
            <span class="stat-content">{{ institution["recom"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Religious affiliation/Commitment</span>
            <span class="stat-content">{{ institution["relig"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Rigor of secondary school record</span>
            <span class="stat-content">{{ institution["rigor"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Standardized test scores</span>
            <span class="stat-content">{{ institution["tstsc"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">State residency</span>
            <span class="stat-content">{{ institution["state"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Talent/Ability</span>
            <span class="stat-content">{{ institution["talnt"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Volunteer work</span>
            <span class="stat-content">{{ institution["volun"]?.toLocaleString() || '—' }}</span>
          </div>
          <div class="stat-container">
            <span class="stat-label">Work experience</span>
            <span class="stat-content">{{ institution["work"]?.toLocaleString() || '—' }}</span>
          </div>
        </div>
      </div>
      <h3 class="ml-4 mt-8 mb-n-5">Descriptions</h3>
      <div class="section-container descriptions-container mt-8" id="descriptions">
        <v-expansion-panels v-model="expandedPanels.descriptions" multiple @update:model-value="savePanelStates">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Academics</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="userStore.adminMode">
                <TiptapInputA 
                  v-model="descriptions.academics" 
                  placeholder="Enter academic description"
                  @update:modelValue="markDescriptionAsEdited('academics', $event)"
                />
                <v-btn
                  v-if="editedDescriptions.academics"
                  color="primary"
                  class="mt-2"
                  :loading="savingDescription === 'academics'"
                  @click="saveDescription('academics', descriptions.academics)"
                >
                  Save Changes
                </v-btn>
              </div>
              <div v-html="descriptions.academics" v-else></div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Surrounding Area</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="userStore.adminMode">
                <TiptapInputA 
                  v-model="descriptions.surroundingArea" 
                  placeholder="Enter surrounding area description"
                  @update:modelValue="markDescriptionAsEdited('surroundingArea', $event)"
                />
                <v-btn
                  v-if="editedDescriptions.surroundingArea"
                  color="primary"
                  class="mt-2"
                  :loading="savingDescription === 'surroundingArea'"
                  @click="saveDescription('surroundingArea', descriptions.surroundingArea)"
                >
                  Save Changes
                </v-btn>
              </div>
              <div v-html="descriptions.surroundingArea" v-else></div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Transportation</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="userStore.adminMode">
                <TiptapInputA 
                  v-model="descriptions.transportation" 
                  placeholder="Enter transportation description"
                  @update:modelValue="markDescriptionAsEdited('transportation', $event)"
                />
                <v-btn
                  v-if="editedDescriptions.transportation"
                  color="primary"
                  class="mt-2"
                  :loading="savingDescription === 'transportation'"
                  @click="saveDescription('transportation', descriptions.transportation)"
                >
                  Save Changes
                </v-btn>
              </div>
              <div v-html="descriptions.transportation" v-else></div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Social Life</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="userStore.adminMode">
                <TiptapInputA 
                  v-model="descriptions.socialLife" 
                  placeholder="Enter social life description"
                  @update:modelValue="markDescriptionAsEdited('socialLife', $event)"
                />
                <v-btn
                  v-if="editedDescriptions.socialLife"
                  color="primary"
                  class="mt-2"
                  :loading="savingDescription === 'socialLife'"
                  @click="saveDescription('socialLife', descriptions.socialLife)"
                >
                  Save Changes
                </v-btn>
              </div>
              <div v-html="descriptions.socialLife" v-else></div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Campus</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="userStore.adminMode">
                <TiptapInputA 
                  v-model="descriptions.campus" 
                  placeholder="Enter campus description"
                  @update:modelValue="markDescriptionAsEdited('campus', $event)"
                />
                <v-btn
                  v-if="editedDescriptions.campus"
                  color="primary"
                  class="mt-2"
                  :loading="savingDescription === 'campus'"
                  @click="saveDescription('campus', descriptions.campus)"
                >
                  Save Changes
                </v-btn>
              </div>
              <div v-html="descriptions.campus" v-else></div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Top 5 Popular Majors</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="userStore.adminMode">
                <TiptapInputA 
                  v-model="descriptions.top5PopularMajors" 
                  placeholder="Enter top 5 popular majors description"
                  @update:modelValue="markDescriptionAsEdited('top5PopularMajors', $event)"
                />
                <v-btn
                  v-if="editedDescriptions.top5PopularMajors"
                  color="primary"
                  class="mt-2"
                  :loading="savingDescription === 'top5PopularMajors'"
                  @click="saveDescription('top5PopularMajors', descriptions.top5PopularMajors)"
                >
                  Save Changes
                </v-btn>
              </div>
              <div v-html="descriptions.top5PopularMajors" v-else></div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3>Strengths and Areas of Growth</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="userStore.adminMode">
                <TiptapInputA 
                  v-model="descriptions.strengthsAndAreasOfGrowth" 
                  placeholder="Enter strengths and areas of growth description"
                  @update:modelValue="markDescriptionAsEdited('strengthsAndAreasOfGrowth', $event)"
                />
                <v-btn
                  v-if="editedDescriptions.strengthsAndAreasOfGrowth"
                  color="primary"
                  class="mt-2"
                  :loading="savingDescription === 'strengthsAndAreasOfGrowth'"
                  @click="saveDescription('strengthsAndAreasOfGrowth', descriptions.strengthsAndAreasOfGrowth)"
                >
                  Save Changes
                </v-btn>
              </div>
              <div v-html="descriptions.strengthsAndAreasOfGrowth" v-else></div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <h3 class="ml-4 mt-8 mb-n-5">Cost & Aid</h3>
      <div class="section-container cost-aid-container mt-8" id="cost">
        <div class="four-column-grid mt-4-md">
          <div class="stat-container"><span class="stat-label">Tuition In State</span> <span class="stat-content">{{ institution["tuitStateFtD2025"] === -1 ? '—' : '$' + (institution["tuitStateFtD2025"]?.toLocaleString() || '—') }}</span></div>
          <div class="stat-container"><span class="stat-label">Tuition Out of State</span> <span class="stat-content">{{ institution["tuitNresFtD2025"] === -1 ? '—' : '$' + (institution["tuitNresFtD2025"]?.toLocaleString() || '—') }}</span></div>
          <div class="stat-container"><span class="stat-label">Tuition International</span> <span class="stat-content">{{ institution["tuitIntlFtD2025"] === -1 ? '—' : '$' + (institution["tuitIntlFtD2025"]?.toLocaleString() || '—') }}</span></div>
          <div class="stat-container"><span class="stat-label">Tuition Overall</span> <span class="stat-content">{{ institution["tuitOverallFtD2025"] === -1 ? '—' : '$' + (institution["tuitOverallFtD2025"]?.toLocaleString() || '—') }}</span></div>
        </div>
        <div class="three-by-three-stat-grid mt-8">
          <div class="stat-container"><span class="stat-label">Undergrad Pell Grants Awarded</span> <span class="stat-content">{{ institution["grsBachInitPellN"] === -1 ? '—' : institution["grsBachInitPellN"]?.toLocaleString() || '—' }}</span></div>
          <div class="stat-container"><span class="stat-label">Average Need-Based Scholarship</span> <span class="stat-content">{{ institution["ugFtAvgNbGiftD"] === -1 ? '—' : '$' + (institution["ugFtAvgNbGiftD"]?.toLocaleString() || '—') }}</span></div>
        </div>
        <div class="three-by-three-stat-grid mt-8">
          <div class="stat-container"><span class="stat-label">Merit Scholarships Awarded <br/><span>(excluding athletics)</span> </span> <span class="stat-content">{{ institution["ugFtNnNoneedN"] === -1 ? '—' : '' + (institution["ugFtNnNoneedN"]?.toLocaleString() || '—') }}</span></div>
          <div class="stat-container"><span class="stat-label">Average Merit Scholarship <br/><span>(excluding athletics)</span> </span> <span class="stat-content">{{ institution["ugFtNnNoneedD"] === -1 ? '—' : '$' + (institution["ugFtNnNoneedD"]?.toLocaleString() || '—') }}</span></div>
        </div>
      </div>
      <h3 class="ml-4 mt-8 mb-n-5">Sports & Athletics</h3>
      <div class="section-container sports-container mt-8" id="sports">
        <div 
          class="d-flex align-center justify-space-between mb-4"
          v-if="userStore.adminMode"
        >
          <v-btn
            size="small"
            class="mb-4"
            :to="`/institution/${$route.params.slug}/sports-work`"
            target="_blank"
          >
            Edit Sports
          </v-btn>
        </div>
        
        <div class="w-100" v-if="sports.length > 0">
          <div class="d-flex align-center">
            <h3>Intercollegiate</h3>
            <div class="ms-2">
              <v-chip
                v-if="institution.assnAthlNaia !== 'FALSE'"
                size="small"
                class="me-1"
                color="primary"
              >
                NAIA
              </v-chip>
              <v-chip
                v-if="hasNCAAdivision('1')"
                size="small"
                class="me-1"
                color="primary"
              >
                NCAA Division 1
              </v-chip>
              <v-chip
                v-if="hasNCAAdivision('2')"
                size="small"
                class="me-1"
                color="primary"
              >
                NCAA Division 2
              </v-chip>
              <v-chip
                v-if="hasNCAAdivision('3')"
                size="small"
                class="me-1"
                color="primary"
              >
                NCAA Division 3
              </v-chip>
            </div>
          </div>
          <div class="d-flex mt-4 w-100">
            <div class="flex-grow-1 mr-4" v-if="menIntercollegiateSports.length > 0">
              <h4>Men</h4>
              <ul class="d-flex flex-column" style="gap: 8px;">
                <SportItem
                  v-for="sport in menIntercollegiateSports"
                  :key="`men-${sport.sport_name}`"
                  :sport="sport"
                  :division-code="getIntercollegiateDivision(sport, 'men')"
                />
              </ul>
            </div>
            <div class="flex-grow-1" v-if="womenIntercollegiateSports.length > 0">
              <h4>Women</h4>
              <ul class="d-flex flex-column" style="gap: 8px;">
                <SportItem
                  v-for="sport in womenIntercollegiateSports"
                  :key="`women-${sport.sport_name}`"
                  :sport="sport"
                  :division-code="getIntercollegiateDivision(sport, 'women')"
                />
              </ul>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No sports data available</p>
        </div>
        <div class="mt-4 d-none" v-if="hasAnyIntramural">
          <h3>Intramural</h3>
          <div class="d-flex">
            <div class="flex-grow-1 mr-4" v-if="menIntramuralSports.length > 0">
              <h4>Men</h4>
              <ul class="d-flex flex-column" style="gap: 8px;">
                <SportItem
                  v-for="sport in menIntramuralSports"
                  :key="`intramural-men-${sport.sport_name}`"
                  :sport="sport"
                  :division-code="getIntramuralDivision(sport, 'men')"
                />
              </ul>
            </div>
            <div class="flex-grow-1" v-if="womenIntramuralSports.length > 0">
              <h4>Women</h4>
              <ul class="d-flex flex-column" style="gap: 8px;">
                <SportItem
                  v-for="sport in womenIntramuralSports"
                  :key="`intramural-women-${sport.sport_name}`"
                  :sport="sport"
                  :division-code="getIntramuralDivision(sport, 'women')"
                />
              </ul>
            </div>
          </div>
        </div>
        <div class="mt-4" v-if="sports.filter(sport => this.isUncategorizedSport(sport)).length > 0">
          <h3>Uncategorized</h3>
          <ul class="d-flex flex-column mt-1" style="gap: 8px;">
            <SportItem
              v-for="sport in sports.filter(sport => this.isUncategorizedSport(sport))"
              :key="sport.sport_name"
              :sport="sport"
              :division-code=null
            />
          </ul>
        </div>
      </div>
      <h3 class="ml-4 mt-8 mb-n-5">Enrolled Students' Ethnicity</h3>
      <div class="section-container ethnicity-container mt-8" id="ethnicity">
        <div 
          class="ethnic-stats"
          v-if="institution['ethnicityPopulationTotal'] !== 0"
        >
          <div class="three-by-three-stat-grid mt-4" style="max-width: 900px; margin: 0 auto;">
            <div class="stat-container">          
              <span class="stat-label">International</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enNonresAlienN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enNonresAlienN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enNonresAlienN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Asian</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enAsianNonhispanicN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enAsianNonhispanicN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enAsianNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Black</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enBlackNonhispanicN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enBlackNonhispanicN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enBlackNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>                
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Hispanic</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enHispanicEthnicityN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enHispanicEthnicityN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enHispanicEthnicityN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Native Hawaiian or other Pacific Islander</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enIslanderNonhispanicN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enIslanderNonhispanicN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enIslanderNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Multirace</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enMultiraceNonhispanicN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enMultiraceNonhispanicN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enMultiraceNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>                
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">American Indian or Alaska Native</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enNativeNonhispanicN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enNativeNonhispanicN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enNativeNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">Unknown</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enRaceEthnicityUnknownN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enRaceEthnicityUnknownN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.floor(value) }}% ({{ institution["enRaceEthnicityUnknownN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
            <div class="stat-container">
              <span class="stat-label">White</span>
              <div>
                <v-progress-linear
                  :model-value="0"
                  color="blue-grey"
                  height="25"
                  v-if="institution['enWhiteNonhispanicN'] === -1"
                >
                  <template v-slot:default>
                    <strong>0% (—)</strong>
                  </template>
                </v-progress-linear>
                <v-progress-linear
                  v-else
                  :model-value="((institution['enWhiteNonhispanicN'] / institution['ethnicityPopulationTotal']) * 100).toFixed(2)"
                  color="blue-grey"
                  height="25"
                >
                  <template v-slot:default="{ value }"> 
                    <strong>{{ Math.floor(value) }}% ({{ institution["enWhiteNonhispanicN"] }})</strong>
                  </template>
                </v-progress-linear>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No data available</p>
        </div>
      </div>
      <v-expansion-panels class="d-none mt-8" v-model="expandedPanels.fieldsOfStudy" @update:model-value="savePanelStates">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <h3>Fields of Study</h3>
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
    </div>    
    <SaveToListDialog 
      v-model="showSaveToListDialog" 
      :institutionId="institutionId"
    />
    <v-dialog v-model="showImageCreditDialog" max-width="800">
      <v-card>
        <v-card-title>Image Information</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column">
            <img 
              :src="selectedImageUrl" 
              class="dialog-image mb-4"
              alt="Selected institution image"
            />
            <div v-html="selectedImageCredit"></div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showImageCreditDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
 
<script>
import { dbFireStore } from "../firebase";
import { collection, documentId, query, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore'
import SaveToListDialog from './SaveToListDialog'
import { getAuth,onAuthStateChanged } from "firebase/auth";
import { useUserStore } from '../stores/userStore';
import { useSearchFilterSortStore } from '../stores/searchFilterSortStore';
import StatDisplay from './StatDisplay.vue';
import TiptapInputA from "./TiptapInputA.vue"
import SportItem from './SportItem.vue'
import StorageImagesCollection from '@/components/StorageImagesCollection.vue'
import { formatTimestamp } from '../utils/timestampUtils';

export default {
  setup() {
    let userStore = useUserStore();
    userStore.getAdminMode();

    let searchFilterSortStore = useSearchFilterSortStore();
    searchFilterSortStore.saveThenClearSearchInput();

    return {
      userStore,      
    };    
  },
  async beforeMount() {
    await this.loadPetersonsData();
    await this.loadIntegratedInstitutionData();
    await this.loadManualInstitutionData();
    await this.loadPanelStates();
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
    });

    window.addEventListener('scroll', this.handleScroll);

    this.$nextTick(() => {
      const navElement = this.$el.querySelector('.section-navigation');
      if (navElement) {
        this.navOriginalTop = navElement.offsetTop;
      }
    });

    // Ensure intro is the initial section
    this.selectedSection = 'intro';

    // Wait for cover image to load before setting up observer
    const setupObserver = () => {
      const options = {
        root: null,
        rootMargin: '-60% 0px -40% 0px', // Update when section is 60% from top
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.selectedSection = entry.target.id;
          }
        });
      }, options);

      // Observe all sections
      this.navigationItems.forEach(item => {
        const element = document.getElementById(item.value);
        if (element) {
          observer.observe(element);
        }
      });
    };
    setTimeout(() => {
      setupObserver();
    }, 1500);
  },
  beforeUnmount() {
    if (this.root) {
      this.root.dispose();
    }
    window.removeEventListener('scroll', this.handleScroll);
  },
  data() {
    return {
      selectedSection: 'intro',
      navigationItems: [
      { title: 'Intro', value: 'intro' },
      { title: 'Overview', value: 'overview' },
      { title: 'Descriptions', value: 'descriptions' },
      { title: 'Cost & Aid', value: 'cost' },
      { title: 'Sports', value: 'sports' },
      { title: 'Ethnicity', value: 'ethnicity' }
      ],
      isNavFixed: false,
      navOriginalTop: 0,
      isLoggedIn: false,
      isEditImagesSaveButtonDisabled: false,
      isEditImagesSaveButtonVisible: false,
      editImages: false,
      institution: {},
      petersonsInstitution: {},
      manualInstitionData: {},
      descriptions: {},
      institutionId: "",
      imagesData: {},
      showSaveToListDialog: false,
      descriptionPanels: [],
      imagesFromGoogleSearch: [],
      imageURLsFromDB: {
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        image5: "",
      },
      imageCredits: {
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        image5: "",
      },
      showImageCredits: false,
      majors: [],
      sports: [],
      ethnicityPopulationTotal: 0,
      newAlias: "",
      editedAliasIndexes: [],
      selectedImageCredit: null,
      showImageCreditDialog: false,
      hoveredImageIndex: null,
      selectedImageUrl: null,
      expandedPanels: {
        descriptions: [],
      },
      imagesv2: [],
      editedDescriptions: {},
      savingDescription: null,
    }
  },
  methods: {
    formatTimestamp,
    handleScroll() {
      const navElement = this.$el.querySelector('.section-navigation');
      if (!navElement || window.getComputedStyle(navElement).display === 'none') {
        this.isNavFixed = false;
        return;
      }

      if (window.scrollY > (this.navOriginalTop - 80)) {
        this.isNavFixed = true;
      } else {
        this.isNavFixed = false;
      }
    },
    scrollToSection(sectionId) {
      // If this is a descriptions section, expand the panel
      if (sectionId === 'descriptions') {
        if (!this.expandedPanels.descriptions.includes(0)) {
          this.expandedPanels.descriptions.push(0);
        }
      }

      // Wait for any panel expansions to complete
      this.$nextTick(() => {
        if (sectionId === 'intro') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 110; // Height of sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    },
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
    },
    async toggleFieldTrueFalse(field) {
      console.log('Updating field:', field, 'with value:', this.institution[field]);
      
      // Check if user is logged in
      if (!this.isLoggedIn) {
        console.error('User must be logged in to update institution data');
        return;
      }
      
      try {
        await setDoc(doc(dbFireStore, 'manual_institution_data', this.institution["uri"]), {
          [field]: this.institution[field]
        }, { merge: true });

        await setDoc(doc(dbFireStore, 'institutions_integrated', this.institution["uri"]), {
          [field]: this.institution[field]
        }, { merge: true });

        console.log('Successfully updated field:', field);
      } catch (error) {
        console.error('Error updating field:', field, error);
      }
    },
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
      setDoc(doc(dbFireStore, 'image_credits', this.institution["uri"]), {
        "image1": this.imageCredits.image1,
        "image2": this.imageCredits.image2,
        "image3": this.imageCredits.image3,
        "image4": this.imageCredits.image4,
        "image5": this.imageCredits.image5,
      })
      setTimeout(() => {
        this.isEditImagesSaveButtonDisabled = false;
        this.editImages = false
      }, 1000);
    },
    async loadPetersonsData() {
      const slugFromURL = this.$route.params.slug;
      const institutions = collection(dbFireStore, 'institutions_petersons_processed_20250731');
      const q = query(institutions, where("uri", "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.petersonsInstitution = doc.data();
      });
    },
    async loadIntegratedInstitutionData() {
      const slugFromURL = this.$route.params.slug;
      const institutions = collection(dbFireStore, 'institutions_integrated');
      const q = query(institutions, where("uri", "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.institutionId = doc.id;
        this.institution = doc.data();
        if (this.institution.acadProgDesc) {
          this.majors = this.institution.acadProgDesc.split(',');
          this.majors = this.majors.map(major => major.trimStart());
          this.majors.sort((a, b) => a.localeCompare(b));
          this.majors = this.majors.map(major => major.replace(/\//g, ' and '));
          this.majors = this.majors.map(major => this.toTitleCase(major));
        }
      });
      this.getSports();
      this.getImages();
      this.getDescriptions();
      document.title = this.institution["name"] + " | Ryteplan College Search";
    },
    async getDescriptions() {
      const slugFromURL = this.$route.params.slug;
      console.log(slugFromURL);
      const descriptions = collection(dbFireStore, 'Descriptions');
      const q = query(descriptions, where(documentId(), "==", slugFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        console.log(doc.data());
        this.descriptions = doc.data();
      });
    },
    async getSports() {
      if (!this.institution?.sports || !Array.isArray(this.institution.sports)) {
        this.sports = [];
        return;
      }
      
      let sportsArray = [...this.institution.sports];

      // remove sports that are hidden
      sportsArray = sportsArray.filter(sport => {
        const sportName = sport.sport_name.toLowerCase().replace(/ /g, '_').replace(/\((.*?)\)/, '$1').trim();
        if (sport[`${sportName}_hidden`]) {
          return false;
        }
        return true;
      });

      sportsArray = sportsArray.map(sport => {
        const updatedSport = {};
        for (const [key, value] of Object.entries(sport)) {
          updatedSport[key] = value === "" ? null : value;
        }
        return updatedSport;
      });

      sportsArray = sportsArray.map(sport => ({
        ...sport,
        descr: sport.descr ? this.toTitleCase(sport.descr) : ''
      }));

      const allFields = new Set();
      sportsArray.forEach(sport => {
        Object.keys(sport).forEach(key => allFields.add(key));
      });

      sportsArray = sportsArray.map(sport => {
        const normalizedSport = {};
        Array.from(allFields).sort().forEach(field => {
          normalizedSport[field] = sport[field] || null;
        });
        return normalizedSport;
      });

      sportsArray.sort((a, b) => {
        const descrA = a.DESCR || '';
        const descrB = b.DESCR || '';
        return descrA.localeCompare(descrB);
      });

      for (const sport of sportsArray) {
        this.sports.push(sport);
      }
    },
    async getImages() {
      const slugFromURL = this.$route.params.slug;

      const imageURLsFromDB = collection(dbFireStore, 'institution_images');
      const q = query(imageURLsFromDB, where(documentId(), "==", slugFromURL));
      const docSnap = await getDocs(q);
      
      docSnap.forEach((doc) => {
        this.imagesData = doc.data();
      });
      
      if (Object.keys(this.imagesData).length > 0) { 
        this.imageURLsFromDB = this.imagesData;
      }

      const imageCredits = collection(dbFireStore, 'image_credits');
      const qIC = query(imageCredits, where(documentId(), "==", slugFromURL));
      const docSnapIc = await getDocs(qIC);
      
      docSnapIc.forEach((doc) => {
        this.imageCredits = doc.data();
      });

      try {
        const imageRef = doc(dbFireStore, 'institution_images_v2', slugFromURL);
        const docSnapV2 = await getDoc(imageRef);
        
        if (docSnapV2.exists()) {
          const data = docSnapV2.data();
          this.imagesv2 = data.images || [];
        } else {
          this.imagesv2 = [];
        }
      } catch (error) {
        console.error('Error loading v2 images:', error);
        this.imagesv2 = [];
      }
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
    toggleEditImages(){
      this.editMode = !this.editMode;
    },
    // getTestingPolicy() {
    //   let policies = {
    //     "Required": this.institution["admsReq"],
    //     "Considered": this.institution["admsConsider"],
    //     "Not used": this.institution["admsNotUsed"]
    //   }
    //   return policies;
    // },
    async addAlias() {
      if (!this.newAlias.trim()) return;

      if (!this.institution.aliases) {
        this.institution.aliases = [];
      }

      this.institution.aliases.push(this.newAlias.trim());

      try {
        await setDoc(doc(dbFireStore, 'manual_institution_data', this.institution["uri"]), {
          aliases: this.institution.aliases
        }, { merge: true });

        await setDoc(doc(dbFireStore, 'institutions_integrated', this.institution["uri"]), {
          aliases: this.institution.aliases
        }, { merge: true });

        this.newAlias = "";
      } catch (error) {
        console.error("Error saving alias:", error);
        this.institution.aliases.pop();
      }
    },
    markAliasAsEdited(index) {
      if (!this.editedAliasIndexes.includes(index)) {
        this.editedAliasIndexes.push(index);
      }
    },
    async saveEditedAlias(index) {
      try {
        await setDoc(doc(dbFireStore, 'manual_institution_data', this.institution["uri"]), {
          aliases: this.institution.aliases
        }, { merge: true });

        await setDoc(doc(dbFireStore, 'institutions_integrated', this.institution["uri"]), {
          aliases: this.institution.aliases
        }, { merge: true });

        this.editedAliasIndexes = this.editedAliasIndexes.filter(i => i !== index);
      } catch (error) {
        console.error("Error saving edited alias:", error);
      }
    },
    getIntercollegiateDivision(sport, gender) {
      const divisionKey = `${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`;
      const divisions = sport[divisionKey];
      if (!divisions) return null;
      
      return gender === 'men' ? divisions.INTC_MEN : divisions.INTC_WMN;
    },
    getIntramuralDivision(sport, gender) {
      const divisionKey = `${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`;
      const divisions = sport[divisionKey];
      if (!divisions) return null;
      
      return gender === 'men' ? divisions.INTM_MEN : divisions.INTM_WMN;
    },
    isUncategorizedSport(sport) {
      if (sport.hidden) return false;
      
      const divisionKey = `${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`;
      const divisions = sport[divisionKey];
      if (!divisions) return true;
      
      const result = Object.values(divisions).every(value => value === "");
      return result;
    },
    showImageCreditInfo(imageIndex) {
      this.selectedImageCredit = this.imageCredits[`image${imageIndex}`];
      this.selectedImageUrl = this.imageURLsFromDB[`image${imageIndex}`];
      this.showImageCreditDialog = true;
    },
    hasNCAAdivision(division) {
      return this.sports.some(sport => {
        const divisionKey = `${sport.sport_name.toLowerCase().replace(/ /g, '_')}_divisions`;
        const divisions = sport[divisionKey];
        if (!divisions) return false;
        
        return Object.values(divisions).some(value => value === division);
      });
    },
    savePanelStates() {
      localStorage.setItem('globalInstitutionPanelStates', JSON.stringify(this.expandedPanels));
    },
    loadPanelStates() {
      const savedStates = localStorage.getItem('globalInstitutionPanelStates');
      if (savedStates) {
        this.expandedPanels = JSON.parse(savedStates);
      } else {
        this.expandedPanels = {
          descriptions: [],
          costAid: false,
          sports: false,
          fieldsOfStudy: false,
          ethnicity: false
        };
      }
    },
    markDescriptionAsEdited(field, value) {
      this.editedDescriptions[field] = true;
      this.descriptions[field] = value;
    },
    async saveDescription(field, value) {
      this.savingDescription = field;
      try {
        const docRef = doc(dbFireStore, "Descriptions", this.institution.uri);
        await setDoc(docRef, {
          [field]: value 
        }, { merge: true });
        this.editedDescriptions[field] = false;
      } catch (error) {
        console.error("Error saving description:", error);
      } finally {
        this.savingDescription = null;
      }
    }
  },
  components: {
    SaveToListDialog,
    StatDisplay,
    TiptapInputA,
    SportItem,
    StorageImagesCollection,
  },
  computed: {
    menIntercollegiateSports() {
      return this.sports
        .filter(sport => {
          const division = this.getIntercollegiateDivision(sport, 'men');
          return !sport[`${sport.sport_name}_hidden`] && division && division !== 'None selected';
        })
        .sort((a, b) => a.sport_name.localeCompare(b.sport_name));
    },
    womenIntercollegiateSports() {
      return this.sports
        .filter(sport => {
          const division = this.getIntercollegiateDivision(sport, 'women');
          return !sport[`${sport.sport_name}_hidden`] && division && division !== 'None selected';
        })
        .sort((a, b) => a.sport_name.localeCompare(b.sport_name));
    },
    menIntramuralSports() {
      return this.sports
        .filter(sport => {
          const division = this.getIntramuralDivision(sport, 'men');
          return !sport[`${sport.sport_name}_hidden`] && division && division !== 'None selected';
        })
        .sort((a, b) => a.sport_name.localeCompare(b.sport_name));
    },
    womenIntramuralSports() {
      return this.sports
        .filter(sport => {
          const division = this.getIntramuralDivision(sport, 'women');
          return !sport[`${sport.sport_name}_hidden`] && division && division !== 'None selected';
        })
        .sort((a, b) => a.sport_name.localeCompare(b.sport_name));
    },
    hasAnyIntramural() {
      return this.sports.some(sport => 
        !sport[`${sport.sport_name}_hidden`] && (
          this.getIntramuralDivision(sport, 'men') || 
          this.getIntramuralDivision(sport, 'women')
        )
      );
    }
  },
};

</script>

<style>
  .cover-image {
    position: relative;
    aspect-ratio: 1;
    margin-bottom: -24px;
    img {
      object-fit: cover;
      object-position: center;
      width: 100%;
      height: 100%;
    }
  }

  .intro-block {
    position: relative;
    margin-top: -60vw;
    max-width: 1200px;
    z-index: 1;

    @media (max-width: 768px) {
      margin-top: -40vw;
    }

    @media (min-width: 960px) {
      margin: 0;
    }
  }

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

  @media (max-width: 767px) {
    .four-column-grid,
    .three-by-three-stat-grid {
      > div:not(:first-of-type) {
        margin-top: 24px;
      }
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
    margin-right: 8px;
    border-radius: 8px;
    font-size: 14px;
    color: #2a2a2a;
  }

  @media (min-width: 960px) {
    .location-links-images-container {
      display: grid;
      grid-template-columns: 1fr 2fr;
    }  
  }

  .section-container {
    background: white;
    padding: 16px 24px;
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

  .sports-container {
    margin-top: 12px;    

    h2 {
      font-size: 24px;
    }

    h3 {
      font-size: 20px;
    }
    
    h4 {
      font-weight: 500;
    }

    li {
      &:not(:first-of-type) {
        margin-top: 12px;
      }
    }
    .division {
      display: flex;
      gap: 8px;
      align-items: center
    }

    .subdivision {
      background: rgb(232, 232, 232);
      border-radius: 6px;
      font-size: 12px;
      padding: 2px 8px;
    }

    p {
      font-size: 14px;
    }

    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 24px;
  }

  .position-relative {
    position: relative;
  }

  .image-info-btn {
    position: absolute !important;
    bottom: 8px;
    right: 8px;
    background-color: rgba(255, 255, 255, 0.8) !important;
  }

  .dialog-image {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 4px;
  }

  p + p {
    margin-top: 12px;
  }


.pill {
  background-color: #f0f0f0;
  padding: 4px 8px;
}

.action-row {
  position: relative;
  display: flex; 
  flex-direction: row; 
  align-items: flex-end;
  justify-content: flex-end;
  margin-right: 4px;
}

.section-navigation {
  position: absolute;
  right: 12px;
  top: 57vw;
  z-index: 100;
  background-color: white;
  color: rgba(0, 0, 0, 0.87);
  min-width: 100px;
  width: auto;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: right;

  .v-field__outline {
    display: none !important;
  }

  @media (min-width: 768px) {
    top: 38vw;
  }

}

.section-navigation.is-fixed {
  position: fixed;
  top: 80px;
}

.add-to-list-mobile {
  position: absolute;
  top: 12px;
  right: 16px;
}

</style>