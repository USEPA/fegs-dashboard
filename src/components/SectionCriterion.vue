<template>
  <div>
    <div style="display: flex;">
      <BaseCheckbox
        style="margin-bottom: .5rem;"
        label="Show results"
        :isChecked="showResults"
        @change="onShowResultChange"
      />
    </div>
    <div style="display: flex;" class="full">
      <TableCriterion :showResults="showResults"/>
      <BaseChartPie
        style="margin-left: .5rem;"
        :width="700"
        :height="340"
        :data="pieContent.data"
        :colors="pieContent.colors"
      />
    </div>
  </div>
</template>


<script>
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import TableCriterion from './TableCriterion.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionCriterion',
  components: {
    BaseChartPie,
    BaseCheckbox,
    TableCriterion,
  },
  computed: {
    showResults() {
      return project.data.criterionSection.showResults
    },
    pieContent() {
      return project.getCriterionPieContent({ short: true })
    },
  },
  methods: {
    onShowResultChange(event) {
      project.setCriterionShowResults(event)
    },
  },
}
</script>

<style scoped>

</style>