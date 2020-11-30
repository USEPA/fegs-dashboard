<template>
  <div>
    <div style="display: flex;">
      <BaseCheckbox
        style="margin-bottom: .5rem;"
        label="Show definitions"
        :isChecked="showDefinitions"
        @change="onShowDefinitionChange"
      />
      <BaseCheckbox
        style="margin-bottom: .5rem; margin-left: 1rem;"
        label="Show results"
        :isChecked="showResults"
        @change="onShowResultChange"
      />
    </div>
    <div class="full">
      <TableAttribute
        :showDefinitions="showDefinitions"
        :showResults="showResults"
      />
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
      return project.data.attributeSection.showDefs
    },
    showResults() {
      return project.data.attributeSection.showResults
    },
    pieContent() {
      return project.getAttributePieContent()
    },
  },
  methods: {
    onShowDefinitionChange(event) {
      project.setAttributeShowDefs(event)
    },
    onShowResultChange(event) {
      project.setAttributeShowResults(event)
    },
  },
}
</script>

<style scoped>

</style>