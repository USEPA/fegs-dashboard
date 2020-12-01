<template>
  <div>
    <div
      for="project-name"
      style="margin-bottom: .5rem;"
    >
      Title
    </div>
    <BaseField
      id="project-name"
      :value="projectName"
      @change="setProjectName"
    />
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
  computed: {
    projectName() {
      return project.data.meta.name
    }
  },
  methods: {
    setProjectName(event) {
      project.setProjectName(event)
    }
  },
}
</script>

<style scoped>

</style>
