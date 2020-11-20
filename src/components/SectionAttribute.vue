<template>
  <div>
    <div style="display: flex;">
      <BaseCheckbox
        style="margin-bottom: .5rem;"
        label="Show definitions"
        @click="onClick"
      />
    </div>
    <div class="full">
      <TableAttribute :showDefinitions="showDefinitions"/>
    </div>
    <div class="full">
      <BaseChartPie
        title="Environmental Attributes Relative Priority"
        :width="1080"
        :height="300"
        :data="pieContent.data"
        :colors="pieContent.colors"
      />
    </div>
  </div>
</template>


<script>
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import TableAttribute from './TableAttribute.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionAttribute',
  components: {
    BaseChartPie,
    BaseCheckbox,
    TableAttribute,
  },
  computed: {
    showDefinitions() {
      console.log(project.data.attributeSection.showDefs)
      return project.data.attributeSection.showDefs
    },
    pieContent() {
      return project.getAttributePieContent()
    },
  },
  methods: {
    onClick(event) {
      project.setAttributeShowDefs(event)
    },
  },
}
</script>

<style scoped>

</style>