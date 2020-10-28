<template>
  <div style="display: flex; align-items: center;">
    <div style="margin-right: .5rem;">Title:</div>
    <BaseField startContent="My Project" v-on:commit="setName"/>
  </div>
</template>


<script>
import BaseField from './BaseField.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionProject',
  components: {
    BaseField,
  },
  // data() {
  //   return {

  //   }
  // },
  computed: {

  },
  methods: {
    setName(event) {
      project.setProjectName(event)
    }
  },
}
</script>

<style scoped>

</style>
