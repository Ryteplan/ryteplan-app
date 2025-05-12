<template>
  <v-dialog
    :model-value="Boolean(dialogTemplate)"
    @update:model-value="hide"
    max-width="400"
  >
    <component :is="components[dialogTemplate]" @close="hide" />
  </v-dialog>
</template>

<script setup>
import { defineModel, defineComponent } from 'vue'
import LoginRequired from './ActionResponseDialogs/LoginRequired.vue'
import AccountSetup from './ActionResponseDialogs/AccountSetup.vue'
import BasicUser from './ActionResponseDialogs/BasicUser.vue'

const dialogTemplate = defineModel({
  type: String,
  required: true,
  default: ''
})

const components = {
  "loggedIn": LoginRequired,
  "accountSetup": AccountSetup,
  "basicUser": BasicUser,
  "olderThan13": BasicUser
}

defineComponent({
  components: {
    LoginRequired
  }
})

// const showDialog = ref(false)

// const show = () => {
//   showDialog.value = true
// }

const hide = () => {
  dialogTemplate.value = ''
}

</script>