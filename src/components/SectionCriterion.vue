<template>
  <div>
    <div style="display: flex;" class="full">
      <TableCriterion/>
      <BaseChartPie
        style="margin-left: 1rem;"
        :width="780"
        :height="340"
        :data="pieContent.data"
        :colors="pieContent.colors"
      />
    </div>
  </div>
</template>


<script>
import BaseChartPie from './BaseChartPie.vue'
import TableCriterion from './TableCriterion.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionCriterion',
  components: {
    BaseChartPie,
    TableCriterion,
  },
  computed: {
    pieContent() {
      return project.getCriterionPieContent({ short: true })
    },
  },
}
</script>

<style scoped>

</style>