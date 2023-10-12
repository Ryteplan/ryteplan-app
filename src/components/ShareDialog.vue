<template>
  <v-dialog
    v-model="show"
    width="400px"
  >
    <v-card>
      <div class="pa-8">
        <div>        
          <h2 class="mb-6 text-center">Share list to</h2>
            <v-text-field
              v-model="emailShareAddress"
              label="Enter email address"
              density="compact"
              variant="solo"
              single-line
              hide-details
              clearable
            ></v-text-field>
            <v-btn
              class="mt-2" 
              color="primary" 
              block 
              @click="shareList(emailShareAddress)"
            >
              Share
            </v-btn>
        </div>
      </div>
      <v-card-actions>
        <v-btn 
          color="primary" 
          block 
          @click="show=false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: "ShareDialog",
  props: {
     value: Boolean,
     institutionId: String,
     selectedRows: Object
  },
  beforeMount() {
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  data() {
    return {
      emailShareAddress: "",
    }
  },
  methods: {
    shareList(emailAddress) {
      console.log(emailAddress);
    }
  }
}
</script>